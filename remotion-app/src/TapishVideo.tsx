import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from "remotion";

// ─── Speech segments from silence detection ───────────────────────────────────
// Each entry = { start, end, text } in seconds.
// Text is a placeholder — replace with Whisper transcript once model is available.
const SPEECH_SEGMENTS = [
  { start: 1.54,  end: 4.02,  text: "..." },
  { start: 4.71,  end: 5.19,  text: "..." },
  { start: 6.91,  end: 7.78,  text: "..." },
  { start: 8.80,  end: 11.09, text: "..." },
  { start: 12.35, end: 15.36, text: "..." },
  { start: 16.25, end: 20.99, text: "..." },
  { start: 22.37, end: 28.75, text: "..." },
  { start: 30.45, end: 33.60, text: "..." },
  { start: 34.31, end: 38.65, text: "..." },
  { start: 39.92, end: 46.23, text: "..." },
  { start: 47.67, end: 48.09, text: "..." },
  { start: 48.60, end: 50.14, text: "..." },
  { start: 50.74, end: 53.49, text: "..." },
];

// ─── Kinetic word pop-in component ───────────────────────────────────────────
const KineticWord: React.FC<{ text: string; startFrame: number }> = ({
  text,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  // Invisible before startFrame
  if (elapsed < 0) return null;

  // Pop-in: scale 0.8 → 1.05 → 1.0 over first 6 frames
  const scale = interpolate(elapsed, [0, 3, 6], [0.8, 1.05, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(elapsed, [0, 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: "'Heebo', 'Arial Black', sans-serif",
        fontWeight: 900,
        fontSize: 72,
        color: "#3ab83a",
        textShadow: `
          3px 4px 0px rgba(0,0,0,0.65),
          0px 0px 16px rgba(0,0,0,0.4)
        `,
        transform: `scale(${scale})`,
        opacity,
        direction: "rtl",
        textAlign: "center",
        letterSpacing: "-1px",
        lineHeight: 1.1,
        padding: "0 32px",
        maxWidth: "100%",
        wordBreak: "keep-all",
      }}
    >
      {text}
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const TapishVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTimeSec = frame / fps;

  // Find the active speech segment
  const activeSeg = SPEECH_SEGMENTS.find(
    (s) => currentTimeSec >= s.start && currentTimeSec < s.end
  );

  // Frame at which the active segment starts (for pop-in timing)
  const segStartFrame = activeSeg ? Math.round(activeSeg.start * fps) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>

      {/* ── Talking head video ── */}
      <AbsoluteFill
        style={{
          // BIGVU watermark is in bottom-right ~80×30px of 608×1080 source.
          // We scale up and shift to crop it out while filling 1080×1920.
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            // Scale 608→1080 (factor 1.777), then upscale 10% more to crop watermark.
            width: "119%",
            height: "119%",
            position: "relative",
            top: "-4%",
          }}
        >
          <Video
            src={staticFile("raw.mp4")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // House style color grade:
              // - desaturate to ~72% of native
              // - slight cool hue shift (-5deg)
              // - lift contrast slightly to compensate for warm underexposure
              filter: "saturate(0.72) hue-rotate(-5deg) brightness(1.05) contrast(1.05)",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* ── Kinetic text overlay (chest-to-waist zone) ── */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: "28%", // positions text between chest and waist
        }}
      >
        {activeSeg && segStartFrame !== null && (
          <KineticWord text={activeSeg.text} startFrame={segStartFrame} />
        )}
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
