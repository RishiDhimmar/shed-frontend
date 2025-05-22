import * as THREE from "three";
import { useMemo } from "react";
import { Line } from "@react-three/drei";
import foundationStore from "../../stores/FoundationStore";

interface Point {
  x: number;
  y: number;
}

interface FrustumMeshProps {
  bottomPoints: Point[];
  topPoints: Point[];
  yDepth?: number;
  floorY?: number;
}

const FrustumMesh = ({
  bottomPoints,
  topPoints,
  yDepth = 0.37,
  floorY = 0,
  opacity = 1,
}: FrustumMeshProps) => {
  /**
   * `bottomPoints`: 4 points like { x, y } (Three.js x, z at y=0)
   * `topPoints`: 4 points like { x, y } (Three.js x, z at y=-yDepth)
   * `yDepth`: Depth along Three.js y (meters, default 0.075 for 75 mm)
   * `floorY`: Base y level (default 0)
   */

  const geometry = useMemo(() => {
    if (
      !bottomPoints ||
      !topPoints ||
      bottomPoints.length !== 4 ||
      topPoints.length !== 4
    ) {
      console.warn("FrustumMesh requires 4 bottom and 4 top points.");
      return null;
    }

    // Combine points: bottom at y=0, top at y=-yDepth
    const combinedPoints = [
      ...bottomPoints.map((p) => [p.x, floorY, p.y]), // Three.js: x, y=0, z
      ...topPoints.map((p) => [p.x, yDepth + floorY, p.y]), // Three.js: x, y=-yDepth, z
    ];

    const positionArray = new Float32Array(combinedPoints.flat());

    // Define indices for a closed frustum (bottom, top, and sides)
    const indices = [
      // Bottom face (y=0)
      0,
      1,
      2,
      0,
      2,
      3,
      // Top face (y=-yDepth)
      4,
      6,
      5,
      4,
      7,
      6,
      // Side faces
      0,
      4,
      5,
      0,
      5,
      1, // Side 1
      1,
      5,
      6,
      1,
      6,
      2, // Side 2
      2,
      6,
      7,
      2,
      7,
      3, // Side 3
      3,
      7,
      4,
      3,
      4,
      0, // Side 4
    ];

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [bottomPoints, topPoints, yDepth, floorY, foundationStore.foundationInputs]);

  if (!geometry) return null;

  return (
    <group>
      {/* Frustum mesh */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="magenta"
          transparent
          opacity={opacity}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-4}
          depthWrite={false}
        />
      </mesh>
      {/* Bottom face outline */}
    </group>
  );
};

export default FrustumMesh;
