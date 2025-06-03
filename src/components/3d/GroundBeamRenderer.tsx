// import React, { useMemo } from "react";
// import { toJS } from "mobx";
// import { observer } from "mobx-react-lite";
// import * as THREE from "three";
// import dxfStore from "../../stores/DxfStore";
// import configStore from "../../stores/ConfigStore";
// import BoxRenderer from "./Box";
// import { convertToPointObjects } from "../../utils/PolygonUtils";
// import wallStore from "../../stores/WallStore";

// const scale = 1; // Scaling factor
// const WIRE_OFFSET = 0.05; // 100mm in scaled units (100mm / 1000 = 0.1)

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

//     const { beams, wires, topEdgeIndex } = useMemo(() => {
//       const beams = [];
//       const wires = [];

//       // Ensure we have enough points to form at least one beam
//       const minPoints = Math.min(
//         externalWallPoints.length,
//         internalWallPoints.length
//       );
//       if (minPoints < 2) {
//         return { beams: [], wires: [], topEdgeIndex: -1 };
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

//       // Iterate over points to create beams and wires
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
//           beams.push({
//             width,
//             height: height * scale,
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
//         }

//         // Add wires for all segments (top and bottom)
//         const numWires = 3;
//         for (let k = 0; k < numWires; k++) {
//           // Offset for each wire to avoid overlap
//           const offset = (k - 1) * WIRE_OFFSET; // Centered offsets: -0.05, 0, 0.05 for 3 wires
//           console.log(angle);
//           // Top wires
//           const topWireCenter =
//             angle === Math.PI || angle === 0
//               ? [
//                   centerX,
//                   configStore.shed3D.heights.GROUND_BEAM +
//                     configStore.shed3D.heights.GB_Z_HEIGHT -
//                     0.05, // Top of the beam
//                   centerZ + offset,
//                 ]
//               : [
//                   centerX + offset,
//                   configStore.shed3D.heights.GROUND_BEAM +
//                     configStore.shed3D.heights.GB_Z_HEIGHT -
//                     0.05, // Top of the beam
//                   centerZ,
//                 ];
//           const topWireRotation = [0, angle, Math.PI / 2]; // Horizontal, aligned with beam

//           wires.push({
//             radius: 0.012,
//             height: boxWidth > boxLength ? boxWidth : boxLength,
//             position: topWireCenter,
//             rotation: topWireRotation,
//             color: "yellow",
//           });

//           // Bottom wires
//           const bottomWireCenter =
//             angle === Math.PI || angle === 0
//               ? [
//                   centerX,
//                   configStore.shed3D.heights.GROUND_BEAM + 0.05, // Top of the beam
//                   centerZ + offset,
//                 ]
//               : [
//                   centerX + offset,
//                   configStore.shed3D.heights.GROUND_BEAM + 0.05, // Top of the beam
//                   centerZ,
//                 ];
//           const bottomWireRotation = [0, angle, Math.PI / 2]; // Same rotation as top

//           wires.push({
//             radius: 0.012,
//             // height: 10,
//             height: boxWidth > boxLength ? boxWidth : boxLength,
//             position: bottomWireCenter,
//             rotation: bottomWireRotation,
//             color: "yellow",
//           });
//         }
//       }

//       return {
//         beams: beams.filter(Boolean),
//         wires: wires.filter(Boolean),
//         topEdgeIndex,
//       };
//     }, [
//       externalWallPoints,
//       internalWallPoints,
//       centerOffset,
//       height,
//       floorY,
//       configStore.shed3D.heights.GB_Z_HEIGHT,
//     ]);

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
//               args={[wire.radius, wire.radius, wire.height, 16]}
//             />
//             <meshBasicMaterial color={wire.color} depthWrite={false} />
//           </mesh>
//         ))}
//       </>
//     );
//   }
// );

// export default GroundBeamRenderer;


import React, { useMemo } from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import dxfStore from "../../stores/DxfStore";
import configStore from "../../stores/ConfigStore";
import BoxRenderer from "./Box";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import wallStore from "../../stores/WallStore";

const scale = 1; // Scaling factor
const WIRE_OFFSET = 0.05; // 100mm in scaled units (100mm / 1000 = 0.1)

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

    const { beams, wires, extensionWires, topEdgeIndex } = useMemo(() => {
      const beams = [];
      const wires = [];
      const extensionWires = [];

      // Ensure we have enough points to form at least one beam
      const minPoints = Math.min(
        externalWallPoints.length,
        internalWallPoints.length
      );
      if (minPoints < 2) {
        return { beams: [], wires: [], extensionWires: [], topEdgeIndex: -1 };
      }

      // Find the top edge by highest average z-coordinate
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

      // Iterate over points to create beams and wires
      for (let i = 0; i < minPoints; i++) {
        let j = i + 1;
        if (j >= minPoints) j = 0;
        const points = [
          // External points i and i+1
          {
            x: -(externalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
            z: -(externalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
          },
          {
            x: -(externalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
            z: -(externalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
          },
          // Internal points i and i+1
          {
            x: -(internalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
            z: -(internalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
          },
          {
            x: -(internalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
            z: -(internalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
          },
        ];

        // Calculate bounding box for the quadrilateral
        const xs = points.map((p) => p.x);
        const zs = points.map((p) => p.z);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minZ = Math.min(...zs);
        const maxZ = Math.max(...zs);

        // Calculate dimensions
        const boxWidth = maxX - minX;
        const boxLength = maxZ - minZ;

        // Use wall thickness for width, and boxLength for length
        const width = boxWidth;
        const length = boxLength;

        // Calculate the primary direction for rotation (along external points)
        const dx = points[1].x - points[0].x;
        const dz = points[1].z - points[0].z;
        const angle = Math.atan2(dz, dx);

        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        // Add beam
        if (width > 0 && length > 0) {
          beams.push({
            width,
            height: height * scale,
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
        }

        // Add wires for all segments (top and bottom)
        const numWires = 3;
        const wireLength = boxWidth > boxLength ? boxWidth : boxLength;
        for (let k = 0; k < numWires; k++) {
          // Offset for each wire to avoid overlap
          const offset = (k - 1) * WIRE_OFFSET; // Centered offsets: -0.05, 0, 0.05 for 3 wires

          // Top wires
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
          const topWireRotation = [0, angle, Math.PI / 2]; // Horizontal, aligned with beam

          wires.push({
            radius: 0.012,
            height: wireLength,
            position: topWireCenter,
            rotation: topWireRotation,
            color: "yellow",
          });

          // Bottom wires
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
          const bottomWireRotation = [0, angle, Math.PI / 2]; // Same rotation as top

          wires.push({
            radius: 0.012,
            height: wireLength,
            position: bottomWireCenter,
            rotation: bottomWireRotation,
            color: "yellow",
          });

          // Calculate extension wire positions at both ends
          const halfWireLength = wireLength / 2;
          const cosAngle = Math.cos(angle);
          const sinAngle = Math.sin(angle);

          // Extension wires for top wires (extending downward)
          const topExtensionHeight =
            configStore.shed3D.heights.GB_Z_HEIGHT - 0.1; // From top to bottom of beam
          [0, 1].forEach((end) => {
            const t = end === 0 ? -1 : 1; // Start or end of the wire
            const extX = topWireCenter[0] + t * halfWireLength * cosAngle;
            const extZ = topWireCenter[2] + t * halfWireLength * sinAngle;
            extensionWires.push({
              radius: 0.012,
              height: topExtensionHeight,
              position: [
                extX,
                topWireCenter[1] - topExtensionHeight / 2,
                extZ,
              ],
              rotation: [0, 0, 0], // Vertical
              color: "yellow",
            });
          });

          // Extension wires for bottom wires (extending upward)
          const bottomExtensionHeight =
            configStore.shed3D.heights.GB_Z_HEIGHT - 0.1; // From bottom to top of beam
          [0, 1].forEach((end) => {
            const t = end === 0 ? -1 : 1; // Start or end of the wire
            const extX = bottomWireCenter[0] + t * halfWireLength * cosAngle;
            const extZ = bottomWireCenter[2] + t * halfWireLength * sinAngle;
            extensionWires.push({
              radius: 0.012,
              height: bottomExtensionHeight,
              position: [
                extX,
                bottomWireCenter[1] + bottomExtensionHeight / 2,
                extZ,
              ],
              rotation: [0, 0, 0], // Vertical
              color: "yellow",
            });
          });
        }
      }

      return {
        beams: beams.filter(Boolean),
        wires: wires.filter(Boolean),
        extensionWires: extensionWires.filter(Boolean),
        topEdgeIndex,
      };
    }, [
      externalWallPoints,
      internalWallPoints,
      centerOffset,
      height,
      floorY,
      configStore.shed3D.heights.GB_Z_HEIGHT,
    ]);

    return (
      <>
        <BoxRenderer instances={beams} />
        {wires.map((wire, index) => (
          <mesh
            key={`wire-${index}`}
            position={wire.position}
            rotation={wire.rotation}
            depthWrite={false}
          >
            <cylinderGeometry
              args={[wire.radius, wire.radius, wire.height, 16]}
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
              args={[wire.radius, wire.radius, wire.height, 16]}
            />
            <meshBasicMaterial color={wire.color} depthWrite={false} />
          </mesh>
        ))}
      </>
    );
  }
);

export default GroundBeamRenderer;