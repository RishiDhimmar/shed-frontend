import { CameraControls, OrbitControls } from "@react-three/drei";

function ControlsSetup() {
  return (
    <>
      <CameraControls azimuthRotateSpeed={0} polarRotateSpeed={0}  />
      {/* <OrbitControls /> */}
    </>
  );
}

export default ControlsSetup;
