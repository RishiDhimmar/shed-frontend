import { OrthographicCamera } from "@react-three/drei";

function CameraSetup() {
  return <OrthographicCamera position={[0, 0, 1000]} zoom={100}/>;
}

export default CameraSetup;
