import { OrthographicCamera } from "@react-three/drei";

function CameraSetup() {
  return <OrthographicCamera makeDefault position={[0, 0, 2000]} zoom={10}/>;
}

export default CameraSetup;
