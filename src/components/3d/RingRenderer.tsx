// import React, { useMemo, useRef, useEffect } from "react";
// import * as THREE from "three";
// import { observer } from "mobx-react-lite";
// import configStore from "../../stores/ConfigStore";
// import { toJS } from "mobx";

// const scale = 1;

// const RingRenderer = observer(({ columns, centerOffset, floorY }) => {
//   const rodRadius = 8 / 1000; // 8mm diameter -> 4mm radius, converted to meters
//   const segments = useMemo(() => {
//     const height = configStore.shed3D.heights.COLUMNS;

//     return columns
//       .map((c) => {
//         const points = (c.points || []).map((p) => ({
//           x: -(p.x / 1000 - centerOffset[0]) * scale,
//           z: -(p.y / 1000 - centerOffset[2]) * scale,
//         }));

//         if (points.length !== 4) {
//           console.warn(`Invalid points for column:`, toJS(c));
//           return null;
//         }

//         const xs = points.map((p) => p.x);
//         const zs = points.map((p) => p.z);

//         const minX = Math.min(...xs);
//         const maxX = Math.max(...xs);
//         const minZ = Math.min(...zs);
//         const maxZ = Math.max(...zs);

//         const corners = [
//           { x: minX + 0.04, z: minZ + 0.04 }, // Bottom-left
//           { x: maxX - 0.04, z: minZ + 0.04 }, // Bottom-right
//           { x: maxX - 0.04, z: maxZ - 0.04 }, // Top-right
//           { x: minX + 0.04, z: maxZ - 0.04 }, // Top-left
//         ];

//         const yInterval = 150 / 1000; // Convert 150mm to units
//         const yLevels = [];
//         for (let y = floorY; y <= height + floorY; y += yInterval) {
//           yLevels.push(y);
//         }

//         const segments = yLevels.map((y) => [
//           {
//             start: [corners[0].x, y, corners[0].z],
//             end: [corners[1].x, y, corners[1].z],
//             rotation: [0, 0, Math.PI / 2], // Along x-axis
//             length: Math.abs(corners[1].x - corners[0].x),
//           },
//           {
//             start: [corners[1].x, y, corners[1].z],
//             end: [corners[2].x, y, corners[2].z],
//             rotation: [Math.PI / 2, 0, 0], // Along z-axis
//             length: Math.abs(corners[2].z - corners[1].z),
//           },
//           {
//             start: [corners[2].x, y, corners[2].z],
//             end: [corners[3].x, y, corners[3].z],
//             rotation: [0, 0, Math.PI / 2], // Along x-axis
//             length: Math.abs(corners[3].x - corners[2].x),
//           },
//           {
//             start: [corners[3].x, y, corners[3].z],
//             end: [corners[0].x, y, corners[0].z],
//             rotation: [Math.PI / 2, 0, 0], // Along z-axis
//             length: Math.abs(corners[0].z - corners[3].z),
//           },
//         ]);

//         return {
//           segments: segments.flat(),
//           color: "red",
//         };
//       })
//       .filter(Boolean);
//   }, [columns, centerOffset, configStore.shed3D.heights.COLUMNS]);

//   const cylinderGeometry = useMemo(
//     () => new THREE.CylinderGeometry(rodRadius, rodRadius, 1, 8),
//     []
//   );
//   const material = useMemo(
//     () =>
//       new THREE.MeshBasicMaterial({
//         color: "blue",
//         polygonOffset: true,
//         polygonOffsetFactor: -1,
//         polygonOffsetUnits: -4,
//         depthWrite: false,
//       }),
//     []
//   );

//   return (
//     <>
//       {segments.map((rect, index) => {
//         const instanceCount = rect.segments.length;
//         const meshRef = useRef();

//         useEffect(() => {
//           if (!meshRef.current) return;

//           rect.segments.forEach((segment, segmentIndex) => {
//             const position = [
//               (segment.start[0] + segment.end[0]) / 2,
//               segment.start[1],
//               (segment.start[2] + segment.end[2]) / 2,
//             ];
//             const matrix = new THREE.Matrix4()
//               .makeRotationFromEuler(
//                 new THREE.Euler(...segment.rotation, "XYZ")
//               )
//               .setPosition(...position)
//               .scale(new THREE.Vector3(1, segment.length, 1));

//             meshRef.current.setMatrixAt(segmentIndex, matrix);
//           });

//           meshRef.current.instanceMatrix.needsUpdate = true;
//         }, [rect.segments]);

//         return (
//           <instancedMesh
//             key={`rect-${index}`}
//             ref={meshRef}
//             args={[cylinderGeometry, material, instanceCount]}
//           />
//         );
//       })}
//     </>
//   );
// });

// export default RingRenderer;

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import configStore from "../../stores/ConfigStore";
import { toJS } from "mobx";

const scale = 1;

const RingRenderer = observer(
  ({
    columns,
    centerOffset,
    floorY,
    yInterval = 250 / 1000, // Default 150mm in meters
    rodDiameter = 8 / 1000, // Default 8mm in meters
    color = "blue", // Default color
    cornerOffset = 0.04, // Default corner offset
    segmentsCount = 8, // Default number of cylinder segments
    height = configStore.shed3D.heights.COLUMNS,
    opacity = 1,
  }) => {
    const rodRadius = rodDiameter; // Convert diameter to radius
    const segments = useMemo(() => {
      return columns
        .map((c) => {
          const points = (c.points || []).map((p) => ({
            x: -(p.x / 1000 - centerOffset[0]) * scale,
            z: -(p.y / 1000 - centerOffset[2]) * scale,
          }));

          if (points.length !== 4) {
            console.warn(`Invalid points for column:`, toJS(c));
            return null;
          }

          const xs = points.map((p) => p.x);
          const zs = points.map((p) => p.z);

          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minZ = Math.min(...zs);
          const maxZ = Math.max(...zs);

          const corners = [
            { x: minX + cornerOffset, z: minZ + cornerOffset }, // Bottom-left
            { x: maxX - cornerOffset, z: minZ + cornerOffset }, // Bottom-right
            { x: maxX - cornerOffset, z: maxZ - cornerOffset }, // Top-right
            { x: minX + cornerOffset, z: maxZ - cornerOffset }, // Top-left
          ];

          const yLevels = [];
          for (let y = floorY; y <= height + floorY; y += yInterval) {
            yLevels.push(y);
          }

          const segments = yLevels.map((y) => [
            {
              start: [corners[0].x, y, corners[0].z],
              end: [corners[1].x, y, corners[1].z],
              rotation: [0, 0, Math.PI / 2], // Along x-axis
              length: Math.abs(corners[1].x - corners[0].x),
            },
            {
              start: [corners[1].x, y, corners[1].z],
              end: [corners[2].x, y, corners[2].z],
              rotation: [Math.PI / 2, 0, 0], // Along z-axis
              length: Math.abs(corners[2].z - corners[1].z),
            },
            {
              start: [corners[2].x, y, corners[2].z],
              end: [corners[3].x, y, corners[3].z],
              rotation: [0, 0, Math.PI / 2], // Along x-axis
              length: Math.abs(corners[3].x - corners[2].x),
            },
            {
              start: [corners[3].x, y, corners[3].z],
              end: [corners[0].x, y, corners[0].z],
              rotation: [Math.PI / 2, 0, 0], // Along z-axis
              length: Math.abs(corners[0].z - corners[3].z),
            },
          ]);

          return {
            segments: segments.flat(),
            color,
          };
        })
        .filter(Boolean);
    }, [columns, centerOffset, floorY, yInterval, cornerOffset, color]);

    const cylinderGeometry = useMemo(
      () => new THREE.CylinderGeometry(rodRadius, rodRadius, 1, segmentsCount),
      [rodRadius, segmentsCount]
    );

    const material = useMemo(
      () =>
        new THREE.MeshBasicMaterial({
          color,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -4,
          depthWrite: false,
          opacity: opacity,
        }),
      [color]
    );

    return (
      <>
        {segments.map((rect, index) => {
          const instanceCount = rect.segments.length;
          const meshRef = useRef();

          useEffect(() => {
            if (!meshRef.current) return;

            rect.segments.forEach((segment, segmentIndex) => {
              const position = [
                (segment.start[0] + segment.end[0]) / 2,
                segment.start[1],
                (segment.start[2] + segment.end[2]) / 2,
              ];
              const matrix = new THREE.Matrix4()
                .makeRotationFromEuler(
                  new THREE.Euler(...segment.rotation, "XYZ")
                )
                .setPosition(...position)
                .scale(new THREE.Vector3(1, segment.length, 1));

              meshRef.current.setMatrixAt(segmentIndex, matrix);
            });

            meshRef.current.instanceMatrix.needsUpdate = true;
          }, [rect.segments]);

          return (
            <instancedMesh
              key={`rect-${index}`}
              ref={meshRef}
              args={[cylinderGeometry, material, instanceCount]}
            />
          );
        })}
      </>
    );
  }
);

export default RingRenderer;
