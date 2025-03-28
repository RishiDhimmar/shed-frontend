import { CameraControls } from "@react-three/drei";

function ControlsSetup() {
  return (
    <>
      <CameraControls
        azimuthRotateSpeed={0}
        polarRotateSpeed={0}
        draggingSmoothTime={0.1}
        infinityDolly={false}
        maxDistance={100}
        minDistance={0.1}
      />
    </>
  );
}

export default ControlsSetup;
