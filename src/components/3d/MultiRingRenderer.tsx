// import React, { useMemo, useRef, useEffect } from "react";
// import * as THREE from "three";
// import { observer } from "mobx-react-lite";
// import configStore from "../../stores/ConfigStore";
// import { toJS } from "mobx";
// import columnStore from "../../stores/ColumnStore";

// const scale = 1;

// const MultiRingRenderer = observer(
//   ({
//     columns,
//     centerOffset,
//     floorY,
//     yInterval = 250 / 1000, // Default 150mm in meters
//     rodDiameter = 8 / 1000, // Default 8mm in meters
//     color = "blue", // Default color
//     cornerOffset = 0.04, // Default corner offset
//     segmentsCount = 8, // Default number of cylinder segments
//     height = configStore.shed3D.heights.COLUMNS,
//     opacity = 1,
//   }) => {
//     // const rodDiameter = rodDiameter; // Convert diameter to radius
//     const segments = useMemo(() => {
//       return columns
//         .map((c) => {
//           const points = (c.points || []).map((p) => ({
//             x: -(p.x / 1000 - centerOffset[0]) * scale,
//             z: -(p.y / 1000 - centerOffset[2]) * scale,
//           }));
//           console.log(columnStore.polygons.find((g) => g.name === c.groupName));

//           if (points.length !== 4) {
//             console.warn(`Invalid points for column:`, toJS(c));
//             return null;
//           }

//           const xs = points.map((p) => p.x);
//           const zs = points.map((p) => p.z);

//           const minX = Math.min(...xs);
//           const maxX = Math.max(...xs);
//           const minZ = Math.min(...zs);
//           const maxZ = Math.max(...zs);

//           const corners = [
//             { x: minX + cornerOffset, z: minZ + cornerOffset }, // Bottom-left
//             { x: maxX - cornerOffset, z: minZ + cornerOffset }, // Bottom-right
//             { x: maxX - cornerOffset, z: maxZ - cornerOffset }, // Top-right
//             { x: minX + cornerOffset, z: maxZ - cornerOffset }, // Top-left
//           ];

//           const yLevels = [];
//           for (let y = floorY; y <= height + floorY; y += yInterval) {
//             yLevels.push(y);
//           }

//           const segments = yLevels.map((y) => [
//             {
//               start: [corners[0].x, y, corners[0].z],
//               end: [corners[1].x, y, corners[1].z],
//               rotation: [0, 0, Math.PI / 2], // Along x-axis
//               length: Math.abs(corners[1].x - corners[0].x),
//             },
//             {
//               start: [corners[1].x, y, corners[1].z],
//               end: [corners[2].x, y, corners[2].z],
//               rotation: [Math.PI / 2, 0, 0], // Along z-axis
//               length: Math.abs(corners[2].z - corners[1].z),
//             },
//             {
//               start: [corners[2].x, y, corners[2].z],
//               end: [corners[3].x, y, corners[3].z],
//               rotation: [0, 0, Math.PI / 2], // Along x-axis
//               length: Math.abs(corners[3].x - corners[2].x),
//             },
//             {
//               start: [corners[3].x, y, corners[3].z],
//               end: [corners[0].x, y, corners[0].z],
//               rotation: [Math.PI / 2, 0, 0], // Along z-axis
//               length: Math.abs(corners[0].z - corners[3].z),
//             },
//           ]);

//           return {
//             segments: segments.flat(),
//             color,
//           };
//         })
//         .filter(Boolean);
//     }, [
//       columns,
//       centerOffset,
//       floorY,
//       yInterval,
//       cornerOffset,
//       color,
//       rodDiameter,
//     ]);

//     const cylinderGeometry = useMemo(
//       () =>
//         new THREE.CylinderGeometry(rodDiameter, rodDiameter, 1, segmentsCount),
//       [rodDiameter, segmentsCount]
//     );

//     const material = useMemo(
//       () =>
//         new THREE.MeshBasicMaterial({
//           color,
//           polygonOffset: true,
//           polygonOffsetFactor: -1,
//           polygonOffsetUnits: -4,
//           depthWrite: false,
//           opacity: opacity,
//         }),
//       [color]
//     );

//     return (
//       <>
//         {}
//         {segments.map((rect, index) => {
//           const instanceCount = rect.segments.length;
//           const meshRef = useRef();

//           useEffect(() => {
//             if (!meshRef.current) return;

//             rect.segments.forEach((segment, segmentIndex) => {
//               const position = [
//                 (segment.start[0] + segment.end[0]) / 2,
//                 segment.start[1],
//                 (segment.start[2] + segment.end[2]) / 2,
//               ];
//               const matrix = new THREE.Matrix4()
//                 .makeRotationFromEuler(
//                   new THREE.Euler(...segment.rotation, "XYZ")
//                 )
//                 .setPosition(...position)
//                 .scale(new THREE.Vector3(1, segment.length, 1));

//               meshRef.current.setMatrixAt(segmentIndex, matrix);
//             });

//             meshRef.current.instanceMatrix.needsUpdate = true;
//           }, [rect.segments]);

//           return (
//             <instancedMesh
//               key={`rect-${index}`}
//               ref={meshRef}
//               args={[cylinderGeometry, material, instanceCount]}
//             />
//           );
//         })}
//       </>
//     );
//   }
// );

// export default MultiRingRenderer;

// import React, { useMemo, useRef, useEffect } from "react";
// import * as THREE from "three";
// import { observer } from "mobx-react-lite";
// import configStore from "../../stores/ConfigStore";
// import { toJS } from "mobx";
// import columnStore from "../../stores/ColumnStore";

// const scale = 1;

// const MultiRingRenderer = observer(
//   ({
//     columns,
//     centerOffset,
//     floorY,
//     yInterval = 250 / 1000, // Default 250mm in meters
//     rodDiameter = 8 / 1000, // Default 8mm in meters
//     color = "blue", // Default color
//     cornerOffset = 0.04, // Default corner offset in meters
//     segmentsCount = 8, // Default number of cylinder segments
//     height = configStore.shed3D.heights.COLUMNS,
//     opacity = 1,
//   }) => {
//     const segments = useMemo(() => {
//       return columns
//         .map((c) => {
//           // Get group data from columnStore
//           const group = columnStore.polygons.find(
//             (g) => g.name === c.groupName
//           );
//           if (!group) {
//             console.warn(`Group not found for column:`, toJS(c));
//             return null;
//           }

//           // Extract group properties
//           const groupLength = (group.data?.length || 200) / 1000; // Convert mm to meters
//           const groupWidth = (group.data?.width || 100) / 1000; // Convert mm to meters
//           const hEdgeWires = group.hEdgeWires || 8;
//           const vEdgeWires = group.vEdgeWires || 4;
//           const ringData = group.ringData || [];

//           // Get points and convert to 3D coordinates
//           const points = (c.points || []).map((p) => ({
//             x: -(p.x / 1000 - centerOffset[0]) * scale,
//             z: -(p.y / 1000 - centerOffset[2]) * scale,
//           }));

//           if (points.length !== 4) {
//             console.warn(`Invalid points for column:`, toJS(c));
//             return null;
//           }

//           // Compute bounding box
//           const xs = points.map((p) => p.x);
//           const zs = points.map((p) => p.z);
//           const minX = Math.min(...xs);
//           const maxX = Math.max(...xs);
//           const minZ = Math.min(...zs);
//           const maxZ = Math.max(...zs);

//           // Generate y-levels
//           const yLevels = [];
//           for (let y = floorY; y <= height + floorY; y += yInterval) {
//             yLevels.push(y);
//           }

//           // Process ringData to determine which y-levels have rings
//           const ringSegments = ringData
//             .map((ring) => {
//               const { on: ringLength, from, to } = ring;

//               // Compute offsets

//               console.log("from", from, "to", to, "hEdgeWires", hEdgeWires);
//               const leftOffset =
//                 -40 / 1000  -(Math.abs(from) * 100) / 1000 ; // 0.04 is corner offset (in meters) ; // in meters
//               const rightOffset =
//                 40 / 1000-(Math.abs(hEdgeWires - to) * 100) / 1000 ;

//               // Compute ring x-boundaries
//               const ringMinX = minX - leftOffset;
//               const ringMaxX = maxX + rightOffset; // Add negative offset (shifts left)

//               // Define ring corners
//               const ringCorners = [
//                 { x: ringMinX , z: minZ + cornerOffset },
//                 { x: ringMaxX , z: minZ + cornerOffset },
//                 { x: ringMaxX , z: maxZ - cornerOffset },
//                 { x: ringMinX , z: maxZ - cornerOffset },
//               ];

//               // Generate segments for each y-level in the ring's range
//               return Array.from({ length: to - from + 1 }, (_, i) => {
//                 const yIndex = from + i;
//                 if (yIndex >= yLevels.length) return null;
//                 const y = yLevels[yIndex];

//                 return [
//                   {
//                     start: [ringCorners[0].x, y, ringCorners[0].z],
//                     end: [ringCorners[1].x, y, ringCorners[1].z],
//                     rotation: [0, 0, Math.PI / 2], // Along x-axis
//                     length: Math.abs(ringCorners[1].x - ringCorners[0].x),
//                   },
//                   {
//                     start: [ringCorners[1].x, y, ringCorners[1].z],
//                     end: [ringCorners[2].x, y, ringCorners[2].z],
//                     rotation: [Math.PI / 2, 0, 0], // Along z-axis
//                     length: Math.abs(ringCorners[2].z - ringCorners[1].z),
//                   },
//                   {
//                     start: [ringCorners[2].x, y, ringCorners[2].z],
//                     end: [ringCorners[3].x, y, ringCorners[3].z],
//                     rotation: [0, 0, Math.PI / 2], // Along x-axis
//                     length: Math.abs(ringCorners[3].x - ringCorners[2].x),
//                   },
//                   {
//                     start: [ringCorners[3].x, y, ringCorners[3].z],
//                     end: [ringCorners[0].x, y, ringCorners[0].z],
//                     rotation: [Math.PI / 2, 0, 0], // Along z-axis
//                     length: Math.abs(ringCorners[0].z - ringCorners[3].z),
//                   },
//                 ];
//               }).filter(Boolean);
//             })
//             .flat(2)
//             .filter(Boolean);

//           return {
//             segments: ringSegments,
//             color,
//           };
//         })
//         .filter(Boolean);
//     }, [
//       columns,
//       centerOffset,
//       floorY,
//       yInterval,
//       cornerOffset,
//       color,
//       rodDiameter,
//       segmentsCount,
//       height,
//     ]);

//     const cylinderGeometry = useMemo(
//       () =>
//         new THREE.CylinderGeometry(rodDiameter, rodDiameter, 1, segmentsCount),
//       [rodDiameter, segmentsCount]
//     );

//     const material = useMemo(
//       () =>
//         new THREE.MeshBasicMaterial({
//           color,
//           polygonOffset: true,
//           polygonOffsetFactor: -1,
//           polygonOffsetUnits: -4,
//           depthWrite: false,
//           opacity,
//         }),
//       [color, opacity]
//     );

//     return (
//       <>
//         {segments.map((rect, index) => {
//           const instanceCount = rect.segments.length;
//           const meshRef = useRef();

//           useEffect(() => {
//             if (!meshRef.current) return;

//             rect.segments.forEach((segment, segmentIndex) => {
//               const position = [
//                 (segment.start[0] + segment.end[0]) / 2,
//                 segment.start[1],
//                 (segment.start[2] + segment.end[2]) / 2,
//               ];
//               const matrix = new THREE.Matrix4()
//                 .makeRotationFromEuler(
//                   new THREE.Euler(...segment.rotation, "XYZ")
//                 )
//                 .setPosition(...position)
//                 .scale(new THREE.Vector3(1, segment.length, 1));

//               meshRef.current.setMatrixAt(segmentIndex, matrix);
//             });

//             meshRef.current.instanceMatrix.needsUpdate = true;
//           }, [rect.segments]);

//           return (
//             <instancedMesh
//               key={`rect-${index}`}
//               ref={meshRef}
//               args={[cylinderGeometry, material, instanceCount]}
//             />
//           );
//         })}
//       </>
//     );
//   }
// );

// export default MultiRingRenderer;
import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import configStore from "../../stores/ConfigStore";
import { toJS } from "mobx";
import columnStore from "../../stores/ColumnStore";

const scale = 1;

// Helper function to generate random colors for each ring
const getRandomColorForRing = () => {
  const hue = Math.random() * 360; // Random hue between 0 and 360
  return new THREE.Color(`hsl(${hue}, 70%, 50%)`);
};

const MultiRingRenderer = observer(
  ({
    columns,
    centerOffset,
    floorY,
    yInterval = 250 / 1000, // Default 250mm in meters
    rodDiameter = 8 / 1000, // Default 8mm in meters
    color = "red", // Default fallback color
    cornerOffset = 0.04, // Default corner offset in meters
    segmentsCount = 8, // Default number of cylinder segments
    height = configStore.shed3D.heights.COLUMNS,
    opacity = 1,
  }) => {
    const segments = useMemo(() => {
      // Generate y-levels
      const yLevels = [];
      for (let y = floorY; y <= height + floorY; y += yInterval) {
        yLevels.push(y);
      }

      return columns
        .map((c) => {
          const group = columnStore.polygons.find(
            (g) => g.name === c.groupName
          );
          if (!group) {
            console.warn(`Group not found for column:`, toJS(c));
            return null;
          }

          const groupLength = (group.data?.length || 200) / 1000;
          const groupWidth = (group.data?.width || 100) / 1000;
          const hEdgeWires = group.hEdgeWires || 8;
          const vEdgeWires = group.vEdgeWires || 4;
          const ringData = group.ringData || [];

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

          // Process ringData to generate segments
          const ringSegments = ringData
            .map((ring, ringIndex) => {
              const { on: ringLength, from, to } = ring;

              // Calculate offsets using groupLength for accurate wire placement
              const wireSpacing = groupLength / (hEdgeWires - 1); // Spacing between wires along the length
              console.log("wireSpacing", wireSpacing);
              const leftOffset = Math.abs(from) * wireSpacing + 0.05; // Offset from the leftmost point
              const rightOffset =
                Math.abs(hEdgeWires - to - 1) * wireSpacing + 0.05; // Offset from the rightmost point

              const ringMinX = minX + leftOffset;
              const ringMaxX = maxX - rightOffset;

              const ringCorners = [
                { x: ringMinX, z: minZ + cornerOffset },
                { x: ringMaxX, z: minZ + cornerOffset },
                { x: ringMaxX, z: maxZ - cornerOffset },
                { x: ringMinX, z: maxZ - cornerOffset },
              ];

              return yLevels.map((y) => {
                const ringColor = getRandomColorForRing(); // Random color for each ring
                return [
                  {
                    start: [ringCorners[0].x, y, ringCorners[0].z],
                    end: [ringCorners[1].x, y, ringCorners[1].z],
                    rotation: [0, 0, Math.PI / 2],
                    length: Math.abs(ringCorners[1].x - ringCorners[0].x),
                    color: ringColor,
                  },
                  {
                    start: [ringCorners[1].x, y, ringCorners[1].z],
                    end: [ringCorners[2].x, y, ringCorners[2].z],
                    rotation: [Math.PI / 2, 0, 0],
                    length: Math.abs(ringCorners[2].z - ringCorners[1].z),
                    color: ringColor,
                  },
                  {
                    start: [ringCorners[2].x, y, ringCorners[2].z],
                    end: [ringCorners[3].x, y, ringCorners[3].z],
                    rotation: [0, 0, Math.PI / 2],
                    length: Math.abs(ringCorners[3].x - ringCorners[2].x),
                    color: ringColor,
                  },
                  {
                    start: [ringCorners[3].x, y, ringCorners[3].z],
                    end: [ringCorners[0].x, y, ringCorners[0].z],
                    rotation: [Math.PI / 2, 0, 0],
                    length: Math.abs(ringCorners[0].z - ringCorners[3].z),
                    color: ringColor,
                  },
                ];
              });
            })
            .flat(2)
            .filter(Boolean);

          return {
            segments: ringSegments,
            color, // Fallback color
          };
        })
        .filter(Boolean);
    }, [
      columns,
      centerOffset,
      floorY,
      yInterval,
      cornerOffset,
      color,
      rodDiameter,
      segmentsCount,
      height,
    ]);

    const cylinderGeometry = useMemo(
      () =>
        new THREE.CylinderGeometry(rodDiameter, rodDiameter, 1, segmentsCount),
      [rodDiameter, segmentsCount]
    );

    return (
      <>
        {segments.map((rect, index) => {
          // Group segments by ring (using ring index and y-level) to create separate instanced meshes per ring
          const segmentsByRing = rect.segments.reduce((acc, segment, segmentIndex) => {
            const y = segment.start[1];
            const ringIndex = Math.floor(segmentIndex / 4); // Each ring has 4 segments
            const key = `${y}-${ringIndex}`;
            if (!acc[key]) acc[key] = { segments: [], color: segment.color };
            acc[key].segments.push(segment);
            return acc;
          }, {});

          return Object.entries(segmentsByRing).map(([key, { segments: ringSegments, color: ringColor }], ringIndex) => {
            const instanceCount = ringSegments.length;
            const meshRef = useRef();

            // Create material with single color for this ring
            const material = useMemo(() => {
              const segmentColor = ringColor || new THREE.Color(rect.color);
              return new THREE.MeshBasicMaterial({
                color: segmentColor,
                polygonOffset: true,
                opacity : 0.5,
                transparent: opacity < 1,
              });
            }, [ringColor, rect.color, opacity]);

            useEffect(() => {
              if (!meshRef.current) return;

              // Set instance matrices
              ringSegments.forEach((segment, segmentIndex) => {
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
            }, [ringSegments]);

            return (
              <instancedMesh
                key={`rect-${index}-ring-${ringIndex}`}
                ref={meshRef}
                args={[cylinderGeometry, material, instanceCount]}
                renderOrder={100}
              />
            );
          });
        })}
      </>
    );
  }
);

export default MultiRingRenderer;