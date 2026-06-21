# SportForm AI — Squat Analyzer v4

A browser-based squat form analyzer. Upload an **MP4 video** of your squat and the app measures your joint angles frame-by-frame using **MediaPipe Pose** — no server, no account, everything runs locally in the browser.

---

## How to Use

**1. Upload your video**
Click **"Select Video"** or drag & drop an MP4 file onto the upload area.

**2. Press Analyze →**
MediaPipe loads and begins processing the video frame by frame. A live skeleton overlay appears on the video showing joint angles in real time.

**3. Read your results**
When the video ends, the right panel shows your full report:
- Overall form score (0–100)
- Standing phase score & Squat phase score
- Per-joint angle measurements
- Rep count
- Stability score
- Detected errors with severity

**4. Start over**
Click **↩ New Video** to upload a different clip.

---

## What Gets Measured

As your MP4 plays, MediaPipe tracks 33 body landmarks and calculates joint angles every frame. The app splits the movement into two phases by watching your average knee angle:

| Phase      | Knee Angle  | Overlay Color |
|------------|-------------|---------------|
| Standing   | > 155°      | 🟢 Green      |
| Transition | 110° – 155° | 🟠 Orange     |
| Squat      | < 110°      | 🟣 Purple     |

Each frame is scored per joint, then averaged across all frames in that phase. The final score weights the squat phase more heavily (65%) than the standing phase (35%).

---

## Joint Angles Measured

### During Squat Phase

| Joint        | Ideal Range |
|--------------|-------------|
| Right Knee   | 65° – 115°  |
| Left Knee    | 65° – 115°  |
| Right Hip    | 65° – 110°  |
| Left Hip     | 65° – 110°  |
| Right Spine  | 135° – 185° |
| Left Spine   | 135° – 185° |

### During Standing Phase

| Joint        | Ideal Range  |
|--------------|--------------|
| Right Knee   | 160° – 185°  |
| Left Knee    | 160° – 185°  |
| Right Hip    | 155° – 185°  |
| Left Hip     | 155° – 185°  |
| Right Spine  | 155° – 185°  |
| Left Spine   | 155° – 185°  |

---

## Errors Detected

| Error | Phase | What it means |
|-------|-------|----------------|
| Knee Valgus | Squat | Knees caving inward during descent |
| Insufficient Depth | Squat | Not descending deep enough |
| Excessive Forward Lean | Squat | Torso tilting too far forward |
| Incomplete Lockout | Standing | Legs not fully extended at the top |
| Heel Rise | Squat | Heels lifting off the ground |

Errors are rated **High** (joint score < 45) or **Medium** (joint score 45–68).

---

## Getting Started

### Open directly
Double-click `index.html`. Works in most modern browsers.

> ⚠️ If the skeleton overlay doesn't appear, your browser is blocking local script files. Use a local server instead:

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```

Then open `http://localhost:8080`.

---

## Video Tips

- **Side angle** (sagittal view) gives the most accurate joint readings
- **Full body in frame** at all times — head to feet
- **Good lighting** so MediaPipe can detect landmarks reliably
- **Form-fitting clothing** improves detection accuracy
- Recommended resolution: **720p or higher**
- Supported formats: **MP4, MOV, AVI, WebM**

---

## Project Structure

```
squat-analyze/
├── index.html           # App shell & layout
├── css/
│   └── style.css        # Dark-theme UI styles
└── js/
    ├── constants.js     # Joint definitions, angle ranges, error rules
    ├── state.js         # Global application state
    ├── utils.js         # Angle calculation & scoring helpers
    ├── pose.js          # Phase detection & canvas drawing
    ├── analysis.js      # MediaPipe pipeline & report generation
    ├── ai.js            # Result panel rendering
    ├── ui.js            # Upload, drag-drop, reset interactions
    └── mock.js          # Demo landmark simulation
```

---

## Tech Stack

- **[MediaPipe Pose](https://google.github.io/mediapipe/solutions/pose)** — 33-point body landmark detection via WebAssembly
- Vanilla HTML / CSS / JavaScript — zero build step, zero dependencies
- Canvas 2D API — real-time skeleton and angle label rendering

---

## Browser Support

| Browser    | Status     |
|------------|------------|
| Chrome 90+ | ✅ Recommended |
| Edge 90+   | ✅ Full    |
| Firefox 88+| ✅ Full    |
| Safari 15+ | ✅ Full    |

---

## License

MIT — free to use and modify.
