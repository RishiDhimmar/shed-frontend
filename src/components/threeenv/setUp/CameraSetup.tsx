import { OrthographicCamera } from "@react-three/drei";

function CameraSetup() {
  return <OrthographicCamera makeDefault position={[0, 0, 2000]} zoom={10} near={-10000} far={10000}/>;
}

export default CameraSetup;
