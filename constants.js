/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   Sabitler & Konfigürasyon
   
   FAZ TESPİT MANTIĞI:
   - DURUŞ    (standing):   Ort. diz açısı > 155°
   - GEÇİŞ    (transition): 110° – 155° arası
   - ÇÖKÜŞ    (squat):      Ort. diz açısı < 110°
═══════════════════════════════════════ */

/* ── Duruş fazı eklem kriterleri ── */
const JOINTS_STANDING = [
  { name: 'Sağ Diz',    p1: 24, v: 26, p2: 28, min: 160, max: 185 },
  { name: 'Sol Diz',    p1: 23, v: 25, p2: 27, min: 160, max: 185 },
  { name: 'Sağ Kalça',  p1: 12, v: 24, p2: 26, min: 155, max: 185 },
  { name: 'Sol Kalça',  p1: 11, v: 23, p2: 25, min: 155, max: 185 },
  { name: 'Sağ Omurga', p1: 12, v: 24, p2: 28, min: 155, max: 185 },
  { name: 'Sol Omurga', p1: 11, v: 23, p2: 27, min: 155, max: 185 },
]

/* ── Çöküş fazı eklem kriterleri ── */
const JOINTS_SQUAT = [
  { name: 'Sağ Diz',    p1: 24, v: 26, p2: 28, min: 65,  max: 115 },
  { name: 'Sol Diz',    p1: 23, v: 25, p2: 27, min: 65,  max: 115 },
  { name: 'Sağ Kalça',  p1: 12, v: 24, p2: 26, min: 65,  max: 110 },
  { name: 'Sol Kalça',  p1: 11, v: 23, p2: 25, min: 65,  max: 110 },
  { name: 'Sağ Omurga', p1: 12, v: 24, p2: 28, min: 135, max: 185 },
  { name: 'Sol Omurga', p1: 11, v: 23, p2: 27, min: 135, max: 185 },
]

/* Raporlama default (çöküş fazı) */
const JOINTS = JOINTS_SQUAT

/* ── Hata Tanımları ── */
const ERRORS = [
  { name: 'Diz İçe Çöküşü',   desc: 'Çöküş fazında dizler içe doğru kıvrılıyor.',    joint: 'Sağ Diz',     phase: 'squat'    },
  { name: 'Yetersiz Çöküş',   desc: 'Çöküş fazında yeterince aşağı inilmiyor.',       joint: 'Sağ Diz',     phase: 'squat'    },
  { name: 'Aşırı Öne Eğilme', desc: 'Çöküş fazında gövde çok öne eğiliyor.',          joint: 'Sağ Omurga',  phase: 'squat'    },
  { name: 'Duruş Bozukluğu',  desc: 'Duruş fazında bacaklar tam düzelmedi.',           joint: 'Sağ Diz',     phase: 'standing' },
  { name: 'Topuk Kalkması',   desc: 'Çöküş sırasında topuklar yerden kalkıyor.',       joint: 'Sol Kalça',   phase: 'squat'    },
]

/* ── İskelet Bağlantıları (alt vücut + gövde) ── */
const CONNS = [
  [11, 12], [11, 23], [12, 24], [23, 24],   // gövde
  [23, 25], [25, 27], [27, 29], [27, 31],   // sol bacak
  [24, 26], [26, 28], [28, 30], [28, 32],   // sağ bacak
  [11, 13], [13, 15], [12, 14], [14, 16],   // kollar
]
