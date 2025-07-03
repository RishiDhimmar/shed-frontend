// import React, { useMemo, useRef, useEffect } from "react";
// import { toJS } from "mobx";
// import { observer } from "mobx-react-lite";
// import * as THREE from "three";
// import dxfStore from "../../stores/DxfStore";
// import configStore from "../../stores/ConfigStore";
// import BoxRenderer from "./Box";
// import { convertToPointObjects } from "../../utils/PolygonUtils";
// import wallStore from "../../stores/WallStore";
// import columnStore from "../../stores/ColumnStore";
// import baseplateStore from "../../stores/BasePlateStore";

// const scale = 1; // Scaling factor
// const WIRE_OFFSET = 0.05; // 100mm in scaled units
// const ROD_RADIUS = 0.008; // 10mm radius for rods

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

//     const {
//       beams,
//       wires,
//       extensionWires,
//       verticalLines,
//       topEdgeIndex,
//       columnRods,
//       centerBeam,
//       centerWires,
//       centerExtensionWires,
//       centerVerticalLines,
//       totalLength, // Added to compute total length
//     } = useMemo(() => {
//       const beams = [];
//       const wires = [];
//       const extensionWires = [];
//       const verticalLines = [];
//       const columnRods = [];
//       const centerBeam = [];
//       const centerWires = [];
//       const centerExtensionWires = [];
//       const centerVerticalLines = [];

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
//           centerBeam: [],
//           centerWires: [],
//           centerExtensionWires: [],
//           centerVerticalLines: [],
//           topEdgeIndex: -1,
//           totalLength: 0,
//         };
//       }

//       // Find the top edge
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

//       // Calculate beam segment center points for polygon centroid
//       const beamCenters = [];
//       const beamDimensions = [];
//       for (let i = 0; i < minPoints; i++) {
//         let j = i + 1;
//         if (j >= minPoints) j = 0;
//         const points = [
//           {
//             x: -(externalWallPoints[i].x / 1000 - centerOffset[0]),
//             z: -(externalWallPoints[i].y / 1000 - centerOffset[2]),
//           },
//           {
//             x: -(externalWallPoints[j].x / 1000 - centerOffset[0]),
//             z: -(externalWallPoints[j].y / 1000 - centerOffset[2]),
//           },
//           {
//             x: -(internalWallPoints[i].x / 1000 - centerOffset[0]),
//             z: -(internalWallPoints[i].y / 1000 - centerOffset[2]),
//           },
//           {
//             x: -(internalWallPoints[j].x / 1000 - centerOffset[0]),
//             z: -(internalWallPoints[j].y / 1000 - centerOffset[2]),
//           },
//         ];

//         // Calculate bounding box
//         const xs = points.map((p) => p.x);
//         const zs = points.map((p) => p.z);
//         const segMinX = Math.min(...xs);
//         const segMaxX = Math.max(...xs);
//         const segMinZ = Math.min(...zs);
//         const segMaxZ = Math.max(...zs);

//         const boxWidth = segMaxX - segMinX;
//         const boxLength = segMaxZ - segMinZ;
//         const width = boxWidth;
//         const length = boxLength;

//         const dx = points[1].x - points[0].x;
//         const dz = points[1].z - points[0].z;
//         const angle = Math.atan2(dz, dx);

//         const centerX = (segMinX + segMaxX) / 2;
//         const centerZ = (segMinZ + segMaxZ) / 2;

//         // Store beam center
//         beamCenters.push({ x: centerX, z: centerZ });
//         beamDimensions.push({ width, length, angle });

//         // Add original beam
//         if (width > 0 && length > 0) {
//           const beamHeight = height * scale;
//           beams.push({
//             width:
//               i % 2 !== 0
//                 ? width - (2 * wallStore.wallThickness) / 1000
//                 : width,
//             height: beamHeight,
//             length:
//               i % 2 === 0
//                 ? length
//                 : length - (2 * wallStore.wallThickness) / 1000,
//             position: [
//               centerX,
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2,
//               centerZ,
//             ],
//             rotation: [0, angle, 0],
//             color: "cyan",
//           });

//           // Wire configuration
//           const wireLength =
//             boxWidth > boxLength ? boxWidth - 0.02 : boxLength - 0.05;
//           const isLengthPrimary = boxLength >= boxWidth;
//           const cosAngle = Math.cos(angle);
//           const sinAngle = Math.sin(angle);
//           const perpCos = Math.cos(angle + Math.PI / 2);
//           const perpSin = Math.sin(angle + Math.PI / 2);

//           if (wireLength > 0) {
//             const numLines =
//               Math.floor(wireLength / configStore.RINGS.GROUND_BEAM.gap) + 1;
//             const startOffset =
//               -((numLines - 1) * configStore.RINGS.GROUND_BEAM.gap) / 2;
//             for (let k = 0; k < numLines; k++) {
//               const offset =
//                 startOffset + k * configStore.RINGS.GROUND_BEAM.gap;
//               let lineX, lineZ;

//               if (isLengthPrimary) {
//                 lineX = centerX + offset * cosAngle;
//                 lineZ = centerZ + offset * sinAngle;
//               } else {
//                 lineX = centerX + offset * perpSin;
//                 lineZ = centerZ + offset * perpCos;
//               }

//               const halfWidth = Math.min(boxWidth, boxLength) / 2 - 0.02;
//               const halfHeight = beamHeight / 2 - 0.0004;

//               const corners = [
//                 [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
//                 [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
//                 [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
//                 [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
//               ];

//               corners.forEach(([cornerX, cornerZ]) => {
//                 verticalLines.push({
//                   radius: 0.008,
//                   height: beamHeight - 0.0008,
//                   position: [
//                     cornerX,
//                     configStore.shed3D.heights.GROUND_BEAM + beamHeight / 2,
//                     cornerZ,
//                   ],
//                   rotation: [0, 0, 0],
//                   color: "purple",
//                 });
//               });

//               const connections = [
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

//           const numWires = 3;
//           for (let k = 0; k < numWires; k++) {
//             const offset = (k - 1) * WIRE_OFFSET;
//             const topWireCenter =
//               angle === Math.PI || angle === 0
//                 ? [
//                     centerX,
//                     configStore.shed3D.heights.GROUND_BEAM +
//                       configStore.shed3D.heights.GB_Z_HEIGHT -
//                       0.05,
//                     centerZ + offset,
//                   ]
//                 : [
//                     centerX + offset,
//                     configStore.shed3D.heights.GROUND_BEAM +
//                       configStore.shed3D.heights.GB_Z_HEIGHT -
//                       0.05,
//                     centerZ,
//                   ];
//             const topWireRotation = [0, angle, Math.PI / 2];

//             wires.push({
//               radius: 0.008,
//               height: wireLength,
//               position: topWireCenter,
//               rotation: topWireRotation,
//               color: "purple",
//             });

//             const bottomWireCenter =
//               angle === Math.PI || angle === 0
//                 ? [
//                     centerX,
//                     configStore.shed3D.heights.GROUND_BEAM + 0.05,
//                     centerZ + offset,
//                   ]
//                 : [
//                     centerX + offset,
//                     configStore.shed3D.heights.GROUND_BEAM + 0.05,
//                     centerZ,
//                   ];
//             const bottomWireRotation = [0, angle, Math.PI / 2];

//             wires.push({
//               radius: 0.008,
//               height: wireLength,
//               position: bottomWireCenter,
//               rotation: bottomWireRotation,
//               color: "purple",
//             });

//             const topExtensionHeight =
//               configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
//             [0, 1].forEach((end) => {
//               const t = end === 0 ? -1 : 1;
//               const extX = topWireCenter[0] + t * (wireLength / 2) * cosAngle;
//               const extZ = topWireCenter[2] + t * (wireLength / 2) * sinAngle;
//               extensionWires.push({
//                 radius: 0.008,
//                 height: topExtensionHeight,
//                 position: [
//                   extX,
//                   topWireCenter[1] - topExtensionHeight / 2,
//                   extZ,
//                 ],
//                 rotation: [0, 0, 0],
//                 color: "purple",
//               });
//             });

//             const bottomExtensionHeight =
//               configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
//             [0, 1].forEach((end) => {
//               const t = end === 0 ? -1 : 1;
//               const extX =
//                 bottomWireCenter[0] + t * (wireLength / 2) * cosAngle;
//               const extZ =
//                 bottomWireCenter[2] + t * (wireLength / 2) * sinAngle;
//               extensionWires.push({
//                 radius: 0.008,
//                 height: bottomExtensionHeight,
//                 position: [
//                   extX,
//                   bottomWireCenter[1] + bottomExtensionHeight / 2,
//                   extZ,
//                 ],
//                 rotation: [0, 0, 0],
//                 color: "purple",
//               });
//             });
//           }
//         }
//       }

//       // Calculate centroid of beam centers
//       const sum = beamCenters.reduce(
//         (acc, p) => ({
//           x: acc.x + p.x,
//           z: acc.z + p.z,
//         }),
//         { x: 0, z: 0 }
//       );

//       const centroid = {
//         x: sum.x / beamCenters.length,
//         z: sum.z / beamCenters.length,
//       };

//       // Estimate primary axis using bounding box of beam centers
//       const xs = beamCenters.map((p) => p.x);
//       const zs = beamCenters.map((p) => p.z);
//       const minX = Math.min(...xs);
//       const maxX = Math.max(...xs);
//       const minZ = Math.min(...zs);
//       const maxZ2 = Math.max(...zs);
//       const widthRange = maxX - minX;
//       const lengthRange = maxZ2 - minZ;
//       const isLengthPrimary = lengthRange >= widthRange;
//       const centerAngle = isLengthPrimary ? 0 : Math.PI / 2;

//       // Average beam dimensions
//       const avgWidth =
//         beamDimensions.reduce(
//           (sum, d) => sum + Math.min(d.width, d.length),
//           0
//         ) / beamDimensions.length;
//       const avgLength = isLengthPrimary ? lengthRange : widthRange;
//       const beamHeight = height * scale;

//       // Raycast to determine beam length
//       const raycaster = new THREE.Raycaster();
//       const rayOrigin = new THREE.Vector3(
//         centroid.x,
//         beamHeight / 2,
//         centroid.z
//       );
//       const rayDirection = new THREE.Vector3(
//         isLengthPrimary ? 0 : 1,
//         0,
//         isLengthPrimary ? 1 : 0
//       ).normalize();
//       let beamLength = avgLength;

//       const geometry = new THREE.BufferGeometry();
//       const vertices = new Float32Array(
//         beamCenters.flatMap((p) => [p.x, beamHeight / 2, p.z])
//       );
//       geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
//       const mesh = new THREE.Mesh(geometry);
//       mesh.updateMatrixWorld();

//       const intersections = [];
//       raycaster.set(rayOrigin, rayDirection);
//       let intersects = raycaster.intersectObject(mesh);
//       if (intersects.length > 0) intersections.push(intersects[0].distance);
//       raycaster.set(rayOrigin, rayDirection.negate());
//       intersects = raycaster.intersectObject(mesh);
//       if (intersects.length > 0) intersections.push(intersects[0].distance);

//       // if (intersections.length > 0) {
//       //   beamLength = Math.min(beamLength, Math.max(...intersections) * 2);
//       // }

//       centroid.x = (centroid.x - centerOffset[0] / 1000) / 1000;
//       centroid.z = (centroid.z - centerOffset[0] / 1000) / 1000;

//       beamLength = beamLength - wallStore.wallThickness / 1000;

//       // Add single center beam
//       if (avgWidth > 0 && beamLength > 0) {
//         centerBeam.push({
//           width: avgWidth,
//           height: beamHeight,
//           length: beamLength,
//           position: [
//             centroid.x,
//             configStore.shed3D.heights.GROUND_BEAM +
//               configStore.shed3D.heights.GB_Z_HEIGHT / 2,
//             centroid.z,
//           ],
//           rotation: [0, centerAngle, 0],
//           color: "cyan",
//         });

//         // Wire configuration for center beam
//         const wireLength =
//           beamLength + (wallStore.wallThickness / 1000) * 2 - 0.01;
//         const cosAngle = Math.cos(centerAngle);
//         const sinAngle = Math.sin(centerAngle);
//         const perpCos = Math.cos(centerAngle + Math.PI / 2);
//         const perpSin = Math.sin(centerAngle + Math.PI / 2);

//         if (wireLength > 0) {
//           const numLines =
//             Math.floor(wireLength / configStore.RINGS.GROUND_BEAM.gap) + 1;
//           const startOffset =
//             -((numLines - 1) * configStore.RINGS.GROUND_BEAM.gap) / 2;
//           for (let k = 0; k < numLines; k++) {
//             const offset = startOffset + k * configStore.RINGS.GROUND_BEAM.gap;
//             const lineX = centroid.x + offset * cosAngle;
//             const lineZ = centroid.z + offset * sinAngle;

//             const halfWidth = avgWidth / 2 - 0.02;
//             const halfHeight = beamHeight / 2 - 0.0004;

//             const corners = [
//               [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
//               [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
//               [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
//               [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
//             ];

//             corners.forEach(([cornerX, cornerZ]) => {
//               centerVerticalLines.push({
//                 radius: 0.008,
//                 height: beamHeight - 0.0008,
//                 position: [
//                   cornerX,
//                   configStore.shed3D.heights.GROUND_BEAM + beamHeight / 2,
//                   cornerZ,
//                 ],
//                 rotation: [0, centerAngle + Math.PI / 2, 0],
//                 color: "purple",
//               });
//             });

//             const connections = [
//               {
//                 start: [
//                   lineX + halfWidth * perpCos,
//                   lineZ + halfWidth * perpSin,
//                 ],
//                 end: [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
//                 verticalOffset: halfHeight,
//               },
//               {
//                 start: [
//                   lineX + halfWidth * perpCos,
//                   lineZ + halfWidth * perpSin,
//                 ],
//                 end: [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
//                 verticalOffset: -halfHeight,
//               },
//             ];

//             connections.forEach(({ start, end, verticalOffset }) => {
//               const midX = (start[0] + end[0]) / 2;
//               const midZ = (start[1] + end[1]) / 2;
//               const length = Math.sqrt(
//                 (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2
//               );
//               const connAngle = Math.atan2(
//                 end[1] - start[1],
//                 end[0] - start[0]
//               );

//               centerVerticalLines.push({
//                 radius: 0.008,
//                 height: length,
//                 position: [
//                   midX,
//                   configStore.shed3D.heights.GROUND_BEAM +
//                     beamHeight / 2 +
//                     verticalOffset,
//                   midZ,
//                 ],
//                 rotation: [Math.PI / 2, 0, connAngle + Math.PI / 2],
//                 color: "purple",
//               });
//             });
//           }
//         }

//         const numWires = 3;
//         for (let k = 0; k < numWires; k++) {
//           const offset = (k - 1) * WIRE_OFFSET;
//           const topWireCenter = [
//             centroid.x + (isLengthPrimary ? 0 : offset),
//             configStore.shed3D.heights.GROUND_BEAM +
//               configStore.shed3D.heights.GB_Z_HEIGHT -
//               0.05,
//             centroid.z + (isLengthPrimary ? offset : 0),
//           ];
//           const topWireRotation = [0, centerAngle, Math.PI / 2];

//           centerWires.push({
//             radius: 0.008,
//             height: wireLength - wallStore.wallThickness / 1000,
//             position: topWireCenter,
//             rotation: topWireRotation,
//             color: "purple",
//           });

//           const bottomWireCenter = [
//             centroid.x + (isLengthPrimary ? 0 : offset),
//             configStore.shed3D.heights.GROUND_BEAM + 0.05,
//             centroid.z + (isLengthPrimary ? offset : 0),
//           ];
//           const bottomWireRotation = [0, centerAngle, Math.PI / 2];

//           centerWires.push({
//             radius: 0.008,
//             height: wireLength - wallStore.wallThickness / 1000,
//             position: bottomWireCenter,
//             rotation: bottomWireRotation,
//             color: "purple",
//           });

//           const topExtensionHeight =
//             configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
//           [0, 1].forEach((end) => {
//             const t = end === 0 ? -1 : 1;
//             const extX = topWireCenter[0] + t * (wireLength / 2) * cosAngle;
//             const extZ = topWireCenter[2] + t * (wireLength / 2) * sinAngle;
//             centerExtensionWires.push({
//               radius: 0.008,
//               height: topExtensionHeight,
//               position: [extX, topWireCenter[1] - topExtensionHeight / 2, extZ],
//               rotation: [0, 0, 0],
//               color: "purple",
//             });
//           });

//           const bottomExtensionHeight =
//             configStore.shed3D.heights.GB_Z_HEIGHT - 0.1;
//           [0, 1].forEach((end) => {
//             const t = end === 0 ? -1 : 1;
//             const extX = bottomWireCenter[0] + t * (wireLength / 2) * cosAngle;
//             const extZ = bottomWireCenter[2] + t * (wireLength / 2) * sinAngle;
//             centerExtensionWires.push({
//               radius: 0.008,
//               height: bottomExtensionHeight,
//               position: [
//                 extX,
//                 bottomWireCenter[1] + bottomExtensionHeight / 2,
//                 extZ,
//               ],
//               rotation: [0, 0, 0],
//               color: "purple",
//             });
//           });
//         }
//       }

//       // Process columns
//       const firstGroup = columnStore.polygons[0];
//       if (firstGroup) {
//         firstGroup.columns.map((column, index) => {
//           const columnCenter = {
//             x: -(column.center.x / 1000 - centerOffset[0]) * scale,
//             z: -(column.center.y / 1000 - centerOffset[2]) * scale,
//           };

//           let columnLength = 0.2;
//           const xs = column.points.map((p) => p.x);
//           const zs = column.points.map((p) => p.y);
//           const minX = Math.min(...xs);
//           const maxX = Math.max(...xs);
//           const minZ = Math.min(...zs);
//           const maxZ = Math.max(...zs);
//           columnLength = (maxZ - minZ) / 1000;
//           let columnWidth = (maxX - minX) / 1000;

//           const defaultAngle = 0;

//           columnRods.push({
//             radius: ROD_RADIUS,
//             height:
//               (baseplateStore.idealVerticalDistance - columnWidth) * 0.5 +
//               columnWidth,
//             position: [
//               column.hits[0].direction === "-x"
//                 ? columnCenter.x + columnLength + 0.08
//                 : columnCenter.x - columnLength - 0.08,
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 0.15,
//               columnCenter.z,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
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
//                   0.16
//                 : columnCenter.x -
//                   columnLength +
//                   wallStore.wallThickness / 1000 -
//                   0.16,
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 0.15,
//               columnCenter.z,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
//             color: "red",
//           });

//           columnRods.push({
//             radius: ROD_RADIUS,
//             height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//             position: [
//               column.hits[0].direction === "-x"
//                 ? columnCenter.x + columnLength + 0.08
//                 : columnCenter.x - columnLength - 0.08,
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 -0.15,
//               columnCenter.z - baseplateStore.idealVerticalDistance / 2,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
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
//                   0.16
//                 : columnCenter.x -
//                   columnLength +
//                   wallStore.wallThickness / 1000 -
//                   0.16,
//               configStore.shed3D.heights.GROUND_BEAM +
//                 configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                 -0.15,
//               columnCenter.z - baseplateStore.idealVerticalDistance / 2,
//             ],
//             rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
//             color: "red",
//           });

//           if (index === firstGroup.columns.length / 2) {
//             columnRods.push({
//               radius: ROD_RADIUS,
//               height:
//                 (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//               position: [
//                 column.hits[0].direction === "-x"
//                   ? columnCenter.x + columnLength - 0.08
//                   : columnCenter.x - columnLength + 0.08,
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z -
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
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
//                     0.16
//                   : columnCenter.x -
//                     columnLength +
//                     wallStore.wallThickness / 1000 -
//                     0.16,
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z -
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
//               color: "red",
//             });
//           }
//           if (index === 0) {
//             columnRods.push({
//               radius: ROD_RADIUS,
//               height:
//                 (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//               position: [
//                 column.hits[0].direction === "-x"
//                   ? columnCenter.x +
//                     columnLength -
//                     wallStore.wallThickness / 1000 +
//                     0.16
//                   : columnCenter.x -
//                     columnLength +
//                     wallStore.wallThickness / 1000 -
//                     0.16,
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
//               color: "red",
//             });
//             columnRods.push({
//               radius: ROD_RADIUS,
//               height:
//                 (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
//               position: [
//                 column.hits[0].direction === "-x"
//                   ? columnCenter.x + columnLength - 0.08
//                   : columnCenter.x - columnLength + 0.08,
//                 configStore.shed3D.heights.GROUND_BEAM +
//                   configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
//                   -0.15,
//                 columnCenter.z +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance +
//                   baseplateStore.idealVerticalDistance / 2,
//               ],
//               rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
//               color: "red",
//             });
//           }
//         });
//       }

//       // Calculate total length
//       const totalLength =
//         wires.reduce((sum, wire) => sum + (wire.height || 0), 0) +
//         extensionWires.reduce((sum, wire) => sum + (wire.height || 0), 0) +
//         verticalLines.reduce((sum, line) => sum + (line.height || 0), 0) +
//         centerWires.reduce((sum, wire) => sum + (wire.height || 0), 0) +
//         centerVerticalLines.reduce((sum, line) => sum + (line.height || 0), 0);

//       wallStore.setBeamTotalLength(totalLength);

//       return {
//         beams: beams.filter(Boolean),
//         wires: wires.filter(Boolean),
//         extensionWires: extensionWires.filter(Boolean),
//         verticalLines: verticalLines.filter(Boolean),
//         columnRods: columnRods.filter(Boolean),
//         centerBeam: centerBeam.filter(Boolean),
//         centerWires: centerWires.filter(Boolean),
//         centerExtensionWires: centerExtensionWires.filter(Boolean),
//         centerVerticalLines: centerVerticalLines.filter(Boolean),
//         topEdgeIndex,
//         totalLength,
//       };
//     }, [
//       externalWallPoints,
//       internalWallPoints,
//       centerOffset,
//       height,
//       floorY,
//       configStore.shed3D.heights.GB_Z_HEIGHT,
//       columnStore.polygons,
//     ]);

//     // Instanced rendering for vertical lines
//     const instancedMeshRef = useRef();
//     const centerInstancedMeshRef = useRef();

//     useEffect(() => {
//       if (instancedMeshRef.current && verticalLines.length > 0) {
//         const matrix = new THREE.Matrix4();
//         const dummy = new THREE.Object3D();

//         verticalLines.forEach((line, index) => {
//           dummy.position.set(
//             line.position[0],
//             line.position[1],
//             line.position[2]
//           );
//           dummy.rotation.set(
//             line.rotation[0],
//             line.rotation[1],
//             line.rotation[2]
//           );
//           dummy.scale.set(1, line.height, 1);
//           dummy.updateMatrix();
//           instancedMeshRef.current.setMatrixAt(index, dummy.matrix);
//         });

//         instancedMeshRef.current.instanceMatrix.needsUpdate = true;
//       }
//     }, [verticalLines]);

//     useEffect(() => {
//       if (centerInstancedMeshRef.current && centerVerticalLines.length > 0) {
//         const matrix = new THREE.Matrix4();
//         const dummy = new THREE.Object3D();

//         centerVerticalLines.forEach((line, index) => {
//           dummy.position.set(
//             line.position[0],
//             line.position[1],
//             line.position[2]
//           );
//           dummy.rotation.set(
//             line.rotation[0],
//             line.rotation[1],
//             line.rotation[2]
//           );
//           dummy.scale.set(1, line.height, 1);
//           dummy.updateMatrix();

//           centerInstancedMeshRef.current.setMatrixAt(index, dummy.matrix);
//         });

//         centerInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
//       }
//     }, [centerVerticalLines]);

//     // Log or use totalLength as needed
//     // console.log(`Total Length: ${totalLength.toFixed(2)} units`);

//     return (
//       <>
//         <BoxRenderer instances={beams} />
//         <BoxRenderer instances={centerBeam} renderOrder={-1} />

//         {wires.map((wire, index) => (
//           <mesh
//             key={`wire-${index}`}
//             position={wire.position}
//             rotation={wire.rotation}
//           >
//             <cylinderGeometry
//               args={[wire.radius, wire.radius, wire.height, 8]}
//             />
//             <meshBasicMaterial
//               color={wire.color}
//               //  depthWrite={false}
//             />
//           </mesh>
//         ))}
//         {extensionWires.map((wire, index) => (
//           <mesh
//             key={`extension-wire-${index}`}
//             position={wire.position}
//             rotation={wire.rotation}
//           >
//             <cylinderGeometry
//               args={[
//                 configStore.RINGS.GROUND_BEAM.diameter / 2,
//                 configStore.RINGS.GROUND_BEAM.diameter / 2,
//                 wire.height,
//                 8,
//               ]}
//             />
//             <meshBasicMaterial
//               color={wire.color}
//               // depthWrite={false}
//             />
//           </mesh>
//         ))}
//         {verticalLines.length > 0 && (
//           <instancedMesh
//             ref={instancedMeshRef}
//             args={[null, null, verticalLines.length]}
//             depthWrite={false}
//           >
//             <cylinderGeometry
//               args={[
//                 configStore.RINGS.GROUND_BEAM.diameter / 2,
//                 configStore.RINGS.GROUND_BEAM.diameter / 2,
//                 1,
//                 8,
//               ]}
//             />
//             <meshBasicMaterial color="purple" depthWrite={false} />
//           </instancedMesh>
//         )}
//         {centerWires.map((wire, index) => (
//           <mesh
//             key={`center-wire-${index}`}
//             position={wire.position}
//             rotation={[wire.rotation[0], Math.PI / 2, wire.rotation[2]]}
//             depthWrite={false}
//           >
//             <cylinderGeometry
//               args={[wire.radius, wire.radius, wire.height, 8]}
//             />
//             <meshBasicMaterial color={wire.color} depthWrite={false} />
//           </mesh>
//         ))}
//         {centerVerticalLines.length > 0 && (
//           <instancedMesh
//             ref={centerInstancedMeshRef}
//             args={[null, null, centerVerticalLines.length]}
//             depthWrite={false}
//             rotation={[0, Math.PI / 2, 0]}
//           >
//             <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
//             <meshBasicMaterial color="purple" depthWrite={false} />
//           </instancedMesh>
//         )}
//         {columnRods.map((rod, index) => (
//           <mesh
//             key={`rod-${index}`}
//             position={rod.position}
//             rotation={rod.rotation}
//             depthWrite={false}
//           >
//             {/* {console.log(rod)} */}
//             <cylinderGeometry
//               args={[rod.radius * 2, rod.radius * 2, rod.height, 8]}
//             />
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

// Constants for clarity and maintainability
const SCALE = 1; // Scaling factor for unit conversion
const WIRE_OFFSET = 0.05; // 100mm in scaled units
const ROD_RADIUS = 0.008; // 10mm radius for rods
const WIRE_RADIUS = 0.008; // Wire radius
const EXTENSION_HEIGHT_OFFSET = 0.1; // Extension height offset
const MIN_WALL_POINTS = 2; // Minimum points required for valid wall
const WIRE_COUNT = 3; // Number of wires per beam
const CYLINDER_SEGMENTS = 8; // Number of segments for cylinder geometry

// Shared geometry for performance
const sharedCylinderGeometry = new THREE.CylinderGeometry(
  WIRE_RADIUS,
  WIRE_RADIUS,
  1,
  CYLINDER_SEGMENTS
);

// Utility function to find the top edge index
const findTopEdgeIndex = (externalWallPoints, minPoints) => {
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
  return topEdgeIndex;
};

// Utility function to calculate beams
const calculateBeams = (
  externalWallPoints,
  internalWallPoints,
  centerOffset,
  height,
  configStore,
  wallStore
) => {
  const beams = [];
  const beamCenters = [];
  const beamDimensions = [];
  const minPoints = Math.min(
    externalWallPoints.length,
    internalWallPoints.length
  );

  if (minPoints < MIN_WALL_POINTS)
    return { beams, beamCenters, beamDimensions };

  for (let i = 0; i < minPoints; i++) {
    let j = i + 1;
    if (j >= minPoints) j = 0;

    // Convert points to scaled coordinates
    const points = [
      {
        x: -(externalWallPoints[i].x / 1000 - centerOffset[0]),
        z: -(externalWallPoints[i].y / 1000 - centerOffset[2]),
      },
      {
        x: -(externalWallPoints[j].x / 1000 - centerOffset[0]),
        z: -(externalWallPoints[j].y / 1000 - centerOffset[2]),
      },
      {
        x: -(internalWallPoints[i].x / 1000 - centerOffset[0]),
        z: -(internalWallPoints[i].y / 1000 - centerOffset[2]),
      },
      {
        x: -(internalWallPoints[j].x / 1000 - centerOffset[0]),
        z: -(internalWallPoints[j].y / 1000 - centerOffset[2]),
      },
    ];

    // Calculate bounding box
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

    beamCenters.push({ x: centerX, z: centerZ });
    beamDimensions.push({ width, length, angle });

    if (width > 0 && length > 0) {
      const beamHeight = height * SCALE;
      beams.push({
        width:
          i % 2 !== 0 ? width - (2 * wallStore.wallThickness) / 1000 : width,
        height: beamHeight,
        length:
          i % 2 === 0 ? length : length - (2 * wallStore.wallThickness) / 1000,
        position: [
          centerX,
          configStore.shed3D.heights.GROUND_BEAM +
            configStore.shed3D.heights.GB_Z_HEIGHT / 2,
          centerZ,
        ],
        rotation: [0, angle, 0],
        color: "cyan",
      });
    }
  }

  return { beams, beamCenters, beamDimensions };
};

// Utility function to calculate wires and vertical lines
const calculateWiresAndLines = (
  beamCenters,
  beamDimensions,
  height,
  configStore,
  centerOffset
) => {
  const wires = [];
  const extensionWires = [];
  const verticalLines = [];

  beamCenters.forEach(({ x: centerX, z: centerZ }, i) => {
    const { width, length, angle } = beamDimensions[i];
    const wireLength =
      Math.max(width, length) > length ? width - 0.02 : length - 0.05;
    const isLengthPrimary = length >= width;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const perpCos = Math.cos(angle + Math.PI / 2);
    const perpSin = Math.sin(angle + Math.PI / 2);

    if (wireLength <= 0) return;

    const numLines =
      Math.floor(wireLength / configStore.RINGS.GROUND_BEAM.gap) + 1;
    const startOffset =
      -((numLines - 1) * configStore.RINGS.GROUND_BEAM.gap) / 2;
    const beamHeight = height * SCALE;

    for (let k = 0; k < numLines; k++) {
      const offset = startOffset + k * configStore.RINGS.GROUND_BEAM.gap;
      let lineX =
        centerX + (isLengthPrimary ? offset * cosAngle : offset * perpSin);
      let lineZ =
        centerZ + (isLengthPrimary ? offset * sinAngle : offset * perpCos);
      const halfWidth = Math.min(width, length) / 2 - 0.02;
      const halfHeight = beamHeight / 2 - 0.0004;

      const corners = [
        [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
        [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
        [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
        [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
      ];

      corners.forEach(([cornerX, cornerZ]) => {
        verticalLines.push({
          radius: WIRE_RADIUS,
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
          start: [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
          end: [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
          verticalOffset: halfHeight,
        },
        {
          start: [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
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
        const connAngle = Math.atan2(end[1] - start[1], end[0] - start[0]);

        verticalLines.push({
          radius: WIRE_RADIUS,
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

    for (let k = 0; k < WIRE_COUNT; k++) {
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
        radius: WIRE_RADIUS,
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
        radius: WIRE_RADIUS,
        height: wireLength,
        position: bottomWireCenter,
        rotation: bottomWireRotation,
        color: "purple",
      });

      const topExtensionHeight =
        configStore.shed3D.heights.GB_Z_HEIGHT - EXTENSION_HEIGHT_OFFSET;
      [0, 1].forEach((end) => {
        const t = end === 0 ? -1 : 1;
        const extX = topWireCenter[0] + t * (wireLength / 2) * cosAngle;
        const extZ = topWireCenter[2] + t * (wireLength / 2) * sinAngle;
        extensionWires.push({
          radius: WIRE_RADIUS,
          height: topExtensionHeight,
          position: [extX, topWireCenter[1] - topExtensionHeight / 2, extZ],
          rotation: [0, 0, 0],
          color: "purple",
        });
      });

      const bottomExtensionHeight =
        configStore.shed3D.heights.GB_Z_HEIGHT - EXTENSION_HEIGHT_OFFSET;
      [0, 1].forEach((end) => {
        const t = end === 0 ? -1 : 1;
        const extX = bottomWireCenter[0] + t * (wireLength / 2) * cosAngle;
        const extZ = bottomWireCenter[2] + t * (wireLength / 2) * sinAngle;
        extensionWires.push({
          radius: WIRE_RADIUS,
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
  });

  return { wires, extensionWires, verticalLines };
};

// Utility function to calculate center beam and related elements
const calculateCenterBeam = (
  beamCenters,
  beamDimensions,
  height,
  configStore,
  wallStore,
  centerOffset
) => {
  const centerBeam = [];
  const centerWires = [];
  const centerExtensionWires = [];
  const centerVerticalLines = [];

  // Calculate centroid of beam centers
  const sum = beamCenters.reduce(
    (acc, p) => ({ x: acc.x + p.x, z: acc.z + p.z }),
    { x: 0, z: 0 }
  );
  const centroid = {
    x: sum.x / beamCenters.length,
    z: sum.z / beamCenters.length,
  };

  // Determine primary axis and beam dimensions
  const xs = beamCenters.map((p) => p.x);
  const zs = beamCenters.map((p) => p.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const widthRange = maxX - minX;
  const lengthRange = maxZ - minZ;
  const isLengthPrimary = lengthRange >= widthRange;
  const centerAngle = isLengthPrimary ? 0 : Math.PI / 2;

  const avgWidth =
    beamDimensions.reduce((sum, d) => sum + Math.min(d.width, d.length), 0) /
    beamDimensions.length;
  const avgLength = isLengthPrimary ? lengthRange : widthRange;
  const beamHeight = height * SCALE;

  // Raycast to determine beam length
  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3(centroid.x, beamHeight / 2, centroid.z);
  const rayDirection = new THREE.Vector3(
    isLengthPrimary ? 0 : 1,
    0,
    isLengthPrimary ? 1 : 0
  ).normalize();
  let beamLength = avgLength;

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(
    beamCenters.flatMap((p) => [p.x, beamHeight / 2, p.z])
  );
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  const mesh = new THREE.Mesh(geometry);
  mesh.updateMatrixWorld();

  const intersections = [];
  raycaster.set(rayOrigin, rayDirection);
  let intersects = raycaster.intersectObject(mesh);
  if (intersects.length > 0) intersections.push(intersects[0].distance);
  raycaster.set(rayOrigin, rayDirection.negate());
  intersects = raycaster.intersectObject(mesh);
  if (intersects.length > 0) intersections.push(intersects[0].distance);

  centroid.x = (centroid.x - centerOffset[0] / 1000) / 1000;
  centroid.z = (centroid.z - centerOffset[2] / 1000) / 1000;
  beamLength = beamLength - wallStore.wallThickness / 1000;

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

    const wireLength = beamLength + (wallStore.wallThickness / 1000) * 2 - 0.01;
    const cosAngle = Math.cos(centerAngle);
    const sinAngle = Math.sin(centerAngle);
    const perpCos = Math.cos(centerAngle + Math.PI / 2);
    const perpSin = Math.sin(centerAngle + Math.PI / 2);

    if (wireLength > 0) {
      const numLines =
        Math.floor(wireLength / configStore.RINGS.GROUND_BEAM.gap) + 1;
      const startOffset =
        -((numLines - 1) * configStore.RINGS.GROUND_BEAM.gap) / 2;

      for (let k = 0; k < numLines; k++) {
        const offset = startOffset + k * configStore.RINGS.GROUND_BEAM.gap;
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
            radius: WIRE_RADIUS,
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
            start: [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
            end: [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
            verticalOffset: halfHeight,
          },
          {
            start: [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
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
          const connAngle = Math.atan2(end[1] - start[1], end[0] - start[0]);

          centerVerticalLines.push({
            radius: WIRE_RADIUS,
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

      for (let k = 0; k < WIRE_COUNT; k++) {
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
          radius: WIRE_RADIUS,
          height: wireLength - wallStore.wallThickness / 1000,
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
          radius: WIRE_RADIUS,
          height: wireLength - wallStore.wallThickness / 1000,
          position: bottomWireCenter,
          rotation: bottomWireRotation,
          color: "purple",
        });

        const topExtensionHeight =
          configStore.shed3D.heights.GB_Z_HEIGHT - EXTENSION_HEIGHT_OFFSET;
        [0, 1].forEach((end) => {
          const t = end === 0 ? -1 : 1;
          const extX = topWireCenter[0] + t * (wireLength / 2) * cosAngle;
          const extZ = topWireCenter[2] + t * (wireLength / 2) * sinAngle;
          centerExtensionWires.push({
            radius: WIRE_RADIUS,
            height: topExtensionHeight,
            position: [extX, topWireCenter[1] - topExtensionHeight / 2, extZ],
            rotation: [0, 0, 0],
            color: "purple",
          });
        });

        const bottomExtensionHeight =
          configStore.shed3D.heights.GB_Z_HEIGHT - EXTENSION_HEIGHT_OFFSET;
        [0, 1].forEach((end) => {
          const t = end === 0 ? -1 : 1;
          const extX = bottomWireCenter[0] + t * (wireLength / 2) * cosAngle;
          const extZ = bottomWireCenter[2] + t * (wireLength / 2) * sinAngle;
          centerExtensionWires.push({
            radius: WIRE_RADIUS,
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

  return { centerBeam, centerWires, centerExtensionWires, centerVerticalLines };
};

// Utility function to calculate column rods
const calculateColumnRods = (
  columnStore,
  baseplateStore,
  configStore,
  wallStore,
  centerOffset
) => {
  const columnRods = [];
  const firstGroup = columnStore.polygons[0];

  if (!firstGroup) return columnRods;

  firstGroup.columns.forEach((column, index) => {
    const columnCenter = {
      x: -(column.center.x / 1000 - centerOffset[0]) * SCALE,
      z: -(column.center.y / 1000 - centerOffset[2]) * SCALE,
    };

    const xs = column.points.map((p) => p.x);
    const zs = column.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const columnLength = (maxZ - minZ) / 1000;
    const columnWidth = (maxX - minX) / 1000;
    const defaultAngle = 0;

    const rodPositions = [
      {
        x:
          column.hits[0].direction === "-x"
            ? columnCenter.x + columnLength + 0.08
            : columnCenter.x - columnLength - 0.08,
        y:
          configStore.shed3D.heights.GROUND_BEAM +
          configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
          0.15,
        z: columnCenter.z,
        height:
          (baseplateStore.idealVerticalDistance - columnWidth) * 0.5 +
          columnWidth,
      },
      {
        x:
          column.hits[0].direction === "-x"
            ? columnCenter.x +
              columnLength -
              wallStore.wallThickness / 1000 +
              0.16
            : columnCenter.x -
              columnLength +
              wallStore.wallThickness / 1000 -
              0.16,
        y:
          configStore.shed3D.heights.GROUND_BEAM +
          configStore.shed3D.heights.GB_Z_HEIGHT / 2 +
          0.15,
        z: columnCenter.z,
        height:
          (baseplateStore.idealVerticalDistance - columnWidth) * 0.5 +
          columnWidth,
      },
      {
        x:
          column.hits[0].direction === "-x"
            ? columnCenter.x + columnLength + 0.08
            : columnCenter.x - columnLength - 0.08,
        y:
          configStore.shed3D.heights.GROUND_BEAM +
          configStore.shed3D.heights.GB_Z_HEIGHT / 2 -
          0.15,
        z: columnCenter.z - baseplateStore.idealVerticalDistance / 2,
        height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
      },
      {
        x:
          column.hits[0].direction === "-x"
            ? columnCenter.x +
              columnLength -
              wallStore.wallThickness / 1000 +
              0.16
            : columnCenter.x -
              columnLength +
              wallStore.wallThickness / 1000 -
              0.16,
        y:
          configStore.shed3D.heights.GROUND_BEAM +
          configStore.shed3D.heights.GB_Z_HEIGHT / 2 -
          0.15,
        z: columnCenter.z - baseplateStore.idealVerticalDistance / 2,
        height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
      },
    ];

    if (index === Math.floor(firstGroup.columns.length / 2)) {
      rodPositions.push(
        {
          x:
            column.hits[0].direction === "-x"
              ? columnCenter.x + columnLength - 0.08
              : columnCenter.x - columnLength + 0.08,
          y:
            configStore.shed3D.heights.GROUND_BEAM +
            configStore.shed3D.heights.GB_Z_HEIGHT / 2 -
            0.15,
          z:
            columnCenter.z -
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance / 2,
          height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
        },
        {
          x:
            column.hits[0].direction === "-x"
              ? columnCenter.x +
                columnLength -
                wallStore.wallThickness / 1000 +
                0.16
              : columnCenter.x -
                columnLength +
                wallStore.wallThickness / 1000 -
                0.16,
          y:
            configStore.shed3D.heights.GROUND_BEAM +
            configStore.shed3D.heights.GB_Z_HEIGHT / 2 -
            0.15,
          z:
            columnCenter.z -
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance / 2,
          height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
        }
      );
    }

    if (index === 0) {
      rodPositions.push(
        {
          x:
            column.hits[0].direction === "-x"
              ? columnCenter.x +
                columnLength -
                wallStore.wallThickness / 1000 +
                0.16
              : columnCenter.x -
                columnLength +
                wallStore.wallThickness / 1000 -
                0.16,
          y:
            configStore.shed3D.heights.GROUND_BEAM +
            configStore.shed3D.heights.GB_Z_HEIGHT / 2 -
            0.15,
          z:
            columnCenter.z +
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance / 2,
          height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
        },
        {
          x:
            column.hits[0].direction === "-x"
              ? columnCenter.x + columnLength - 0.08
              : columnCenter.x - columnLength + 0.08,
          y:
            configStore.shed3D.heights.GROUND_BEAM +
            configStore.shed3D.heights.GB_Z_HEIGHT / 2 -
            0.15,
          z:
            columnCenter.z +
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance +
            baseplateStore.idealVerticalDistance / 2,
          height: (baseplateStore.idealVerticalDistance - columnLength) * 0.7,
        }
      );
    }

    rodPositions.forEach(({ x, y, z, height }) => {
      columnRods.push({
        radius: ROD_RADIUS,
        height,
        position: [x, y, z],
        rotation: [Math.PI, defaultAngle + Math.PI / 2, Math.PI / 2],
        color: "red",
      });
    });
  });

  return columnRods;
};

// Main component
const GroundBeamRenderer = observer(
  ({
    centerOffset = [0, 0, 0],
    floorY = 0.4,
    height = configStore.shed3D.heights.GB_Z_HEIGHT,
  }) => {
    // Convert wall polygons to point objects
    const externalWallPoints =
      convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
    const internalWall = dxfStore.internalWallPolygon?.filter(
      (_, index) => index % 3 !== 2
    );
    const internalWallPoints = convertToPointObjects(internalWall) || [];

    // Compute all rendering data
    const {
      beams,
      wires,
      extensionWires,
      verticalLines,
      columnRods,
      centerBeam,
      centerWires,
      centerExtensionWires,
      centerVerticalLines,
      topEdgeIndex,
      totalLength,
    } = useMemo(() => {
      const minPoints = Math.min(
        externalWallPoints.length,
        internalWallPoints.length
      );
      if (minPoints < MIN_WALL_POINTS) {
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
          totalLength: 0,
        };
      }

      // Calculate top edge
      const topEdgeIndex = findTopEdgeIndex(externalWallPoints, minPoints);

      // Calculate beams and their centers
      const { beams, beamCenters, beamDimensions } = calculateBeams(
        externalWallPoints,
        internalWallPoints,
        centerOffset,
        height,
        configStore,
        wallStore
      );

      // Calculate wires and vertical lines
      const { wires, extensionWires, verticalLines } = calculateWiresAndLines(
        beamCenters,
        beamDimensions,
        height,
        configStore,
        centerOffset
      );

      // Calculate center beam and related elements
      const {
        centerBeam,
        centerWires,
        centerExtensionWires,
        centerVerticalLines,
      } = calculateCenterBeam(
        beamCenters,
        beamDimensions,
        height,
        configStore,
        wallStore,
        centerOffset
      );

      // Calculate column rods
      const columnRods = calculateColumnRods(
        columnStore,
        baseplateStore,
        configStore,
        wallStore,
        centerOffset
      );

      // Calculate total length of wires and lines
      const totalLength =
        wires.reduce((sum, wire) => sum + (wire.height || 0), 0) +
        extensionWires.reduce((sum, wire) => sum + (wire.height || 0), 0) +
        verticalLines.reduce((sum, line) => sum + (line.height || 0), 0) +
        centerWires.reduce((sum, wire) => sum + (wire.height || 0), 0) +
        centerVerticalLines.reduce((sum, line) => sum + (line.height || 0), 0);

      wallStore.setBeamTotalLength(totalLength);

      return {
        beams,
        wires,
        extensionWires,
        verticalLines,
        columnRods,
        centerBeam,
        centerWires,
        centerExtensionWires,
        centerVerticalLines,
        topEdgeIndex,
        totalLength,
      };
    }, [
      externalWallPoints,
      internalWallPoints,
      centerOffset,
      height,
      configStore.shed3D.heights.GB_Z_HEIGHT,
      columnStore.polygons,
      wallStore.wallThickness,
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
        <BoxRenderer instances={centerBeam} renderOrder={-1} />

        {wires.map((wire, index) => (
          <mesh
            key={`wire-${index}`}
            position={wire.position}
            rotation={wire.rotation}
          >
            <cylinderGeometry
              args={[wire.radius, wire.radius, wire.height, CYLINDER_SEGMENTS]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))}
        {extensionWires.map((wire, index) => (
          <mesh
            key={`extension-wire-${index}`}
            position={wire.position}
            rotation={wire.rotation}
          >
            <cylinderGeometry
              args={[
                configStore.RINGS.GROUND_BEAM.diameter / 2,
                configStore.RINGS.GROUND_BEAM.diameter / 2,
                wire.height,
                CYLINDER_SEGMENTS,
              ]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))}
        {verticalLines.length > 0 && (
          <instancedMesh
            ref={instancedMeshRef}
            args={[sharedCylinderGeometry, null, verticalLines.length]}
            depthWrite={false}
          >
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
              args={[wire.radius, wire.radius, wire.height, CYLINDER_SEGMENTS]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))}
        {centerVerticalLines.length > 0 && (
          <instancedMesh
            ref={centerInstancedMeshRef}
            args={[sharedCylinderGeometry, null, centerVerticalLines.length]}
            depthWrite={false}
            rotation={[0, Math.PI / 2, 0]}
          >
            <meshBasicMaterial color="purple" depthWrite={false} />
          </instancedMesh>
        )}
        {columnRods.map((rod, index) => (
          <mesh
            key={`rod-${index}`}
            position={rod.position}
            rotation={rod.rotation}
            depthWrite={false}
          >
            <cylinderGeometry
              args={[
                rod.radius * 2,
                rod.radius * 2,
                rod.height,
                CYLINDER_SEGMENTS,
              ]}
            />
            <meshBasicMaterial color={rod.color} depthWrite={false} />
          </mesh>
        ))}
      </>
    );
  }
);

export default GroundBeamRenderer;
