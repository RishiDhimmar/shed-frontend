import { Canvas } from "@react-three/fiber";
import ExperienceSetup from "./setUp/ExperienceSetup";

function ShadeCanvas() {
  return (
    <div className="w-screen h-screen z-1">
      <Canvas style={{backgroundColor: "black"}}>
        <ExperienceSetup />
      </Canvas>
    </div>
  );
}

export default ShadeCanvas;
