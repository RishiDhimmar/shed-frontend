import CameraSetup from "./CameraSetup";
import ControlsSetup from "./ControlsSetup";
import ShadeVisualizer from "./ShadeVisualizer";

function ExperienceSetup() {
  return (
    <>
      <ControlsSetup />
      <CameraSetup />

      <ShadeVisualizer />
    </>
  );
}

export default ExperienceSetup;
