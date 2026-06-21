/* ═══════════════════════════════════════
   SportForm AI — Squat Analizi v4
   Uygulama Durumu (State)
═══════════════════════════════════════ */

/* ── Faz Durumu ── */
let currentPhase = 'standing'   // 'standing' | 'transition' | 'squat'
let repCount     = 0
let wasInSquat   = false
let phaseFrames  = { standing: [], squat: [] }

/* ── Analiz Durumu ── */
let analyzing = false
let frames    = []
let abortFlag = false

/* ── MediaPipe & RAF ── */
let poseInst = null
let rafId    = null
let lastSent = 0
