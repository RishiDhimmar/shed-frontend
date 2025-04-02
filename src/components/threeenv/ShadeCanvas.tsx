import { Canvas } from "@react-three/fiber";
import ExperienceSetup from "./setUp/ExperienceSetup";

function ShadeCanvas() {
  return (
    <div className=" w-full h-[calc(100vh-64px)] z-1">
      <Canvas>
        <ExperienceSetup />
      </Canvas>
    </div>
  );
}

export default ShadeCanvas;
