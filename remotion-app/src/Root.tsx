import "./index.css";
import { Composition } from "remotion";
import { TapishVideo } from "./TapishVideo";

// Source video: 56.37s at 30fps → trim to 53.5s of active speech at 25fps
// 53.5s × 25fps = 1337 frames (removes opening silence + trailing silence)
const DURATION_FRAMES = 1337;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TapishVideo"
        component={TapishVideo}
        durationInFrames={DURATION_FRAMES}
        fps={25}
        width={1080}
        height={1920}
      />
    </>
  );
};
