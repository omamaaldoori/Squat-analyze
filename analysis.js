/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   Analiz Pipeline (MediaPipe)
═══════════════════════════════════════ */

/* ── Analiz Başlat / Durdur ── */
async function startAnalysis() {
  if (analyzing) { stopAnalysis(); return }

  frames = []; abortFlag = false; analyzing = true
  phaseFrames = { standing: [], squat: [] }
  repCount = 0; wasInSquat = false
  document.getElementById('sdot').className  = 'dot go'
  document.getElementById('abtn').textContent = '⏹ Durdur'

  // MediaPipe yükle
  setMsg('MediaPipe yükleniyor…'); setP(5)
  let tries = 0
  while (!window.Pose && tries < 80) { await sleep(250); tries++ }

  if (!window.Pose) {
    setMsg('MediaPipe yüklenemedi. Lütfen internet bağlantınızı kontrol edin.')
    analyzing = false
    document.getElementById('sdot').className  = 'dot'
    document.getElementById('abtn').textContent = 'Analiz Et →'
    return
  }

  setMsg('Model başlatılıyor…'); setP(15)
  poseInst = new window.Pose({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
  })
  poseInst.setOptions({
    modelComplexity:        1,
    smoothLandmarks:        true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence:  0.5,
  })
  poseInst.onResults(r => {
    if (!r.poseLandmarks) return
    drawPose(r.poseLandmarks)
    frames.push(calcFrame(r.poseLandmarks))
    const pct = vid.duration ? Math.round((vid.currentTime / vid.duration) * 85) : 0
    setP(15 + pct)
    setMsg(`Canlı analiz — ${Math.round(vid.currentTime)}s / ${Math.round(vid.duration || 0)}s`)
  })

  await poseInst.initialize()
  setMsg('Video oynat — eklem açıları canlı görünecek'); setP(20)

  vid.play()
  startLiveLoop()

  vid.onended = async () => {
    stopLiveLoop()
    if (!abortFlag && frames.length) await finalize()
  }
}

function stopAnalysis() {
  abortFlag = true
  stopLiveLoop()
  if (poseInst) { try { poseInst.close() } catch (_) {} poseInst = null }
  vid.pause()
  analyzing = false
  document.getElementById('sdot').className  = 'dot'
  document.getElementById('abtn').textContent = 'Analiz Et →'
  setMsg('Durduruldu'); setP(0)
}

/* ── RAF Döngüsü ── */
function startLiveLoop() {
  const loop = async () => {
    if (abortFlag || vid.paused || vid.ended) return
    if (vid.currentTime !== lastSent) {
      lastSent = vid.currentTime
      try { await poseInst.send({ image: vid }) } catch (_) {}
    }
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

function stopLiveLoop() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
}

/* ── Frame Skoru (faza göre joint seti) ── */
function calcFrame(lms) {
  const phase    = detectPhase(lms)
  const jointSet = phase === 'squat'    ? JOINTS_SQUAT :
                   phase === 'standing' ? JOINTS_STANDING : JOINTS_SQUAT

  const sc = {}, an = {}
  jointSet.forEach(j => {
    const lp1 = lms[j.p1], lv = lms[j.v], lp2 = lms[j.p2]
    const vis = Math.min(lp1?.visibility ?? 1, lv?.visibility ?? 1, lp2?.visibility ?? 1)
    if (!lp1 || !lv || !lp2 || vis < 0.3) { sc[j.name] = 70; return }
    const a     = calcAngle(lp1, lv, lp2)
    sc[j.name]  = score(a, j.min, j.max)
    an[j.name]  = Math.round(a)
  })
  sc._ov    = Math.round(jointSet.map(j => sc[j.name] || 70).reduce((a, b) => a + b, 0) / jointSet.length)
  sc._phase = phase

  if (phase !== 'transition') phaseFrames[phase].push({ sc, an })

  return { sc, an, phase }
}

/* ── Finalize: Rapor Üret ── */
async function finalize() {
  setP(88); setMsg('Rapor hesaplanıyor…')

  const squatF = phaseFrames.squat.length    ? phaseFrames.squat    : frames
  const standF = phaseFrames.standing.length ? phaseFrames.standing : frames

  // Çöküş fazı skoru
  const squatSc = {}, squatAn = {}
  JOINTS_SQUAT.forEach(j => {
    const vs = squatF.map(f => f.sc[j.name]).filter(v => v != null)
    const va = squatF.map(f => f.an[j.name]).filter(v => v != null)
    squatSc[j.name] = vs.length ? Math.round(vs.reduce((a, b) => a + b, 0) / vs.length) : 70
    squatAn[j.name] = va.length ? Math.round(va.reduce((a, b) => a + b, 0) / va.length) : 0
  })

  // Duruş fazı skoru
  const standSc = {}, standAn = {}
  JOINTS_STANDING.forEach(j => {
    const vs = standF.map(f => f.sc[j.name]).filter(v => v != null)
    const va = standF.map(f => f.an[j.name]).filter(v => v != null)
    standSc[j.name] = vs.length ? Math.round(vs.reduce((a, b) => a + b, 0) / vs.length) : 70
    standAn[j.name] = va.length ? Math.round(va.reduce((a, b) => a + b, 0) / va.length) : 0
  })

  // Genel skor: çöküş %65 ağırlık, duruş %35
  const squatOverall = Math.round(JOINTS_SQUAT.map(j => squatSc[j.name]).reduce((a, b) => a + b, 0) / JOINTS_SQUAT.length)
  const standOverall = Math.round(JOINTS_STANDING.map(j => standSc[j.name]).reduce((a, b) => a + b, 0) / JOINTS_STANDING.length)
  const overall      = Math.round(squatOverall * 0.65 + standOverall * 0.35)

  // Temporal stabilite
  const fovs      = frames.map(f => f.sc._ov)
  const variance  = fovs.reduce((s, v) => s + (v - overall) ** 2, 0) / fovs.length
  const stability = Math.max(0, Math.round(100 - Math.sqrt(variance) * 1.5))

  // Hata tespiti
  const errors = ERRORS.filter(e => {
    const sc = e.phase === 'standing' ? standSc : squatSc
    return (sc[e.joint] ?? 70) < 68
  }).map(e => ({
    ...e, sev: (() => {
      const sc = e.phase === 'standing' ? standSc : squatSc
      return (sc[e.joint] ?? 70) < 45 ? 'h' : 'm'
    })()
  }))

  const cls = overall >= 80 ? 'correct' : overall >= 60 ? 'partial' : 'incorrect'

  renderResults(overall, stability, squatSc, squatAn, errors, cls, squatOverall, standOverall, repCount)
  setP(93); setMsg('Rapor tamamlanıyor…')
  setP(100); setMsg('Analiz tamamlandı ✓')
  analyzing = false
  document.getElementById('sdot').className  = 'dot ok'
  document.getElementById('abtn').textContent = '↺ Yeniden Analiz'
}
