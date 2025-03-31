import { OrthographicCamera } from "@react-three/drei";

function CameraSetup() {
  return <OrthographicCamera makeDefault position={[0, 0, 1500]} zoom={15}/>;
}

export default CameraSetup;
