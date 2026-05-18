# TapishVideo — Project Instructions

This is a short-form vertical video production project targeting Instagram Reels,
TikTok, and YouTube Shorts. The house style is a **Hebrew-language financial/educational
talking-head format** with interspersed motion graphic inserts.

---

## "Edit This Video" — Trigger & Full Pipeline

**Whenever the user says "edit this video" (or a close variant) and provides a video
file path, run the full pipeline below in order. Do not skip phases.**

### Step 1 — Technical audit
```bash
ffprobe -v quiet -print_format json -show_streams -show_format "<input>"
```
Report: resolution, aspect ratio, fps, duration, color space, audio sample rate.

### Step 2 — Transcribe with Whisper
```bash
pip install openai-whisper   # if not already installed
python scripts/transcribe.py "<input>" --model small --format json --output /tmp/transcript.json
```
Parse the JSON. Extract:
- Full transcript text
- Per-segment timestamps (for kinetic text timing)
- Language detected

### Step 3 — Cut detection & frame sampling
```bash
mkdir -p /tmp/edit_frames /tmp/edit_cuts

# Sample a frame every 2 seconds
ffmpeg -i "<input>" -vf "fps=0.5" /tmp/edit_frames/frame_%04d.jpg -y

# Detect scene changes
ffmpeg -i "<input>" \
  -vf "scdet=threshold=10:sc_pass=1,metadata=print:key=lavfi.scd.score:file=/tmp/edit_cuts/scenes.txt" \
  -f null - 2>/dev/null
```
Read all sampled frames visually. Report: number of cuts, avg shot duration, pacing classification.

### Step 4 — Color & signal analysis
```bash
ffmpeg -i "<input>" \
  -vf "fps=0.5,signalstats,metadata=print:file=/tmp/edit_cuts/signalstats.txt" \
  -f null - 2>/dev/null
```
Report: YAVG range (exposure), SATAVG (saturation level), dominant HUEMED.

### Step 5 — Style compliance check
Compare findings from Steps 3–4 against the **House Style Rules** section below.
List any deviations (wrong pacing, wrong color temp, no kinetic text, etc.).

### Step 6 — Generate Remotion composition
If the project has no `remotion-app/` directory yet, scaffold it:
```bash
npx create-video@latest remotion-app --template hello-world --yes
cd remotion-app && npm install
```
Then generate or update `remotion-app/src/TapishVideo.tsx` with:
- **Talking head track** from the input video (use `<Video>` component)
- **Kinetic text layer** — one word/phrase per segment from the Whisper transcript,
  using the kinetic text spec (see Typography section below)
- **Hard cuts** between talking head segments and MG inserts (no dissolves)
- **Color grade overlay** — CSS filter: `saturate(0.75) hue-rotate(-5deg)` on the
  video layer to replicate the cool-neutral look

Open Remotion Studio so the user can preview:
```bash
cd remotion-app && npx remotion studio
```

### Step 7 — Output report
Produce a Markdown edit report covering:
1. Technical summary of the input
2. Transcript (full text)
3. Cut list with timestamps
4. Style deviations found and how they were addressed in the composition
5. Remotion Studio URL and how to render the final file

---

## Skills

### /whisper — Audio/Video Transcription

Transcribes any audio or video file using OpenAI Whisper.

**Script:** `scripts/transcribe.py`

```
Usage: python scripts/transcribe.py <file> [options]

Options:
  --model   tiny | base | small | medium | large   (default: base)
  --format  text | json | srt | vtt                (default: text)
  --output  <path>   write to file instead of stdout
```

**Model selection guide:**

| Model  | Speed   | Best for |
|--------|---------|----------|
| tiny   | fastest | quick drafts |
| base   | fast    | standard workflow |
| small  | medium  | Hebrew / accented speech (recommended) |
| medium | slow    | high accuracy, noisy audio |
| large  | slowest | maximum accuracy |

**Always use `--model small` or higher for Hebrew content** — smaller models
have poor Hebrew accuracy.

**Install dependency if missing:**
```bash
pip install openai-whisper
```

**Common invocations:**
```bash
# Get plain transcript
python scripts/transcribe.py video.mp4 --model small

# Get word-level timestamps for kinetic text
python scripts/transcribe.py video.mp4 --model small --format json --output transcript.json

# Generate SRT subtitles
python scripts/transcribe.py video.mp4 --model small --format srt --output video.srt

# Generate WebVTT for web players
python scripts/transcribe.py video.mp4 --model small --format vtt --output video.vtt
```

---

### /remotion-studio — Video Composition & Rendering

Scaffolds and launches Remotion Studio for programmatic video editing with React.

**Two modes:**

#### init — Create a new project
```bash
npx create-video@latest remotion-app --template hello-world --yes
cd remotion-app && npm install && npm run dev
```
Available templates: `hello-world`, `blank`, `react-three-fiber`, `still`,
`skia`, `tailwind`, `text-to-speech`, `text-to-video`.

#### start — Launch Studio for existing project
```bash
cd remotion-app && npx remotion studio --port 3000
```
Studio runs at `http://localhost:3000`.

**Common Remotion CLI commands:**

| Task | Command |
|------|---------|
| Start Studio | `npx remotion studio` |
| Render video | `npx remotion render src/index.ts MyComp out/video.mp4` |
| Render still | `npx remotion still src/index.ts MyComp out/frame.png` |
| List compositions | `npx remotion compositions src/index.ts` |
| Upgrade | `npx remotion upgrade` |

**Environment note:** Set `REMOTION_GL=angle` on Linux if you see rendering artefacts.

---

## House Style Rules

These rules apply to **every video produced in this project**.
Enforce them during the style compliance check (Step 5) and
implement them in every Remotion composition (Step 6).

### Format
- **Resolution:** 1080 × 1920 px (9:16 vertical)
- **Frame rate:** 25 fps
- **Color space:** BT.709
- **Export:** H.264, 4–6 Mbps (social delivery)
- **Audio loudness:** -14 LUFS integrated

### Color Palette

| Name | Hex | Usage |
|---|---|---|
| Brand green | `#3ab83a` | Kinetic text, X marks, arrows, CTA elements |
| Deep forest green | `#0e2e18` | Motion graphic backgrounds |
| Dark teal | `#1a4a3a` | Studio backdrop reference |
| Mint accent | `#40b8a0` | Secondary prop/shelf accents |
| Silver chrome | `#c8c8c8` | MG pill containers |
| White | `#f5f5f5` | Text on dark backgrounds |
| Negative red | `#e03040` | Loss / negative data indicators only |

### Color Grade
1. No LUT. Natural BT.709 finish.
2. White balance: neutral-cool (5,500–6,000 K). No warm push.
3. Saturation: ~70–75% of native (SATAVG target 6–9 in YUV signalstats).
4. Shadows: near-natural, no crush. YLOW target ~20–30.
5. Highlights: gentle rolloff. Protect white clothing detail.
6. Remotion CSS equivalent: `saturate(0.75) hue-rotate(-5deg)` on the video layer.

### Cuts & Pacing
- **Hard cuts only** — no dissolves, wipes, fades, or transition effects.
- **Average shot duration:** 3–6 s (Medium pacing).
- Cut at natural sentence breaks in dialogue — never mid-word.
- Cut to motion graphics when a new concept is introduced; return to speaker after 2–6 s.
- Final talking head stretch: 8–12 s (CTA delivery).

### Composition & Camera
- **Shot type:** MCU (medium close-up) — subject visible from mid-torso up.
- **Camera:** Fully locked / static. No push-ins, no handheld shake.
- **Subject placement:** Horizontally centered. Head at ~30% from top of frame.
- **Text safe zone:** Kinetic text between chest and waist. Never over the face.

### Typography & Kinetic Text
- **Font:** Heebo ExtraBold (Hebrew) / Montserrat ExtraBold (Latin fallback).
- **Style:** Bold, large, 3D pop-in appearance.
- **Color:** `#3ab83a` (neon green) body fill + dark drop shadow (opacity 60%, 4–6 px offset, 8 px blur).
- **Animation:** Scale pop-in — 0.8 → 1.0 over 3–5 frames, ease-out with optional 1.05 overshoot.
- **Timing:** Each word or short phrase appears at the moment it is spoken (word-level sync from Whisper JSON).
- **Max on screen at once:** 3–4 words.
- **Never** animate text over the subject's face.

### Motion Graphic Segments
Layer order (bottom → top):
1. Dark forest green background (`#0d2415` radial gradient)
2. Floating sparkle/particle layer
3. Crosshair `+` corner decorations
4. Central 3D asset (brain / coin / chart)
5. Headline text (white + `#3ab83a` outer glow)
6. Stacked silver pill buttons with sequential stagger (8–12 frame delay each)
7. Brand X mark on relevant elements

### Do's and Don'ts

**Do:**
- Hard cuts only.
- Lock camera on talking head.
- Sync kinetic text word-by-word with Whisper transcript.
- Use `#3ab83a` green as the sole accent color in live footage.
- Cut to MG at concept introduction; return after 2–6 s.
- Allow 8–12 s final stretch for CTA.

**Don't:**
- Add dissolves, wipes, or any transition effect.
- Vary shot size in talking head segments.
- Apply a warm or cinematic LUT.
- Let kinetic text overlap the subject's face.
- Saturate colors — the look is intentionally cool and desaturated.
- Run a single MG segment longer than 6 s unless it contains a multi-step list reveal.

---

## Project File Structure

```
TapishVideo/
├── CLAUDE.md                  ← this file
├── style-guide.md             ← full detailed style reference
├── requirements.txt           ← Python dependencies (openai-whisper)
├── scripts/
│   └── transcribe.py          ← Whisper transcription script
├── .claude/
│   └── commands/
│       ├── whisper.md         ← /whisper slash command
│       └── remotion-studio.md ← /remotion-studio slash command
└── remotion-app/              ← created on first /remotion-studio init
    └── src/
        └── TapishVideo.tsx    ← main composition (generated during edit pipeline)
```

---

## Dependencies

```bash
# Python (Whisper)
pip install openai-whisper

# Node (Remotion) — requires Node ≥ 18
npx create-video@latest remotion-app --template hello-world --yes

# ffmpeg (frame extraction, cut detection, signal analysis)
apt-get install -y ffmpeg   # Ubuntu/Debian
brew install ffmpeg          # macOS
```
