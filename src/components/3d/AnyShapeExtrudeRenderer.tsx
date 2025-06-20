import React, { useMemo } from "react";
import * as THREE from "three";
import foundationStore from "../../stores/FoundationStore";
import configStore from "../../stores/ConfigStore";
import { depth } from "three/tsl";

const scale = 1;

interface Point {
  x: number;
  y: number;
}
interface AnyShapeRendererProps {
  bottomPoints: Point[];
  height?: number;
  centerOffset?: [number, number, number]; // Add centerOffset prop
  y?: number;
  color?: string;
}

const AnyShapeRenderer: React.FC<AnyShapeRendererProps> = ({
  bottomPoints,
  height = configStore.shed3D.heights.RCC,
  centerOffset = [0, 0, 0],
  y = 0,
  color = "magenta",
}) => {
  const geometry = useMemo(() => {
    if (!bottomPoints || bottomPoints.length < 3) {
      return new THREE.BufferGeometry();
    }

    const shape = new THREE.Shape();
    bottomPoints.forEach((point, index) => {
      const x = (point.x - centerOffset[0]) * scale; // Apply offset
      const y = -(point.y - centerOffset[2]) * scale;
      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });
    shape.closePath();

    const extrudeSettings = {
      depth: height * scale,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.computeVertexNormals();
    return geometry;
  }, [bottomPoints, -height / 2, centerOffset]);

  const meshPosition = useMemo(() => {
    if (!bottomPoints || bottomPoints.length < 3) return [0, 0, 0];

    const centroid = bottomPoints.reduce(
      (acc, point) => ({
        x: acc.x + point.x / bottomPoints.length,
        y: acc.y + point.y / bottomPoints.length,
      }),
      { x: 0, y: 0 }
    );

    return [
      -(centroid.x / 1000 - centerOffset[0]) * scale,
      !y ? -height / 2 : y,
      -(centroid.y / 1000 - centerOffset[2]) * scale,
    ];
  }, [bottomPoints, -height / 2, centerOffset]);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: color || "magenta",
        opacity: 0.5,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={meshPosition}
      receiveShadow
      depthWrite={true}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
};
export default AnyShapeRenderer;
