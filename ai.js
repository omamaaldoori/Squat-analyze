/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   Sonuç Render
═══════════════════════════════════════ */

function renderResults(overall, stability, sc, an, errors, cls, squatSc, standSc, reps) {
  document.getElementById('empty').style.display = 'none'
  const p = document.getElementById('rpanel-inner')
  p.classList.remove('hidden')

  const circ = 2 * Math.PI * 40
  const off  = circ - (overall / 100) * circ
  const col  = overall >= 80 ? '#4fffb0' : overall >= 60 ? '#ffb74d' : '#ff6b6b'
  const vl   = { correct: '✓ Doğru Form', partial: '~ Geliştirilmeli', incorrect: '✗ Hatalı Form' }[cls]
  const vc   = { correct: 'vc', partial: 'vp', incorrect: 'vi' }[cls]

  const jRows = JOINTS_SQUAT.map(j => {
    const s  = sc[j.name] ?? 70
    const a  = an[j.name] ?? 0
    const bc = s >= 80 ? 'bg' : s >= 60 ? 'byw' : 'br'
    const ic = s >= 80 ? '✓' : s >= 60 ? '~' : '✗'
    return `<div class="jrow">
      <span class="jn">${j.name}</span>
      <div class="bw"><div class="b ${bc}" style="width:${s}%"></div></div>
      <span class="ja">${a}°</span>
      <span class="ji">${ic}</span>
    </div>`
  }).join('')

  const eCrds = errors.length
    ? errors.map(e => `
    <div class="ecard ${e.sev === 'h' ? 'eh' : 'em'}">
      <div class="elbl">${e.sev === 'h' ? 'Yüksek' : 'Orta'} · ${e.phase === 'squat' ? 'Çöküş Fazı' : 'Duruş Fazı'}</div>
      <div class="en">${e.name}</div>
      <div class="ed">${e.desc}</div>
    </div>`).join('')
    : `<div style="font-size:12px;color:#4fffb0;padding:8px 0">✓ Belirgin hata tespit edilmedi</div>`

  p.innerHTML = `
    <div class="ring-wrap">
      <div style="width:96px;height:96px;position:relative;margin:0 auto 10px">
        <svg class="ring-svg" viewBox="0 0 96 96" width="96" height="96">
          <circle class="rb" cx="48" cy="48" r="40"/>
          <circle class="rf" cx="48" cy="48" r="40" stroke="${col}"
            stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
        </svg>
        <div class="snum">
          <span class="sval" style="color:${col}">${overall}</span>
          <span class="ssub">/ 100</span>
        </div>
      </div>
    </div>
    <div class="verdict ${vc}">${vl}</div>
    <div style="font-size:11px;color:#6b7385;text-align:center;margin-bottom:12px">Squat · ${reps} Rep · ${frames.length} frame</div>

    <div class="sec">Faz Skoru</div>
    <div class="phase-grid">
      <div class="pcell standing-cell">
        <div class="pclbl">▲ Duruş</div>
        <div class="pcval" style="color:${standSc >= 80 ? '#4fffb0' : standSc >= 60 ? '#ffb74d' : '#ff6b6b'}">${standSc}</div>
      </div>
      <div class="pcell squat-cell">
        <div class="pclbl">▼ Çöküş</div>
        <div class="pcval" style="color:${squatSc >= 80 ? '#4fffb0' : squatSc >= 60 ? '#ffb74d' : '#ff6b6b'}">${squatSc}</div>
      </div>
    </div>

    <div class="sgrid">
      <div class="scell"><div class="sv" style="color:${col}">${overall}%</div><div class="sl">Genel Skor</div></div>
      <div class="scell"><div class="sv" style="color:${stability >= 70 ? '#4fffb0' : '#ffb74d'}">${stability}%</div><div class="sl">Stabilite</div></div>
      <div class="scell"><div class="sv" style="color:#4fffb0">${reps}</div><div class="sl">Rep Sayısı</div></div>
      <div class="scell"><div class="sv">${errors.length}</div><div class="sl">Hata</div></div>
    </div>

    <div class="sec">Çöküş Fazı — Eklem Açıları</div>
    ${jRows}

    <div class="sec">Hata Tespiti</div>
    ${eCrds}
  `
}
