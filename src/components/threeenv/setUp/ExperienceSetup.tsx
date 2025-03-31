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

      <ShadeVisualizer />
    </>
  );
}

export default ExperienceSetup;
