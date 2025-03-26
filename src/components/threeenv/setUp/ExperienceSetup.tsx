import CameraSetup from "./CameraSetup";
import ControlsSetup from "./ControlsSetup";
import LightSetup from "./LightSetup";
import ShadeVisualizer from "./ShadeVisualizer";

function ExperienceSetup() {
  return (
    <>
      <LightSetup />
      <ControlsSetup />
      <CameraSetup />

      {/* <mesh>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial />
      </mesh> */}
      
      {/* <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </mesh> */}

      <ShadeVisualizer />
    </>
  );
}

export default ExperienceSetup;
