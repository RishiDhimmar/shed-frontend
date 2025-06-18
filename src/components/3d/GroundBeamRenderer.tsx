// import React, { useMemo, useRef, useEffect } from "react";
// import { toJS } from "mobx";
// import { observer } from "mobx-react-lite";
// import * as THREE from "three";
// import dxfStore from "../../stores/DxfStore";
// import configStore from "../../stores/ConfigStore";
// import BoxRenderer from "./Box";
// import { convertToPointObjects } from "../../utils/PolygonUtils";
// import wallStore from "../../stores/WallStore";
// import RingRenderer from "./RingRenderer";
// import columnStore from "../../stores/ColumnStore";
// import baseplateStore from "../../stores/BasePlateStore";

// const scale = 1; // Scaling factor
// const WIRE_OFFSET = 0.05; // 100mm in scaled units (100mm / 1000 = 0.1)
// const LINE_SPACING = 0.15; // 150mm in scaled units (150mm / 1000 = 0.15)
// const ROD_RADIUS = 0.01; // 10mm radius for rods
// const ROD_LENGTH = 3; // 300mm length for rods

// const GroundBeamRenderer = observer(
//   ({
//     centerOffset = [0, 0, 0],
//     floorY = 0.4,
//     height = configStore.shed3D.heights.GB_Z_HEIGHT,
//   }) => {
//     const externalWallPoints =
//       convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
//     const internalWall = dxfStore.internalWallPolygon?.filter(
//       (_, index) => index % 3 !== 2
//     );
//     const internalWallPoints = convertToPointObjects(internalWall) || [];

//     console.log("internalWallPoints", internalWallPoints, externalWallPoints);

//     const {
//       beams,
//       wires,
//       extensionWires,
//       verticalLines,
//       topEdgeIndex,
//       columnRods,
//     } = useMemo(() => {
//       const beams = [];
//       const wires = [];
//       const extensionWires = [];
//       const verticalLines = [];
//       const columnRods = [];

//       // Ensure we have enough points to form at least one beam
//       const minPoints = Math.min(
//         externalWallPoints.length,
//         internalWallPoints.length
//       );
//       if (minPoints < 2) {
//         return {
//           beams: [],
//           wires: [],
//           extensionWires: [],
//           verticalLines: [],
//           columnRods: [],
//           topEdgeIndex: -1,
//         };
//       }

//       // Find the top edge by highest average z-coordinate
//       let topEdgeIndex = -1;
//       let maxZ = -Infinity;
//       for (let i = 0; i < minPoints; i++) {
//         let j = i + 1;
//         if (j >= minPoints) j = 0;
//         const zAvg = (externalWallPoints[i].y + externalWallPoints[j].y) / 2;
//         if (zAvg > maxZ) {
//           maxZ = zAvg;
//           topEdgeIndex = i;
//         }
//       }

//       // Iterate over points to create beams, wires, and vertical lines
//       for (let i = 0; i < minPoints; i++) {
//         let j = i + 1;
//         if (j >= minPoints) j = 0;
//         const points = [
//           // External points i and i+1
//           {
//             x: -(externalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
//             z: -(externalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
//           },
//           {
//             x: -(externalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
//             z: -(externalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
//           },
//           // Internal points i and i+1
//           {
//             x: -(internalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
//             z: -(internalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
//           },
//           {
//             x: -(internalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
//             z: -(internalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
//           },
//         ];

//         // Calculate bounding box for the quadrilateral
//         const xs = points.map((p) => p.x);
//         const zs = points.map((p) => p.z);
//         const minX = Math.min(...xs);
//         const maxX = Math.max(...xs);
//         const minZ = Math.min(...zs);
//         const maxZ = Math.max(...zs);

//         // Calculate dimensions
//         const boxWidth = maxX - minX;
//         const boxLength = maxZ - minZ;

//         // Use wall thickness for width, and boxLength for length
//         const width = boxWidth;
//         const length = boxLength;

//         // Calculate the primary direction for rotation (along external points)
//         const dx = points[1].x - points[0].x;
//         const dz = points[1].z - points[0].z;
//         const angle = Math.atan2(dz, dx);

//         const centerX = (minX + maxX) / 2;
//         const centerZ = (minZ + maxZ) / 2;

//         // Add beam
//         if (width > 0 && length > 0) {
//           const beamHeight = height * scale;
//           beams.push({
//             width,
//             height: beamHeight,
//             length,
//             position: [
//               centerX,
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2,
//               centerZ,
//             ],
//             rotation: [0, angle, 0],
//             color: "cyan",
//           });

//           // Calculate wire length (same as purple wires)
//           const wireLength = boxWidth > boxLength ? boxWidth : boxLength;
//           const isLengthPrimary = boxLength >= boxWidth;
//           const cosAngle = Math.cos(angle);
//           const sinAngle = Math.sin(angle);
//           const perpCos = Math.cos(angle + Math.PI / 2);
//           const perpSin = Math.sin(angle + Math.PI / 2);

//           // Add rectangular frames along the beam length
//           if (wireLength > 0) {
//             const numLines = Math.floor(wireLength / LINE_SPACING) + 1;
//             const startOffset = -((numLines - 1) * LINE_SPACING) / 2;
//             for (let k = 0; k < numLines; k++) {
//               const offset = startOffset + k * LINE_SPACING;
//               let lineX, lineZ;

//               if (isLengthPrimary) {
//                 // Lines along beam length (aligned with angle)
//                 lineX = centerX + offset * cosAngle;
//                 lineZ = centerZ + offset * sinAngle;
//               } else {
//                 // Lines along beam width (perpendicular to angle)
//                 lineX = centerX + offset * perpSin;
//                 lineZ = centerZ + offset * perpCos;
//               }

//               // Define the four corners of the rectangle in the x-y plane (width-height)
//               const halfWidth = Math.min(boxWidth, boxLength) / 2 - 0.02;
//               const halfHeight = beamHeight / 2 - 0.0004;

//               // Create four vertical posts at each corner
//               const corners = [
//                 [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin], // Top-left
//                 [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin], // Bottom-left (same as top-left)
//                 [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin], // Top-right
//                 [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin], // Bottom-right (same as top-right)
//               ];

//               // Vertical lines at each corner
//               corners.forEach(([cornerX, cornerZ], cornerIndex) => {
//                 verticalLines.push({
//                   radius: 0.008,
//                   height: beamHeight - 0.0008, // Slightly shorter than beam height
//                   position: [
//                     cornerX,
//                     configStore.shed3D.heights.GROUND_BEAM + beamHeight / 2,
//                     cornerZ,
//                   ],
//                   rotation: [0, 0, 0], // Always vertical
//                   color: "purple",
//                 });
//               });

//               // Horizontal connections between vertical posts
//               const connections = [
//                 // Top connections
//                 {
//                   start: [
//                     lineX + halfWidth * perpCos,
//                     lineZ + halfWidth * perpSin,
//                   ],
//                   end: [
//                     lineX - halfWidth * perpCos,
//                     lineZ - halfWidth * perpSin,
//                   ],
//                   verticalOffset: halfHeight,
//                 },
//                 // Bottom connections
//                 {
//                   start: [
//                     lineX + halfWidth * perpCos,
//                     lineZ + halfWidth * perpSin,
//                   ],
//                   end: [
//                     lineX - halfWidth * perpCos,
//                     lineZ - halfWidth * perpSin,
//                   ],
//                   verticalOffset: -halfHeight,
//                 },
//               ];

//               connections.forEach(({ start, end, verticalOffset }) => {
//                 const midX = (start[0] + end[0]) / 2;
//                 const midZ = (start[1] + end[1]) / 2;
//                 const length = Math.sqrt(
//                   (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2
//                 );
//                 const connAngle = Math.atan2(
//                   end[1] - start[1],
//                   end[0] - start[0]
//                 );

//                 verticalLines.push({
//                   radius: 0.008,
//                   height: length,
//                   position: [
//                     midX,
//                     configStore.shed3D.heights.GROUND_BEAM +
//                       beamHeight / 2 +
//                       verticalOffset,
//                     midZ,
//                   ],
//                   rotation: [Math.PI / 2, 0, connAngle + Math.PI / 2],
//                   color: "purple",
//                 });
//               });
//             }
//           }
//         }

//         // Add wires for all segments (top and bottom)
//         const numWires = 3;
//         const wireLength = boxWidth > boxLength ? boxWidth : boxLength;
//         for (let k = 0; k < numWires; k++) {
//           // Offset for each wire to avoid overlap
//           const offset = (k - 1) * WIRE_OFFSET; // Centered offsets: -0.05, 0, 0.05 for 3 wires

//           // Top wires
//           const topWireCenter =
//             angle === Math.PI || angle === 0
//               ? [
//                   centerX,
//                   configStore.shed3D.heights.GROUND_BEAM +
//                     configStore.shed3D.heights.GB_Z_HEIGHT -
//                     0.05,
//                   centerZ + offset,
//                 ]
//               : [
//                   centerX + offset,
//                   configStore.shed3D.heights.GROUND_BEAM +
//                     configStore.shed3D.heights.GB_Z_HEIGHT -
//                     0.05,
//                   centerZ,
//                 ];
//           const topWireRotation = [0, angle, Math.PI / 2]; // Horizontal, aligned with beam

//           wires.push({
//             radius: 0.008,
//             height: wireLength,
//             position: topWireCenter,
//             rotation: topWireRotation,
//             color: "purple",
//           });

//           // Bottom wires
//           const bottomWireCenter =
//             angle === Math.PI || angle === 0
//               ? [
//                   centerX,
//                   configStore.shed3D.heights.GROUND_BEAM + 0.05,
//                   centerZ + offset,
//                 ]
//               : [
//                   centerX + offset,
//                   configStore.shed3D.heights.GROUND_BEAM + 0.05,
//                   centerZ,
//                 ];
//           const bottomWireRotation = [0, angle, Math.PI / 2]; // Same rotation as top

//           wires.push({
//             radius: 0.008,
//             height: wireLength,
//             position: bottomWireCenter,
//             rotation: bottomWireRotation,
//             color: "purple",
//           });

//           // Calculate extension wire positions at both ends
//           const halfWireLength = wireLength / 2;
//           const cosAngle = Math.cos(angle);
//           const sinAngle = Math.sin(angle);

//           // Extension wires for top wires (extending downward)
//           const topExtensionHeight =
//             configStore.shed3D.heights.GB_Z_HEIGHT - 0.1; // From top to bottom of beam
//           [0, 1].forEach((end) => {
//             const t = end === 0 ? -1 : 1; // Start or end of the wire
//             const extX = topWireCenter[0] + t * halfWireLength * cosAngle;
//             const extZ = topWireCenter[2] + t * halfWireLength * sinAngle;
//             extensionWires.push({
//               radius: 0.008,
//               height: topExtensionHeight,
//               position: [extX, topWireCenter[1] - topExtensionHeight / 2, extZ],
//               rotation: [0, 0, 0], // Vertical
//               color: "purple",
//             });
//           });

//           // Extension wires for bottom wires (extending upward)
//           const bottomExtensionHeight =
//             configStore.shed3D.heights.GB_Z_HEIGHT - 0.1; // From bottom to top of beam
//           [0, 1].forEach((end) => {
//             const t = end === 0 ? -1 : 1; // Start or end of the wire
//             const extX = bottomWireCenter[0] + t * halfWireLength * cosAngle;
//             const extZ = bottomWireCenter[2] + t * halfWireLength * sinAngle;
//             extensionWires.push({
//               radius: 0.008,
//               height: bottomExtensionHeight,
//               position: [
//                 extX,
//                 bottomWireCenter[1] + bottomExtensionHeight / 2,
//                 extZ,
//               ],
//               rotation: [0, 0, 0], // Vertical
//               color: "purple",
//             });
//           });
//         }
//       }

//       // Process columns only once, outside the loop
//       // Process columns only once, outside the loop
//       const firstGroup = columnStore.polygons[0];
//       if (firstGroup) {
//         firstGroup.columns.map((column, index) => {
//           const columnCenter = {
//             x: -(column.center.x / 1000 - centerOffset[0]) * scale,
//             z: -(column.center.y / 1000 - centerOffset[2]) * scale,
//           };

//           // Calculate column width from hits points (assuming hits contains { point: { x, y } })
//           let columnLength = 0.2; // Fallback default width (200mm in scaled units) if points are insufficient
//           const xs = column.points.map((p) => p.x);
//           const zs = column.points.map((p) => p.y);
//           const minX = Math.min(...xs);
//           const maxX = Math.max(...xs);
//           const minZ = Math.min(...zs);
//           const maxZ = Math.max(...zs);
//           columnLength = (maxZ - minZ) / 1000;
//           let columnWidth = (maxX - minX) / 1000;

//           const rodOffset = 0.01 - columnLength; // Subtract column width from 0.01

//           // Use a default angle or derive from context if needed
//           const defaultAngle = 0; // Adjust if specific alignment is needed
//           console.log(wallStore.wallThickness / 1000);

//           columnRods.push({
//             radius: ROD_RADIUS,
//             height:
//               (baseplateStore.idealVerticalDistance - columnWidth) * 0.5 +
//               columnWidth,
//             position: [
//               column.hits[0].direction === "-x"
//                 ? columnCenter.x + columnLength + 0.08 // Adjusted offset
//                 : columnCenter.x - columnLength - 0.08, // Adjusted offset
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 0.15,
//               columnCenter.z,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//             color: "red",
//           });
//           columnRods.push({
//             radius: ROD_RADIUS,
//             height:
//               (baseplateStore.idealVerticalDistance - columnWidth) * 0.5 +
//               columnWidth,
//             position: [
//               column.hits[0].direction === "-x"
//                 ? columnCenter.x +
//                   columnLength -
//                   wallStore.wallThickness / 1000 +
//                   0.16 // Adjusted offset
//                 : columnCenter.x -
//                   columnLength +
//                   wallStore.wallThickness / 1000 -
//                   0.16, // Adjusted offset
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 0.15,
//               columnCenter.z,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//             color: "red",
//           });

//           columnRods.push({
//             radius: ROD_RADIUS,
//             height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//             position: [
//               column.hits[0].direction === "-x"
//                 ? columnCenter.x + columnLength + 0.08 // Adjusted offset
//                 : columnCenter.x - columnLength - 0.08, // Adjusted offset
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 -0.15,
//               columnCenter.z - baseplateStore.idealVerticalDistance / 2,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//             color: "red",
//           });
//           columnRods.push({
//             radius: ROD_RADIUS,
//             height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//             position: [
//               column.hits[0].direction === "-x"
//                 ? columnCenter.x +
//                   columnLength -
//                   wallStore.wallThickness / 1000 +
//                   0.16 // Adjusted offset
//                 : columnCenter.x -
//                   columnLength +
//                   wallStore.wallThickness / 1000 -
//                   0.16, // Adjusted offset
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 -0.15,
//               columnCenter.z - baseplateStore.idealVerticalDistance / 2,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//             color: "red",
//           });

//           if (index == firstGroup.columns.length / 2) {
//             columnRods.push({
//               radius: ROD_RADIUS,
//               height:
//                 (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//               position: [
//                 column.hits[0].direction === "-x"
//                   ? columnCenter.x +
//                     columnLength -
//                     0.08 // Adjusted offset
//                   : columnCenter.x -
//                     columnLength +
//                     0.08, // Adjusted offset
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z -
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//               color: "red",
//             });
//             columnRods.push({
//               radius: ROD_RADIUS,
//               height:
//                 (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//               position: [
//                 column.hits[0].direction === "-x"
//                   ? columnCenter.x +
//                     columnLength -
//                     wallStore.wallThickness / 1000 +
//                     0.16 // Adjusted offset
//                   : columnCenter.x -
//                     columnLength +
//                     wallStore.wallThickness / 1000 -
//                     0.16, // Adjusted offset
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z -
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//               color: "red",
//             });

//           }
//           if (index == 0) {
//             columnRods.push({
//               radius: ROD_RADIUS,
//               height:
//                 (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//               position: [
//                 column.hits[0].direction === "-x"
//                   ? columnCenter.x +
//                     columnLength -
//                     wallStore.wallThickness / 1000 +
//                     0.16 // Adjusted offset
//                   : columnCenter.x -
//                     columnLength +
//                     wallStore.wallThickness / 1000 -
//                     0.16, // Adjusted offset
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//               color: "red",
//             });
//             columnRods.push({
//               radius: ROD_RADIUS,
//               height:
//                 (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//               position: [
//                 column.hits[0].direction === "-x"
//                   ? columnCenter.x +
//                     columnLength -
//                     0.08 // Adjusted offset
//                   : columnCenter.x -
//                     columnLength +
//                     0.08, // Adjusted offset
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2], // Align with default direction
//             })
//           }

//         });
//       }

//       return {
//         beams: beams.filter(Boolean),
//         wires: wires.filter(Boolean),
//         extensionWires: extensionWires.filter(Boolean),
//         verticalLines: verticalLines.filter(Boolean),
//         columnRods: columnRods.filter(Boolean),
//         topEdgeIndex,
//       };
//     }, [
//       externalWallPoints,
//       internalWallPoints,
//       centerOffset,
//       height,
//       floorY,
//       configStore.shed3D.heights.GB_Z_HEIGHT,
//       columnStore.polygons, // Changed from ogGroups to polygons
//     ]);

//     // Instanced rendering for vertical lines
//     const instancedMeshRef = useRef();

//     useEffect(() => {
//       if (instancedMeshRef.current && verticalLines.length > 0) {
//         const matrix = new THREE.Matrix4();
//         const dummy = new THREE.Object3D();

//         verticalLines.forEach((line, index) => {
//           // Set position
//           dummy.position.set(
//             line.position[0],
//             line.position[1],
//             line.position[2]
//           );

//           // Set rotation
//           dummy.rotation.set(
//             line.rotation[0],
//             line.rotation[1],
//             line.rotation[2]
//           );

//           // Set scale (to adjust height)
//           dummy.scale.set(1, line.height, 1);

//           dummy.updateMatrix();
//           instancedMeshRef.current.setMatrixAt(index, dummy.matrix);
//         });

//         instancedMeshRef.current.instanceMatrix.needsUpdate = true;
//       }
//     }, [verticalLines]);

//     return (
//       <>
//         <BoxRenderer instances={beams} />

//         {wires.map((wire, index) => (
//           <mesh
//             key={`wire-${index}`}
//             position={wire.position}
//             rotation={wire.rotation}
//             depthWrite={false}
//           >
//             <cylinderGeometry
//               args={[wire.radius, wire.radius, wire.height, 8]}
//             />
//             <meshBasicMaterial color={wire.color} depthWrite={false} />
//           </mesh>
//         ))}
//         {extensionWires.map((wire, index) => (
//           <mesh
//             key={`extension-wire-${index}`}
//             position={wire.position}
//             rotation={wire.rotation}
//             depthWrite={false}
//           >
//             <cylinderGeometry
//               args={[wire.radius, wire.radius, wire.height, 8]}
//             />
//             <meshBasicMaterial color={wire.color} depthWrite={false} />
//           </mesh>
//         ))}
//         {verticalLines.length > 0 && (
//           <instancedMesh
//             ref={instancedMeshRef}
//             args={[null, null, verticalLines.length]}
//             depthWrite={false}
//           >
//             <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
//             <meshBasicMaterial color="purple" depthWrite={false} />
//           </instancedMesh>
//         )}
//         {columnRods.map((rod, index) => (
//           <mesh
//             key={`column-rod-${index}`}
//             position={rod.position}
//             rotation={rod.rotation}
//             depthWrite={false}
//           >
//             <cylinderGeometry args={[rod.radius, rod.radius, rod.height, 8]} />
//             <meshBasicMaterial color={rod.color} depthWrite={false} />
//           </mesh>
//         ))}
//       </>
//     );
//   }
// );

// export default GroundBeamRenderer;

import React, { useMemo, useRef, useEffect } from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import dxfStore from "../../stores/DxfStore";
import configStore from "../../stores/ConfigStore";
import BoxRenderer from "./Box";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import wallStore from "../../stores/WallStore";
import columnStore from "../../stores/ColumnStore";
import baseplateStore from "../../stores/BasePlateStore";

const scale = 1; // Scaling factor
const WIRE_OFFSET = 0.05; // 100mm in scaled units
const LINE_SPACING = 0.15; // 150mm in scaled units
const ROD_RADIUS = 0.01; // 10mm radius for rods

const GroundBeamRenderer = observer(
  ({
    centerOffset = [0, 0, 0],
    floorY = 0.4,
    height = configStore.shed3D.heights.GB_Z_HEIGHT,
  }) => {
    const externalWallPoints =
      convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
    const internalWall = dxfStore.internalWallPolygon?.filter(
      (_, index) => index % 3 !== 2
    );
    const internalWallPoints = convertToPointObjects(internalWall) || [];

    const {
      beams,
      wires,
      extensionWires,
      verticalLines,
      topEdgeIndex,
      columnRods,
      centerBeam,
      centerWires,
      centerExtensionWires,
      centerVerticalLines,
    } = useMemo(() => {
      const beams = [];
      const wires = [];
      const extensionWires = [];
      const verticalLines = [];
      const columnRods = [];
      const centerBeam = [];
      const centerWires = [];
      const centerExtensionWires = [];
      const centerVerticalLines = [];

      const minPoints = Math.min(
        externalWallPoints.length,
        internalWallPoints.length
      );
      if (minPoints < 2) {
        return {
          beams: [],
          wires: [],
          extensionWires: [],
          verticalLines: [],
          columnRods: [],
          centerBeam: [],
          centerWires: [],
          centerExtensionWires: [],
          centerVerticalLines: [],
          topEdgeIndex: -1,
        };
      }

      // Find the top edge
      let topEdgeIndex = -1;
      let maxZ = -Infinity;
      for (let i = 0; i < minPoints; i++) {
        let j = i + 1;
        if (j >= minPoints) j = 0;
        const zAvg = (externalWallPoints[i].y + externalWallPoints[j].y) / 2;
        if (zAvg > maxZ) {
          maxZ = zAvg;
          topEdgeIndex = i;
        }
      }

      // Calculate beam segment center points for polygon centroid
      const beamCenters = [];
      const beamDimensions = [];
      for (let i = 0; i < minPoints; i++) {
        let j = i + 1;
        if (j >= minPoints) j = 0;
        const points = [
          {
            x: -(externalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
            z: -(externalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
          },
          {
            x: -(externalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
            z: -(externalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
          },
          {
            x: -(internalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
            z: -(internalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
          },
          {
            x: -(internalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
            z: -(internalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
          },
        ];

        // Calculate bounding box with unique variable names
        const xs = points.map((p) => p.x);
        const zs = points.map((p) => p.z);
        const segMinX = Math.min(...xs);
        const segMaxX = Math.max(...xs);
        const segMinZ = Math.min(...zs);
        const segMaxZ = Math.max(...zs);

        const boxWidth = segMaxX - segMinX;
        const boxLength = segMaxZ - segMinZ;
        const width = boxWidth;
        const length = boxLength;

        const dx = points[1].x - points[0].x;
        const dz = points[1].z - points[0].z;
        const angle = Math.atan2(dz, dx);

        const centerX = (segMinX + segMaxX) / 2;
        const centerZ = (segMinZ + segMaxZ) / 2;

        // Store beam center
        beamCenters.push({ x: centerX, z: centerZ });
        beamDimensions.push({ width, length, angle });

        // Add original beam
        if (width > 0 && length > 0) {
          const beamHeight = height * scale;
          beams.push({
            width,
            height: beamHeight,
            length,
            position: [
              centerX,
              configStore.shed3D.heights.GROUND_BEAM +
                configStore.shed3D.heights.GB_Z_HEIGHT / 2,
              centerZ,
            ],
            rotation: [0, angle, 0],
            color: "cyan",
          });

          // Original wire configuration
          const wireLength = boxWidth > boxLength ? boxWidth : boxLength;
          const isLengthPrimary = boxLength >= boxWidth;
          const cosAngle = Math.cos(angle);
          const sinAngle = Math.sin(angle);
          const perpCos = Math.cos(angle + Math.PI / 2);
          const perpSin = Math.sin(angle + Math.PI / 2);

          if (wireLength > 0) {
            const numLines = Math.floor(wireLength / LINE_SPACING) + 1;
            const startOffset = -((numLines - 1) * LINE_SPACING) / 2;
            for (let k = 0; k < numLines; k++) {
              const offset = startOffset + k * LINE_SPACING;
              let lineX, lineZ;

              if (isLengthPrimary) {
                lineX = centerX + offset * cosAngle;
                lineZ = centerZ + offset * sinAngle;
              } else {
                lineX = centerX + offset * perpSin;
                lineZ = centerZ + offset * perpCos;
              }

              const halfWidth = Math.min(boxWidth, boxLength) / 2 - 0.02;
              const halfHeight = beamHeight / 2 - 0.0004;

              const corners = [
                [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
                [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
                [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
                [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
              ];

              corners.forEach(([cornerX, cornerZ]) => {
                verticalLines.push({
                  radius: 0.008,
                  height: beamHeight - 0.0008,
                  position: [
                    cornerX,
                    configStore.shed3D.heights.GROUND_BEAM + beamHeight / 2,
                    cornerZ,
                  ],
                  rotation: [0, 0, 0],
                  color: "purple",
                });
              });

              const connections = [
                {
                  start: [
                    lineX + halfWidth * perpCos,
                    lineZ + halfWidth * perpSin,
                  ],
                  end: [
                    lineX - halfWidth * perpCos,
                    lineZ - halfWidth * perpSin,
                  ],
                  verticalOffset: halfHeight,
                },
                {
                  start: [
                    lineX + halfWidth * perpCos,
                    lineZ + halfWidth * perpSin,
                  ],
                  end: [
                    lineX - halfWidth * perpCos,
                    lineZ - halfWidth * perpSin,
                  ],
                  verticalOffset: -halfHeight,
                },
              ];

              connections.forEach(({ start, end, verticalOffset }) => {
                const midX = (start[0] + end[0]) / 2;
                const midZ = (start[1] + end[1]) / 2;
                const length = Math.sqrt(
                  (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2
                );
                const connAngle = Math.atan2(
                  end[1] - start[1],
                  end[0] - start[0]
                );

                verticalLines.push({
                  radius: 0.008,
                  height: length,
                  position: [
                    midX,
                    configStore.shed3D.heights.GROUND_BEAM +
                      beamHeight / 2 +
                      verticalOffset,
                    midZ,
                  ],
                  rotation: [Math.PI / 2, 0, connAngle + Math.PI / 2],
                  color: "purple",
                });
              });
            }
          }

          const numWires = 3;
          for (let k = 0; k < numWires; k++) {
            const offset = (k - 1) * WIRE_OFFSET;
            const topWireCenter =
              angle === Math.PI || angle === 0
                ? [
                    centerX,
                    configStore.shed3D.heights.GROUND_BEAM +
                      configStore.shed3D.heights.GB_Z_HEIGHT -
                      0.05,
                    centerZ + offset,
                  ]
                : [
                    centerX + offset,
                    configStore.shed3D.heights.GROUND_BEAM +
                      configStore.shed3D.heights.GB_Z_HEIGHT -
                      0.05,
                    centerZ,
                  ];
            const topWireRotation = [0, angle, Math.PI / 2];

            wires.push({
              radius: 0.008,
              height: wireLength,
              position: topWireCenter,
              rotation: topWireRotation,
              color: "purple",
            });

            const bottomWireCenter =
              angle === Math.PI || angle === 0
                ? [
                    centerX,
                    configStore.shed3D.heights.GROUND_BEAM + 0.05,
                    centerZ + offset,
                  ]
                : [
                    centerX + offset,
                    configStore.shed3D.heights.GROUND_BEAM + 0.05,
                    centerZ,
                  ];
            const bottomWireRotation = [0, angle, Math.PI / 2];

            wires.push({
              radius: 0.008,
              height: wireLength,
              position: bottomWireCenter,
              rotation: bottomWireRotation,
              color: "purple",
            });

            const topExtensionHeight =
              configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
            [0, 1].forEach((end) => {
              const t = end === 0 ? -1 : 1;
              const extX = topWireCenter[0] + t * (wireLength / 2) * cosAngle;
              const extZ = topWireCenter[2] + t * (wireLength / 2) * sinAngle;
              extensionWires.push({
                radius: 0.008,
                height: topExtensionHeight,
                position: [
                  extX,
                  topWireCenter[1] - topExtensionHeight / 2,
                  extZ,
                ],
                rotation: [0, 0, 0],
                color: "purple",
              });
            });

            const bottomExtensionHeight =
              configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
            [0, 1].forEach((end) => {
              const t = end === 0 ? -1 : 1;
              const extX =
                bottomWireCenter[0] + t * (wireLength / 2) * cosAngle;
              const extZ =
                bottomWireCenter[2] + t * (wireLength / 2) * sinAngle;
              extensionWires.push({
                radius: 0.008,
                height: bottomExtensionHeight,
                position: [
                  extX,
                  bottomWireCenter[1] + bottomExtensionHeight / 2,
                  extZ,
                ],
                rotation: [0, 0, 0],
                color: "purple",
              });
            });
          }
        }
      }

      // Calculate centroid of beam centers
      const sum = beamCenters.reduce(
        (acc, p) => ({
          x: acc.x + p.x,
          z: acc.z + p.z,
        }),
        { x: 0, z: 0 }
      );

      const centroid = {
        x: sum.x / beamCenters.length,
        z: sum.z / beamCenters.length,
      };

      centroid.x /= beamCenters.length;
      centroid.z /= beamCenters.length;

      // Estimate primary axis using bounding box of beam centers
      const xs = beamCenters.map((p) => p.x);
      const zs = beamCenters.map((p) => p.z);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minZ = Math.min(...zs);
      const maxZ2 = Math.max(...zs);
      const widthRange = maxX - minX;
      const lengthRange = maxZ2 - minZ;
      const isLengthPrimary = lengthRange >= widthRange;
      const centerAngle = isLengthPrimary ? 0 : Math.PI / 2; // Align along z or x axis

      // Average beam dimensions
      const avgWidth =
        beamDimensions.reduce(
          (sum, d) => sum + Math.min(d.width, d.length),
          0
        ) / beamDimensions.length;
      const avgLength = isLengthPrimary ? lengthRange : widthRange;
      const beamHeight = height * scale;

      // Raycast to determine beam length
      const raycaster = new THREE.Raycaster();
      const rayOrigin = new THREE.Vector3(
        centroid.x,
        beamHeight / 2,
        centroid.z
      );
      const rayDirection = new THREE.Vector3(
        isLengthPrimary ? 0 : 1,
        0,
        isLengthPrimary ? 1 : 0
      ).normalize();
      let beamLength = avgLength;

      // Create temporary mesh for raycasting (approximating polygon bounds)
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(
        beamCenters.flatMap((p) => [p.x, beamHeight / 2, p.z])
      );
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      const mesh = new THREE.Mesh(geometry);
      mesh.updateMatrixWorld();

      // Cast rays in both directions
      const intersections = [];
      raycaster.set(rayOrigin, rayDirection);
      let intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0) intersections.push(intersects[0].distance);
      raycaster.set(rayOrigin, rayDirection.negate());
      intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0) intersections.push(intersects[0].distance);

      if (intersections.length > 0) {
        beamLength = Math.min(beamLength, Math.max(...intersections) * 2);
      }

      centroid.x = (centroid.x - centerOffset[0] / 1000) / 1000;
      centroid.z = (centroid.z - centerOffset[0] / 1000) / 1000;

      // Add single center beam
      if (avgWidth > 0 && beamLength > 0) {
        centerBeam.push({
          width: avgWidth,
          height: beamHeight,
          length: beamLength,
          position: [
            centroid.x,
            configStore.shed3D.heights.GROUND_BEAM +
              configStore.shed3D.heights.GB_Z_HEIGHT / 2,
            centroid.z,
          ],
          rotation: [0, centerAngle, 0],
          color: "cyan",
        });

        // Wire configuration for center beam
        const wireLength = beamLength;
        const cosAngle = Math.cos(centerAngle);
        const sinAngle = Math.sin(centerAngle);
        const perpCos = Math.cos(centerAngle + Math.PI / 2);
        const perpSin = Math.sin(centerAngle + Math.PI / 2);

        if (wireLength > 0) {
          const numLines = Math.floor(wireLength / LINE_SPACING) + 1;
          const startOffset = -((numLines - 1) * LINE_SPACING) / 2;
          for (let k = 0; k < numLines; k++) {
            const offset = startOffset + k * LINE_SPACING;
            const lineX = centroid.x + offset * cosAngle;
            const lineZ = centroid.z + offset * sinAngle;

            const halfWidth = avgWidth / 2 - 0.02;
            const halfHeight = beamHeight / 2 - 0.0004;

            const corners = [
              [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
              [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
              [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
              [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
            ];

            corners.forEach(([cornerX, cornerZ]) => {
              centerVerticalLines.push({
                radius: 0.008,
                height: beamHeight - 0.0008,
                position: [
                  cornerX,
                  configStore.shed3D.heights.GROUND_BEAM + beamHeight / 2,
                  cornerZ,
                ],
                rotation: [0, centerAngle + Math.PI / 2, 0],
                color: "purple",
              });
            });

            const connections = [
              {
                start: [
                  lineX + halfWidth * perpCos,
                  lineZ + halfWidth * perpSin,
                ],
                end: [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
                verticalOffset: halfHeight,
              },
              {
                start: [
                  lineX + halfWidth * perpCos,
                  lineZ + halfWidth * perpSin,
                ],
                end: [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
                verticalOffset: -halfHeight,
              },
            ];

            connections.forEach(({ start, end, verticalOffset }) => {
              const midX = (start[0] + end[0]) / 2;
              const midZ = (start[1] + end[1]) / 2;
              const length = Math.sqrt(
                (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2
              );
              const connAngle = Math.atan2(
                end[1] - start[1],
                end[0] - start[0]
              );

              centerVerticalLines.push({
                radius: 0.008,
                height: length,
                position: [
                  midX,
                  configStore.shed3D.heights.GROUND_BEAM +
                    beamHeight / 2 +
                    verticalOffset,
                  midZ,
                ],
                rotation: [Math.PI / 2, 0, connAngle + Math.PI / 2],
                color: "purple",
              });
            });
          }
        }

        const numWires = 3;
        for (let k = 0; k < numWires; k++) {
          const offset = (k - 1) * WIRE_OFFSET;
          const topWireCenter = [
            centroid.x + (isLengthPrimary ? 0 : offset),
            configStore.shed3D.heights.GROUND_BEAM +
              configStore.shed3D.heights.GB_Z_HEIGHT -
              0.05,
            centroid.z + (isLengthPrimary ? offset : 0),
          ];
          const topWireRotation = [0, centerAngle, Math.PI / 2];

          centerWires.push({
            radius: 0.008,
            height: wireLength,
            position: topWireCenter,
            rotation: topWireRotation,
            color: "purple",
          });

          const bottomWireCenter = [
            centroid.x + (isLengthPrimary ? 0 : offset),
            configStore.shed3D.heights.GROUND_BEAM + 0.05,
            centroid.z + (isLengthPrimary ? offset : 0),
          ];
          const bottomWireRotation = [0, centerAngle, Math.PI / 2];

          centerWires.push({
            radius: 0.008,
            height: wireLength,
            position: bottomWireCenter,
            rotation: bottomWireRotation,
            color: "purple",
          });

          const topExtensionHeight =
            configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
          [0, 1].forEach((end) => {
            const t = end === 0 ? -1 : 1;
            const extX = topWireCenter[0] + t * (wireLength / 2) * cosAngle;
            const extZ = topWireCenter[2] + t * (wireLength / 2) * sinAngle;
            centerExtensionWires.push({
              radius: 0.008,
              height: topExtensionHeight,
              position: [extX, topWireCenter[1] - topExtensionHeight / 2, extZ],
              rotation: [0, 0, 0],
              color: "purple",
            });
          });

          const bottomExtensionHeight =
            configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
          [0, 1].forEach((end) => {
            const t = end === 0 ? -1 : 1;
            const extX = bottomWireCenter[0] + t * (wireLength / 2) * cosAngle;
            const extZ = bottomWireCenter[2] + t * (wireLength / 2) * sinAngle;
            centerExtensionWires.push({
              radius: 0.008,
              height: bottomExtensionHeight,
              position: [
                extX,
                bottomWireCenter[1] + bottomExtensionHeight / 2,
                extZ,
              ],
              rotation: [0, 0, 0],
              color: "purple",
            });
          });
        }
      }

      // Process columns (unchanged)
      const firstGroup = columnStore.polygons[0];
      if (firstGroup) {
        firstGroup.columns.map((column, index) => {
          const columnCenter = {
            x: -(column.center.x / 1000 - centerOffset[0]) * scale,
            z: -(column.center.y / 1000 - centerOffset[2]) * scale,
          };

          let columnLength = 0.2;
          const xs = column.points.map((p) => p.x);
          const zs = column.points.map((p) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minZ = Math.min(...zs);
          const maxZ = Math.max(...zs);
          columnLength = (maxZ - minZ) / 1000;
          let columnWidth = (maxX - minX) / 1000;

          const defaultAngle = 0;

          columnRods.push({
            radius: ROD_RADIUS,
            height:
              (baseplateStore.idealVerticalDistance - columnWidth) * 0.5 +
              columnWidth,
            position: [
              column.hits[0].direction === "-x"
                ? columnCenter.x + columnLength + 0.08
                : columnCenter.x - columnLength - 0.08,
              configStore.shed3D.heights.GROUND_BEAM +
                configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                0.15,
              columnCenter.z,
            ],
            rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
            color: "red",
          });
          columnRods.push({
            radius: ROD_RADIUS,
            height:
              (baseplateStore.idealVerticalDistance - columnWidth) * 0.5 +
              columnWidth,
            position: [
              column.hits[0].direction === "-x"
                ? columnCenter.x +
                  columnLength -
                  wallStore.wallThickness / 1000 +
                  0.16
                : columnCenter.x -
                  columnLength +
                  wallStore.wallThickness / 1000 -
                  0.16,
              configStore.shed3D.heights.GROUND_BEAM +
                configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                0.15,
              columnCenter.z,
            ],
            rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
            color: "red",
          });

          columnRods.push({
            radius: ROD_RADIUS,
            height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
            position: [
              column.hits[0].direction === "-x"
                ? columnCenter.x + columnLength + 0.08
                : columnCenter.x - columnLength - 0.08,
              configStore.shed3D.heights.GROUND_BEAM +
                configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                -0.15,
              columnCenter.z - baseplateStore.idealVerticalDistance / 2,
            ],
            rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
            color: "red",
          });
          columnRods.push({
            radius: ROD_RADIUS,
            height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
            position: [
              column.hits[0].direction === "-x"
                ? columnCenter.x +
                  columnLength -
                  wallStore.wallThickness / 1000 +
                  0.16
                : columnCenter.x -
                  columnLength +
                  wallStore.wallThickness / 1000 -
                  0.16,
              configStore.shed3D.heights.GROUND_BEAM +
                configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                -0.15,
              columnCenter.z - baseplateStore.idealVerticalDistance / 2,
            ],
            rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
            color: "red",
          });

          if (index === firstGroup.columns.length / 2) {
            columnRods.push({
              radius: ROD_RADIUS,
              height:
                (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
              position: [
                column.hits[0].direction === "-x"
                  ? columnCenter.x + columnLength - 0.08
                  : columnCenter.x - columnLength + 0.08,
                configStore.shed3D.heights.GROUND_BEAM +
                  configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                  -0.15,
                columnCenter.z -
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance / 2,
              ],
              rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
              color: "red",
            });
            columnRods.push({
              radius: ROD_RADIUS,
              height:
                (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
              position: [
                column.hits[0].direction === "-x"
                  ? columnCenter.x +
                    columnLength -
                    wallStore.wallThickness / 1000 +
                    0.16
                  : columnCenter.x -
                    columnLength +
                    wallStore.wallThickness / 1000 -
                    0.16,
                configStore.shed3D.heights.GROUND_BEAM +
                  configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                  -0.15,
                columnCenter.z -
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance / 2,
              ],
              rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
              color: "red",
            });
          }
          if (index === 0) {
            columnRods.push({
              radius: ROD_RADIUS,
              height:
                (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
              position: [
                column.hits[0].direction === "-x"
                  ? columnCenter.x +
                    columnLength -
                    wallStore.wallThickness / 1000 +
                    0.16
                  : columnCenter.x -
                    columnLength +
                    wallStore.wallThickness / 1000 -
                    0.16,
                configStore.shed3D.heights.GROUND_BEAM +
                  configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                  -0.15,
                columnCenter.z +
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance / 2,
              ],
              rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
              color: "red",
            });
            columnRods.push({
              radius: ROD_RADIUS,
              height:
                (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
              position: [
                column.hits[0].direction === "-x"
                  ? columnCenter.x + columnLength - 0.08
                  : columnCenter.x - columnLength + 0.08,
                configStore.shed3D.heights.GROUND_BEAM +
                  configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
                  -0.15,
                columnCenter.z +
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance +
                  baseplateStore.idealVerticalDistance / 2,
              ],
              rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
              color: "red",
            });
          }
        });
      }

      return {
        beams: beams.filter(Boolean),
        wires: wires.filter(Boolean),
        extensionWires: extensionWires.filter(Boolean),
        verticalLines: verticalLines.filter(Boolean),
        columnRods: columnRods.filter(Boolean),
        centerBeam: centerBeam.filter(Boolean),
        centerWires: centerWires.filter(Boolean),
        centerExtensionWires: centerExtensionWires.filter(Boolean),
        centerVerticalLines: centerVerticalLines.filter(Boolean),
        topEdgeIndex,
      };
    }, [
      externalWallPoints,
      internalWallPoints,
      centerOffset,
      height,
      floorY,
      configStore.shed3D.heights.GB_Z_HEIGHT,
      columnStore.polygons,
    ]);

    // Instanced rendering for vertical lines
    const instancedMeshRef = useRef();
    const centerInstancedMeshRef = useRef();

    useEffect(() => {
      if (instancedMeshRef.current && verticalLines.length > 0) {
        const matrix = new THREE.Matrix4();
        const dummy = new THREE.Object3D();

        verticalLines.forEach((line, index) => {
          dummy.position.set(
            line.position[0],
            line.position[1],
            line.position[2]
          );
          dummy.rotation.set(
            line.rotation[0],
            line.rotation[1],
            line.rotation[2]
          );
          dummy.scale.set(1, line.height, 1);
          dummy.updateMatrix();
          instancedMeshRef.current.setMatrixAt(index, dummy.matrix);
        });

        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }, [verticalLines]);

    useEffect(() => {
      if (centerInstancedMeshRef.current && centerVerticalLines.length > 0) {
        const matrix = new THREE.Matrix4();
        const dummy = new THREE.Object3D();

        centerVerticalLines.forEach((line, index) => {
          dummy.position.set(
            line.position[0],
            line.position[1],
            line.position[2]
          );
          dummy.rotation.set(
            line.rotation[0],
            line.rotation[1],
            line.rotation[2]
          );
          dummy.scale.set(1, line.height, 1);
          dummy.updateMatrix();
          
          centerInstancedMeshRef.current.setMatrixAt(index, dummy.matrix);
        });

        centerInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }, [centerVerticalLines]);

    return (
      <>
        <BoxRenderer instances={beams} />
        <BoxRenderer instances={centerBeam} />

        {wires.map((wire, index) => (
          <mesh
            key={`wire-${index}`}
            position={wire.position}
            rotation={wire.rotation}
            depthWrite={false}
          >
            <cylinderGeometry
              args={[wire.radius, wire.radius, wire.height, 8]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))}
        {extensionWires.map((wire, index) => (
          <mesh
            key={`extension-wire-${index}`}
            position={wire.position}
            rotation={wire.rotation}
            depthWrite={false}
          >
            <cylinderGeometry
              args={[wire.radius, wire.radius, wire.height, 8]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))}
        {verticalLines.length > 0 && (
          <instancedMesh
            ref={instancedMeshRef}
            args={[null, null, verticalLines.length]}
            depthWrite={false}
          >
            <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
            <meshBasicMaterial color="purple" depthWrite={false} />
          </instancedMesh>
        )}
        {centerWires.map((wire, index) => (
          <mesh
            key={`center-wire-${index}`}
            position={wire.position}
            rotation={[wire.rotation[0], Math.PI / 2, wire.rotation[2]]}
            depthWrite={false}
          >
            <cylinderGeometry
              args={[wire.radius, wire.radius, wire.height, 8]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))}
        {/* {centerExtensionWires.map((wire, index) => (
          <mesh
            key={`center-extension-wire-${index}`}
            position={wire.position}
            rotation={[wire.rotation[0], wire.rotation[1], wire.rotation[2]]}
            depthWrite={false}
          >
            <cylinderGeometry
              args={[wire.radius, wire.radius, wire.height, 8]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))} */}
        {centerVerticalLines.length > 0 && (
          <instancedMesh
            ref={centerInstancedMeshRef}
            args={[null, null, centerVerticalLines.length]}
            depthWrite={false}
            rotation={[0, Math.PI / 2, 0]}
          >
            <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
            <meshBasicMaterial color="purple" depthWrite={false} />
          </instancedMesh>
        )}
        {columnRods.map((rod, index) => (
          <mesh
            key={`column-rod-${index}`}
            position={rod.position}
            rotation={rod.rotation}
            depthWrite={false}
          >
            <cylinderGeometry args={[rod.radius, rod.radius, rod.height, 8]} />
            <meshBasicMaterial color={rod.color} depthWrite={false} />
          </mesh>
        ))}
      </>
    );
  }
);

export default GroundBeamRenderer;
