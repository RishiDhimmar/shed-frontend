import { Canvas } from "@react-three/fiber";
import ExperienceSetup from "./setUp/ExperienceSetup";
import ScreenshotButton from "./inputs/TakeSnapButton";

function ShadeCanvas() {
  return (
    <div className=" w-full h-[calc(100vh-64px)] z-1">
      <Canvas style={{background: "white"}} gl={{preserveDrawingBuffer: true}}>
        <ExperienceSetup />

        <ScreenshotButton />
      </Canvas>
    </div>
  );
}

export default ShadeCanvas;

