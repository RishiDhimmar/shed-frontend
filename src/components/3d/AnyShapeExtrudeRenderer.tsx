// import React, { useMemo } from "react";
// import * as THREE from "three";
// import foundationStore from "../../stores/FoundationStore";
// import configStore from "../../stores/ConfigStore";
// import { depth } from "three/tsl";

// const scale = 1;

// interface Point {
//   x: number;
//   y: number;
// }
// interface AnyShapeRendererProps {
//   bottomPoints: Point[];
//   height?: number;
//   centerOffset?: [number, number, number]; // Add centerOffset prop
//   y?: number;
//   color?: string;
//   opacity?: number;
// }

// const AnyShapeRenderer: React.FC<AnyShapeRendererProps> = ({
//   bottomPoints,
//   height = configStore.shed3D.heights.RCC,
//   centerOffset = [0, 0, 0],
//   y = 0,
//   color = "magenta",
//   opacity = 0.5,
// }) => {
//   const geometry = useMemo(() => {
//     if (!bottomPoints || bottomPoints.length < 3) {
//       return new THREE.BufferGeometry();
//     }

//     const shape = new THREE.Shape();
//     bottomPoints.forEach((point, index) => {
//       const x = (point.x - centerOffset[0]) * scale; // Apply offset
//       const y = -(point.y - centerOffset[2]) * scale;
//       if (index === 0) {
//         shape.moveTo(x, y);
//       } else {
//         shape.lineTo(x, y);
//       }
//     });
//     shape.closePath();

//     const extrudeSettings = {
//       depth: height * scale,
//       bevelEnabled: false,
//     };

//     const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
//     geometry.computeVertexNormals();
//     return geometry;
//   }, [bottomPoints, -height / 2, centerOffset]);

//   const meshPosition = useMemo(() => {
//     if (!bottomPoints || bottomPoints.length < 3) return [0, 0, 0];

//     const centroid = bottomPoints.reduce(
//       (acc, point) => ({
//         x: acc.x + point.x / bottomPoints.length,
//         y: acc.y + point.y / bottomPoints.length,
//       }),
//       { x: 0, y: 0 }
//     );

//     return [
//       -(centroid.x / 1000 - centerOffset[0]) * scale,
//       !y ? -height / 2 : y,
//       -(centroid.y / 1000 - centerOffset[2]) * scale,
//     ];
//   }, [bottomPoints, -height / 2, centerOffset]);

//   const material = useMemo(
//     () =>
//       new THREE.MeshBasicMaterial({
//         color: color || "magenta",
//         opacity: opacity,
//         transparent: true,
//         depthWrite: false,
//       }),
//     []
//   );

//   return (
//     <mesh
//       geometry={geometry}
//       material={material}
//       position={meshPosition}
//       receiveShadow
//       depthWrite={false}
//       rotation={[-Math.PI / 2, 0, 0]}
//     />
//   );
// };
// export default AnyShapeRenderer;

import React, { useMemo } from "react";
import * as THREE from "three";
import configStore from "../../stores/ConfigStore";

const scale = 1;

interface Point {
  x: number;
  y: number;
}

interface AnyShapeRendererProps {
  bottomPoints: Point[];
  height?: number;
  centerOffset?: [number, number, number];
  y?: number;
  color?: string;
  opacity?: number;
  outlineColor?: string;
  renderOrder?: number;
}

const AnyShapeRenderer: React.FC<AnyShapeRendererProps> = ({
  bottomPoints,
  height = configStore.shed3D.heights.RCC,
  centerOffset = [0, 0, 0],
  y = 0,
  color = "magenta",
  opacity = 0.5,
  outlineColor = "black",
  renderOrder = 1,
}) => {
  // Main geometry
  const geometry = useMemo(() => {
    if (!bottomPoints || bottomPoints.length < 3) {
      return new THREE.BufferGeometry();
    }

    const shape = new THREE.Shape();
    bottomPoints.forEach((point, index) => {
      const x = (point.x - centerOffset[0]) * scale;
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
  }, [bottomPoints, height, centerOffset]);

  // Edges geometry for outline
  const edgesGeometry = useMemo(() => {
    if (!geometry) return new THREE.BufferGeometry();
    return new THREE.EdgesGeometry(geometry, 1); // Threshold angle of 1 degree
  }, [geometry]);

  // Mesh position
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
      y || -height / 2,
      -(centroid.y / 1000 - centerOffset[2]) * scale,
    ];
  }, [bottomPoints, height, centerOffset, y]);

  // Main material
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        opacity,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [color, opacity]
  );

  // Outline material
  const outlineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: outlineColor,
        linewidth: 1, // Adjust for desired thickness
      }),
    [outlineColor]
  );

  return (
    <group
      rotation={[-Math.PI / 2, 0, 0]}
      position={meshPosition}
      renderOrder={renderOrder}
    >
      <mesh geometry={geometry} material={material} receiveShadow />
      <lineSegments geometry={edgesGeometry} material={outlineMaterial} />
    </group>
  );
};

export default AnyShapeRenderer;
