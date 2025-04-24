import { useMemo } from "react";
import * as THREE from "three";

function TubeLine({ points, color, onClick, onPointerOver, onPointerOut }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points, true),
    [points]
  );
  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.1, 8, true),
    [curve]
  );
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color }),
    [color]
  );

  return (
    <mesh
      geometry={geometry}
      material={material}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
  );
}

export default TubeLine;
