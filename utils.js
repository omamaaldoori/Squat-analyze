/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   Yardımcı Fonksiyonlar
═══════════════════════════════════════ */

/* ── UI Yardımcıları ── */
function setMsg(m) { document.getElementById('smsg').textContent = m }
function setP(v)   { document.getElementById('pfill').style.width = v + '%' }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

/* ── Açı Hesabı ── */
function calcAngle(a, v, b) {
  const v1  = { x: a.x - v.x, y: a.y - v.y }
  const v2  = { x: b.x - v.x, y: b.y - v.y }
  const dot = v1.x * v2.x + v1.y * v2.y
  const mag = Math.sqrt(v1.x ** 2 + v1.y ** 2) * Math.sqrt(v2.x ** 2 + v2.y ** 2)
  if (!mag) return 0
  return Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI
}

/* ── Skor Hesabı ── */
function score(angle, min, max) {
  if (angle >= min && angle <= max) return 100
  const dev = Math.abs(angle - (angle < min ? min : max))
  const tol = (max - min) * 0.5 + 25
  return Math.max(0, Math.round(100 - (dev / tol) * 100))
}
