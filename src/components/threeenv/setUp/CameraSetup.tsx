import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";

function CameraSetup() {
  return <OrthographicCamera makeDefault position={[0, 0, 10000]} zoom={1} near={-10000} far={10000}/>;

  //  return <PerspectiveCamera  position={[0, 0, 20000000]} makeDefault/>;
}

export default CameraSetup;
