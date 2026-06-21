/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   Faz Tespiti & Pose Çizimi
═══════════════════════════════════════ */

/* ── Canvas Elemanları ── */
const vid  = document.getElementById('vid')
const cvs  = document.getElementById('cvs')
const ctx  = cvs.getContext('2d')
const wrap = document.getElementById('vwrap')

/* ── Canvas Yardımcıları ── */
function getVidRect() {
  /* Video elementinin gerçek render boyutu (letterbox dahil).
     videoWidth/Height: medyanın native çözünürlüğü
     clientWidth/Height: DOM elementi boyutu */
  const vw = vid.videoWidth  || vid.clientWidth  || 1
  const vh = vid.videoHeight || vid.clientHeight || 1
  const ew = vid.clientWidth
  const eh = vid.clientHeight

  const scale = Math.min(ew / vw, eh / vh)
  const rw    = vw * scale
  const rh    = vh * scale
  const rx    = (ew - rw) / 2
  const ry    = (eh - rh) / 2

  return { x: rx, y: ry, w: rw, h: rh }
}

function positionCanvas() {
  /* Canvas'ı video elementi ile aynı boyut ve konuma getir */
  const vidEl  = vid.getBoundingClientRect()
  const wrapEl = wrap.getBoundingClientRect()
  const left   = vidEl.left - wrapEl.left
  const top    = vidEl.top  - wrapEl.top

  cvs.style.left   = left + 'px'
  cvs.style.top    = top  + 'px'
  cvs.style.width  = vidEl.width  + 'px'
  cvs.style.height = vidEl.height + 'px'
  cvs.width        = vidEl.width
  cvs.height       = vidEl.height
}

function clearCvs() { ctx.clearRect(0, 0, cvs.width, cvs.height) }

/* ── Canvas Olay Dinleyicileri ── */
vid.addEventListener('loadedmetadata', positionCanvas)
vid.addEventListener('resize', positionCanvas)
window.addEventListener('resize', positionCanvas)

/* ── Faz Tespiti ── */
function detectPhase(landmarks) {
  const lRKnee = { p1: landmarks[24], v: landmarks[26], p2: landmarks[28] }
  const lLKnee = { p1: landmarks[23], v: landmarks[25], p2: landmarks[27] }

  let angles = []
  if (lRKnee.p1 && lRKnee.v && lRKnee.p2 && (lRKnee.v.visibility ?? 1) > 0.3)
    angles.push(calcAngle(lRKnee.p1, lRKnee.v, lRKnee.p2))
  if (lLKnee.p1 && lLKnee.v && lLKnee.p2 && (lLKnee.v.visibility ?? 1) > 0.3)
    angles.push(calcAngle(lLKnee.p1, lLKnee.v, lLKnee.p2))

  if (!angles.length) return 'transition'

  const avgKnee = angles.reduce((a, b) => a + b, 0) / angles.length

  if (avgKnee >= 155) return 'standing'
  if (avgKnee <= 110) return 'squat'
  return 'transition'
}

/* ── Faz UI Güncelle ── */
function updatePhaseUI(phase) {
  const badge   = document.getElementById('phaseBadge')
  badge.style.display = 'block'

  if (phase === 'standing') {
    badge.className   = 'phase-badge standing'
    badge.textContent = '▲ DURUŞ'
  } else if (phase === 'squat') {
    badge.className   = 'phase-badge squat'
    badge.textContent = '▼ ÇÖKÜŞ'
  } else {
    badge.className   = 'phase-badge transition'
    badge.textContent = '↕ GEÇİŞ'
  }
}

function hidePhaseBadge() {
  document.getElementById('phaseBadge').style.display = 'none'
}

/* ── Rep Sayacı ── */
function updateRepCount(newPhase) {
  if (wasInSquat && newPhase === 'standing') repCount++
  wasInSquat = (newPhase === 'squat')
}

/* ── Pose Çizimi ── */
function drawPose(landmarks) {
  positionCanvas()
  clearCvs()
  if (!landmarks || !landmarks.length) return

  /* Faz tespiti & UI güncelle */
  const phase = detectPhase(landmarks)
  updateRepCount(phase)
  currentPhase = phase
  updatePhaseUI(phase)

  /* Aktif joint setini seç */
  const activeJoints = phase === 'squat'    ? JOINTS_SQUAT :
                       phase === 'standing' ? JOINTS_STANDING : JOINTS_SQUAT

  /* Faz rengi: duruş=yeşil, çöküş=mor, geçiş=turuncu */
  const phaseAccent = phase === 'standing' ? 'rgba(79,255,176,0.45)' :
                      phase === 'squat'    ? 'rgba(124,111,255,0.45)' :
                                            'rgba(255,183,77,0.35)'

  /* Landmark (x,y) 0-1 normalize → piksel koordinatı */
  const r = getVidRect()
  function lmPx(lm) {
    return { px: r.x + lm.x * r.w, py: r.y + lm.y * r.h }
  }

  /* Eklem renk haritası */
  const colorOf = {}
  activeJoints.forEach(j => {
    const lp1 = landmarks[j.p1], lv = landmarks[j.v], lp2 = landmarks[j.p2]
    if (!lp1 || !lv || !lp2) return
    const vis = Math.min(lp1.visibility ?? 1, lv.visibility ?? 1, lp2.visibility ?? 1)
    if (vis < 0.3) return
    const a = calcAngle(lp1, lv, lp2)
    const s = score(a, j.min, j.max)
    const c = s >= 80 ? '#4fffb0' : s >= 60 ? '#ffb74d' : '#ff6b6b'
    ;[j.p1, j.v, j.p2].forEach(i => {
      const prev = colorOf[i]
      if (!prev || (prev === '#4fffb0') || (prev === '#ffb74d' && c === '#ff6b6b')) colorOf[i] = c
    })
  })

  /* 1. Bağlantı çizgileri */
  ctx.lineWidth = 2.5
  CONNS.forEach(([a, b]) => {
    const lA = landmarks[a], lB = landmarks[b]
    if (!lA || !lB || (lA.visibility ?? 1) < 0.35 || (lB.visibility ?? 1) < 0.35) return
    const { px: ax, py: ay } = lmPx(lA)
    const { px: bx, py: by } = lmPx(lB)
    ctx.strokeStyle = phaseAccent
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke()
  })

  /* 2. Landmark noktaları */
  landmarks.forEach((lm, i) => {
    if (!lm || (lm.visibility ?? 1) < 0.35) return
    const { px, py } = lmPx(lm)
    const isKey   = JOINTS.some(j => j.v === i)
    const isJoint = JOINTS.some(j => [j.p1, j.v, j.p2].includes(i))
    const r2      = isKey ? 8 : isJoint ? 5 : 3
    ctx.beginPath(); ctx.arc(px, py, r2, 0, Math.PI * 2)
    ctx.fillStyle = colorOf[i] || (isJoint ? '#4fffb0' : 'rgba(79,255,176,0.35)')
    ctx.fill()
    if (isKey && colorOf[i]) {
      ctx.strokeStyle = colorOf[i]
      ctx.lineWidth   = 2
      ctx.beginPath(); ctx.arc(px, py, r2 + 3, 0, Math.PI * 2); ctx.stroke()
    }
  })

  /* 3. Açı etiketleri */
  const drawn = new Set()
  activeJoints.forEach(j => {
    if (drawn.has(j.v)) return
    const lp1 = landmarks[j.p1], lv = landmarks[j.v], lp2 = landmarks[j.p2]
    if (!lp1 || !lv || !lp2 || (lv.visibility ?? 1) < 0.35) return
    const a   = Math.round(calcAngle(lp1, lv, lp2))
    const s   = score(a, j.min, j.max)
    const col = s >= 80 ? '#4fffb0' : s >= 60 ? '#ffb74d' : '#ff6b6b'
    const { px, py } = lmPx(lv)
    const label = `${a}°`

    ctx.font = 'bold 12px monospace'
    const tw = ctx.measureText(label).width
    const bx = px - tw / 2 - 5
    const by = py - 26

    ctx.fillStyle = 'rgba(13,15,20,0.82)'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(bx, by, tw + 10, 18, 4)
    else ctx.rect(bx, by, tw + 10, 18)
    ctx.fill()

    ctx.strokeStyle = col
    ctx.lineWidth   = 1.5
    ctx.stroke()

    ctx.fillStyle = col
    ctx.fillText(label, px - tw / 2, by + 13)

    drawn.add(j.v)
  })
}
