import { Canvas } from "@react-three/fiber";
import React from "react";
import ExperienceSetup from "./setUp/ExperienceSetup";

function ShadeCanvas() {
  return (
    <div className="w-screen h-screen">
      <Canvas>

        <ExperienceSetup />
      </Canvas>
    </div>
  );
}

export default ShadeCanvas;
