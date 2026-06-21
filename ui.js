/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   UI Etkileşimleri & Upload
═══════════════════════════════════════ */

/* ── Drag & Drop / Dosya Seç ── */
document.getElementById('fv').onchange = e => {
  if (e.target.files[0]) loadVideo(e.target.files[0])
}

const db = document.getElementById('dropbox')
db.ondragover  = e => { e.preventDefault(); db.classList.add('over') }
db.ondragleave = ()  => db.classList.remove('over')
db.ondrop      = e  => {
  e.preventDefault()
  db.classList.remove('over')
  if (e.dataTransfer.files[0]) loadVideo(e.dataTransfer.files[0])
}

/* ── Video Yükleme ── */
function loadVideo(file) {
  const vidEl = document.getElementById('vid')
  vidEl.src   = URL.createObjectURL(file)
  document.getElementById('vname').textContent = file.name
  showVzone()
}

/* ── Görünüm Geçişleri ── */
function showVzone() {
  document.getElementById('upload').style.display = 'none'
  document.getElementById('vzone').classList.add('show')
}

/* ── Sıfırla ── */
function reset() {
  abortFlag = true
  stopLiveLoop()
  if (poseInst) { try { poseInst.close() } catch (_) {} poseInst = null }

  const vidEl = document.getElementById('vid')
  vidEl.pause(); vidEl.src = ''

  document.getElementById('upload').style.display = ''
  document.getElementById('vzone').classList.remove('show')
  document.getElementById('rpanel-inner').classList.add('hidden')
  document.getElementById('empty').style.display  = 'block'
  document.getElementById('sdot').className        = 'dot'
  document.getElementById('abtn').textContent      = 'Analiz Et →'


  // Faz state sıfırla
  currentPhase = 'standing'
  repCount     = 0
  wasInSquat   = false
  phaseFrames  = { standing: [], squat: [] }
  hidePhaseBadge()

  frames    = []
  analyzing = false
  clearCvs()
  setP(0)
  setMsg('')
}
