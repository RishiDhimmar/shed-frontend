import React from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "../3d/Experience";

const Canvas3D: React.FC = () => {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 1000], fov: 50, near: 1, far: 10000 }}
    >
      <Experience />
    </Canvas>
  );
};

export default Canvas3D;