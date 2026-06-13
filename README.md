# Align — Posture Coach

A Progressive Web App that uses your phone camera and MediaPipe Pose to guide you through a front + side posture scan, then coaches you into better alignment with real-time visual feedback.

**All pose detection runs locally on your device. No video is ever recorded, stored, or uploaded.**

---

## Features

- **Quick posture scan** — 5-second front + side camera scans
- **Real-time diagnosis** — detects 6 posture issues (forward head, rounded back, shoulder imbalance, hip hiking, head tilt, anterior pelvic tilt)
- **Guided correction** — live skeleton overlay with color-coded feedback; hold correct position for 3 seconds to resolve each issue
- **Align Score** — animated 0–100 score that updates as you correct
- **Session history** — score trend chart, weekly summary, per-session details
- **Three session modes** — Full Correction, Quick Align, Check In
- **Full PWA** — installable, offline-capable, Add to Home Screen

---

## Tech Stack

- React + Vite
- Tailwind CSS v4
- MediaPipe Pose (via CDN — runs in WebAssembly, no server required)
- vite-plugin-pwa (Workbox service worker)
- localStorage for all data

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/align/](http://localhost:5173/align/)

---

## Deploy to GitHub Pages

### 1. Create the repository

Create a new GitHub repo named `align` (or whatever you prefer).

### 2. Update the base path

If your repo is named something other than `align`, update `vite.config.js`:

```js
base: '/your-repo-name/',
```

And update `index.html` `<link>` hrefs to match.

### 3. Build

```bash
npm run build
```

This outputs to `dist/`.

### 4. Push the `dist/` folder to `gh-pages` branch

**Option A — manual:**

```bash
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/align.git
git push -u origin main

# Deploy dist/ to gh-pages
npm install --save-dev gh-pages
npx gh-pages -d dist
```

**Option B — GitHub Actions** (automatic on every push to `main`):

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 5. Enable GitHub Pages

In your repo: **Settings → Pages → Source → Deploy from a branch → gh-pages / root**

Your app will be live at: `https://YOUR_USERNAME.github.io/align/`

---

## Privacy

- Camera feed is processed in real time by MediaPipe WebAssembly running locally
- No video frames are ever stored or transmitted
- Session data (scores, issues) is stored in `localStorage` on your device only
- The only network request is loading MediaPipe from jsDelivr CDN on first use; after that the service worker caches it for offline use

---

## Project Structure

```
src/
  App.jsx              # Root — orchestrates all screens
  screens/
    OnboardingScreen   # First-run welcome + privacy
    HomeScreen         # Session type selector + last score
    SetupScreen        # Phone placement guide
    ScanScreen         # Camera + silhouette + countdown
    TransitionScreen   # Front → side transition
    DiagnosisScreen    # Issues list + Align Score
    CorrectionScreen   # Real-time skeleton coaching
    CompleteScreen     # Final score + save + share
    HistoryScreen      # Score chart + session list
    SettingsScreen     # Prefs + privacy + data
  components/
    AlignScore         # Animated circular score ring
    SilhouetteOverlay  # SVG body outline on camera
    SkeletonCanvas     # MediaPipe skeleton w/ color coding
    CountdownRing      # 5-second scan countdown
    BottomNav          # Home / History / Settings tabs
  hooks/
    useMediaPipe       # MediaPipe Pose lifecycle hook
  utils/
    posture.js         # Issue detection + scoring logic
    storage.js         # localStorage data layer
```
