/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   Demo: Mock Landmark Simülasyonu
   
   t: 0→1 arasında normalized zaman
   Faz: 0-0.10 DURUŞ → 0.10-0.35 İNİŞ →
        0.35-0.55 ÇÖKÜŞ → 0.55-0.65 ÇIKIŞ →
        0.65-0.72 DURUŞ → 0.72-0.87 2. SQUAT →
        0.87-1 DURUŞ
═══════════════════════════════════════ */

function mockLM(t) {
  let dip = 0

  if (t < 0.10) {
    // Duruş
    dip = 0
  } else if (t < 0.35) {
    // İniş
    const p = (t - 0.10) / 0.25
    dip = p * 0.22
  } else if (t < 0.55) {
    // Çöküş pozisyonu
    dip = 0.22
  } else if (t < 0.65) {
    // Çıkış
    const p = (t - 0.55) / 0.10
    dip = 0.22 * (1 - p)
  } else if (t < 0.72) {
    // Duruş
    dip = 0
  } else if (t < 0.87) {
    // İkinci squat (sinüs eğrisi)
    const p = (t - 0.72) / 0.15
    dip = Math.sin(p * Math.PI) * 0.20
  } else {
    dip = 0
  }

  return [
    // 0-10: yüz
    { x: .50, y: .06, visibility: 1   }, { x: .48, y: .05, visibility: .9 },
    { x: .47, y: .05, visibility: .9  }, { x: .46, y: .05, visibility: .9 },
    { x: .52, y: .05, visibility: .9  }, { x: .53, y: .05, visibility: .9 },
    { x: .54, y: .05, visibility: .9  }, { x: .45, y: .06, visibility: .8 },
    { x: .55, y: .06, visibility: .8  }, { x: .48, y: .08, visibility: .8 },
    { x: .52, y: .08, visibility: .8  },
    // 11-12: omuz
    { x: .37, y: .29, visibility: 1   }, { x: .63, y: .29, visibility: 1 },
    // 13-16: kol
    { x: .31, y: .43, visibility: .9  }, { x: .69, y: .43, visibility: .9 },
    { x: .27, y: .57, visibility: .8  }, { x: .73, y: .57, visibility: .8 },
    // 17-22: el
    { x: .25, y: .59, visibility: .7  }, { x: .75, y: .59, visibility: .7 },
    { x: .26, y: .60, visibility: .7  }, { x: .74, y: .60, visibility: .7 },
    { x: .27, y: .61, visibility: .7  }, { x: .73, y: .61, visibility: .7 },
    // 23-24: kalça — dip ile aşağı iner
    { x: .42, y: .53 + dip,       visibility: 1 },
    { x: .58, y: .53 + dip,       visibility: 1 },
    // 25-26: diz — daha fazla iner (diz bükülür)
    { x: .41, y: .69 + dip * 0.6, visibility: 1 },
    { x: .59, y: .69 + dip * 0.6, visibility: 1 },
    // 27-28: ayak bileği — sabit
    { x: .40, y: .84, visibility: 1 }, { x: .60, y: .84, visibility: 1 },
    // 29-32: ayak
    { x: .39, y: .87, visibility: .8 }, { x: .61, y: .87, visibility: .8 },
    { x: .38, y: .86, visibility: .7 }, { x: .62, y: .86, visibility: .7 },
  ]
}
