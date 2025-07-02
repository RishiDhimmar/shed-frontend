// import React, { useMemo } from "react";
// import { toJS } from "mobx";
// import columnStore from "../../stores/ColumnStore";
// import * as THREE from "three";
// import { observer } from "mobx-react-lite";
// import configStore from "../../stores/ConfigStore";

// const scale = 1;

// const ColumnRenderer = observer(
//   ({ centerOffset = [0, 0, 0], floorY = 0.075 }) => {
//     const columns = useMemo(() => {
//       const allColumns = [];
//       columnStore.polygons.forEach((group) => {
//         const groupColumns = group.columns || [];
//         groupColumns.forEach((col) => {
//           const wireData = Array.isArray(col.wireData)
//             ? col.wireData
//             : Array.isArray(group.wireData)
//             ? group.wireData
//             : [];

//           allColumns.push({
//             ...col,
//             groupName: group.name,
//             hEdgeWires: group.hEdgeWires,
//             vEdgeWires: group.vEdgeWires,
//             wireData,
//             points: col.points,
//           });
//         });
//       });
//       return allColumns;
//     }, [columnStore.polygons]);

//     const rectangles = useMemo(() => {
//       const height = configStore.shed3D.heights.COLUMNS;

//       return columns
//         .map((c) => {
//           const points = (c.points || []).map((p) => ({
//             x: -(p.x / 1000 - centerOffset[0]) * scale,
//             z: -(p.y / 1000 - centerOffset[2]) * scale,
//           }));

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

//           // Define the four corners of the rectangle
//           const corners = [
//             { x: minX + 0.04, z: minZ + 0.04 }, // Bottom-left
//             { x: maxX - 0.04, z: minZ + 0.04 }, // Bottom-right
//             { x: maxX - 0.04, z: maxZ - 0.04 }, // Top-right
//             { x: minX + 0.04, z: maxZ - 0.04 }, // Top-left
//           ];

//           // Calculate y-levels at 150 unit intervals
//           const yInterval = 150 / 1000; // Convert 150mm to units
//           const yLevels = [];
//           for (let y = floorY; y <= height + floorY; y += yInterval) {
//             yLevels.push(y);
//           }

//           // Create lines for each y-level
//           const lines = yLevels.map((y) => [
//             // Line 1: Bottom-left to Bottom-right
//             {
//               start: [corners[0].x, y, corners[0].z],
//               end: [corners[1].x, y, corners[1].z],
//             },
//             // Line 2: Bottom-right to Top-right
//             {
//               start: [corners[1].x, y, corners[1].z],
//               end: [corners[2].x, y, corners[2].z],
//             },
//             // Line 3: Top-right to Top-left
//             {
//               start: [corners[2].x, y, corners[2].z],
//               end: [corners[3].x, y, corners[3].z],
//             },
//             // Line 4: Top-left to Bottom-left
//             {
//               start: [corners[3].x, y, corners[3].z],
//               end: [corners[0].x, y, corners[0].z],
//             },
//           ]);

//           return {
//             lines: lines.flat(),
//             color: "red",
//           };
//         })
//         .filter(Boolean);
//     }, [columns, centerOffset, configStore.shed3D.heights.COLUMNS]);

//     return (
//       <>
//         {/* Render the lines forming rectangles */}
//         {rectangles.map((rect, index) =>
//           rect.lines.map((line, lineIndex) => {
//             const points = [
//               new THREE.Vector3(...line.start),
//               new THREE.Vector3(...line.end),
//             ];
//             const geometry = new THREE.BufferGeometry().setFromPoints(points);
//             return (
//               <line key={`rect-line-${index}-${lineIndex}`} geometry={geometry}>
//                 <lineBasicMaterial
//                   color={rect.color}
//                   linewidth={20}
//                   polygonOffset
//                   polygonOffsetFactor={-1}
//                   polygonOffsetUnits={-4}
//                 />
//               </line>
//             );
//           })
//         )}

//         {/* Render the wires as before */}
//         {columns.map((col, colIndex) =>
//           (col.wireData || []).map((wire, wireIndex) => {
//             const wireLength = configStore.shed3D.heights.COLUMNS;
//             const radius = (wire.radius / 1000) * scale;
//             const extensionLength = 450 / 1000;

//             const geometry = new THREE.CylinderGeometry(
//               radius,
//               radius,
//               wireLength,
//               8
//             );
//             const extensionGeometry = new THREE.CylinderGeometry(
//               radius,
//               radius,
//               extensionLength,
//               8
//             );
//             const color = "blue";

//             return (
//               <group key={`wire-${colIndex}-${wireIndex}-group`}>
//                 <mesh
//                   key={`wire-${colIndex}-${wireIndex}`}
//                   geometry={geometry}
//                   position={[
//                     -(wire.x / 1000 - centerOffset[0]) * scale,
//                     wireLength / 2 + floorY,
//                     -(wire.y / 1000 - centerOffset[2]) * scale,
//                   ]}
//                   castShadow
//                   receiveShadow
//                 >
//                   <meshBasicMaterial
//                     color={color}
//                     polygonOffset
//                     polygonOffsetFactor={-1}
//                     polygonOffsetUnits={-4}
//                     depthWrite={false}
//                   />
//                 </mesh>
//                 <mesh
//                   key={`wire-extension-${colIndex}-${wireIndex}`}
//                   geometry={extensionGeometry}
//                   position={
//                     wire.edge === "left"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale +
//                             450 / 2000,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale,
//                         ]
//                       : wire.edge === "right"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale -
//                             450 / 2000,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale,
//                         ]
//                       : wire.edge === "top"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale +
//                             450 / 2000,
//                         ]
//                       : wire.edge === "bottom"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale -
//                             450 / 2000,
//                         ]
//                       : wire.edge === "top-left"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale +
//                             450 / 2800,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale +
//                             450 / 2800,
//                         ]
//                       : wire.edge === "top-right"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale -
//                             450 / 2800,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale +
//                             450 / 2800,
//                         ]
//                       : wire.edge === "bottom-left"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale +
//                             450 / 2800,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale -
//                             450 / 2800,
//                         ]
//                       : wire.edge === "bottom-right"
//                       ? [
//                           -(wire.x / 1000 - centerOffset[0]) * scale -
//                             450 / 2800,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale -
//                             450 / 2800,
//                         ]
//                       : [
//                           -(wire.x / 1000 - centerOffset[0]) * scale,
//                           floorY,
//                           -(wire.y / 1000 - centerOffset[2]) * scale,
//                         ]
//                   }
//                   rotation={[
//                     wire.edge === "top"
//                       ? Math.PI / 2
//                       : wire.edge === "bottom"
//                       ? -Math.PI / 2
//                       : wire.edge === "top-left"
//                       ? Math.PI / 2
//                       : wire.edge === "top-right"
//                       ? -Math.PI / 2
//                       : wire.edge === "bottom-left"
//                       ? Math.PI / 2
//                       : wire.edge === "bottom-right"
//                       ? -Math.PI / 2
//                       : 0,
//                     0,
//                     wire.edge === "left"
//                       ? Math.PI / 2
//                       : wire.edge === "right"
//                       ? -Math.PI / 2
//                       : wire.edge === "top-left"
//                       ? -Math.PI / 4
//                       : wire.edge === "top-right"
//                       ? -Math.PI / 4
//                       : wire.edge === "bottom-left"
//                       ? Math.PI / 4
//                       : wire.edge === "bottom-right"
//                       ? Math.PI / 4
//                       : 0,
//                   ]}
//                 >
//                   <meshBasicMaterial
//                     color={color}
//                     polygonOffset
//                     polygonOffsetFactor={-1}
//                     polygonOffsetUnits={-4}
//                     depthWrite={false}
//                   />
//                 </mesh>
//               </group>
//             );
//           })
//         )}
//       </>
//     );
//   }
// );

// export default ColumnRenderer;

import React, { useMemo } from "react";
import { toJS } from "mobx";
import columnStore from "../../stores/ColumnStore";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import configStore from "../../stores/ConfigStore";
import BoxRenderer from "./Box";
import uiStore from "../../stores/UIStore";
import MultiRingRenderer from "./MultiRingRenderer";

const scale = 1;

const ColumnRenderer = observer(
  ({ centerOffset = [0, 0, 0], floorY = 0.075 }) => {
    const columns = useMemo(() => {
      const allColumns = [];
      columnStore.polygons.forEach((group) => {
        const groupColumns = group.columns || [];
        groupColumns.forEach((col) => {
          const wireData = Array.isArray(col.wireData)
            ? col.wireData
            : Array.isArray(group.wireData)
            ? group.wireData
            : [];

          allColumns.push({
            ...col,
            groupName: group.name,
            hEdgeWires: group.hEdgeWires,
            vEdgeWires: group.vEdgeWires,
            wireData,
            points: col.points,
          });
        });
      });
      return allColumns;
    }, [columnStore.polygons]);

    const instances = useMemo(() => {
      const height = configStore.shed3D.heights.COLUMNS;

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

          const width = maxX - minX;
          const length = maxZ - minZ;
          const centerX = (minX + maxX) / 2;
          const centerZ = (minZ + maxZ) / 2;

          return {
            width,
            length,
            height,
            position: [centerX, height / 2 + floorY, centerZ],
            color: "blue",
          };
        })
        .filter(Boolean);
    }, [columns, centerOffset, configStore.shed3D.heights.COLUMNS]);

    return (
      <>
        <group visible={uiStore.visibility.column}>
          {/* <RingRenderer
            columns={columns}
            centerOffset={centerOffset}
            floorY={floorY}
            yInterval={configStore.RINGS.COLUMNS.gap}
            rodDiameter={configStore.RINGS.COLUMNS.diameter}
            cornerOffset = {configStore.RINGS.COLUMNS.offset}
          /> */}
          <MultiRingRenderer
            columns={columns}
            centerOffset={centerOffset}
            floorY={floorY}
            yInterval={configStore.RINGS.COLUMNS.gap}
            rodDiameter={configStore.RINGS.COLUMNS.diameter}
            cornerOffset={configStore.RINGS.COLUMNS.offset}
            onCalculateTotalLength={(totalLength) => {
              columnStore.setTotalRingLength(totalLength);
            }}
          />

          <BoxRenderer instances={instances} opacity={0.2} />

          {columns.map((col, colIndex) =>
            (col.wireData || []).map((wire, wireIndex) => {
              const wireLength = configStore.shed3D.heights.COLUMNS;
              const radius = (wire.radius / 1000) * scale;
              const extensionLength = 450 / 1000;

              const geometry = new THREE.CylinderGeometry(
                radius,
                radius,
                wireLength,
                8
              );
              const extensionGeometry = new THREE.CylinderGeometry(
                radius,
                radius,
                extensionLength,
                8
              );
              const color = "blue";

              return (
                <group key={`wire-${colIndex}-${wireIndex}-group`}>
                  <mesh
                    key={`wire-${colIndex}-${wireIndex}`}
                    geometry={geometry}
                    position={[
                      -(wire.x / 1000 - centerOffset[0]) * scale,
                      wireLength / 2 + floorY,
                      -(wire.y / 1000 - centerOffset[2]) * scale,
                    ]}
                    castShadow
                    receiveShadow
                  >
                    <meshBasicMaterial
                      color={color}
                      polygonOffset
                      polygonOffsetFactor={-1}
                      polygonOffsetUnits={-4}
                      depthWrite={false}
                      opacity={0.5}
                    />
                  </mesh>
                  <mesh
                    key={`wire-extension-${colIndex}-${wireIndex}`}
                    geometry={extensionGeometry}
                    position={
                      wire.edge === "left"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale +
                              450 / 2000,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale,
                          ]
                        : wire.edge === "right"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale -
                              450 / 2000,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale,
                          ]
                        : wire.edge === "top"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale +
                              450 / 2000,
                          ]
                        : wire.edge === "bottom"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale -
                              450 / 2000,
                          ]
                        : wire.edge === "top-left"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale +
                              450 / 2800,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale +
                              450 / 2800,
                          ]
                        : wire.edge === "top-right"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale -
                              450 / 2800,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale +
                              450 / 2800,
                          ]
                        : wire.edge === "bottom-left"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale +
                              450 / 2800,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale -
                              450 / 2800,
                          ]
                        : wire.edge === "bottom-right"
                        ? [
                            -(wire.x / 1000 - centerOffset[0]) * scale -
                              450 / 2800,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale -
                              450 / 2800,
                          ]
                        : [
                            -(wire.x / 1000 - centerOffset[0]) * scale,
                            floorY,
                            -(wire.y / 1000 - centerOffset[2]) * scale,
                          ]
                    }
                    rotation={[
                      wire.edge === "top"
                        ? Math.PI / 2
                        : wire.edge === "bottom"
                        ? -Math.PI / 2
                        : wire.edge === "top-left"
                        ? Math.PI / 2
                        : wire.edge === "top-right"
                        ? -Math.PI / 2
                        : wire.edge === "bottom-left"
                        ? Math.PI / 2
                        : wire.edge === "bottom-right"
                        ? -Math.PI / 2
                        : 0,
                      0,
                      wire.edge === "left"
                        ? Math.PI / 2
                        : wire.edge === "right"
                        ? -Math.PI / 2
                        : wire.edge === "top-left"
                        ? -Math.PI / 4
                        : wire.edge === "top-right"
                        ? -Math.PI / 4
                        : wire.edge === "bottom-left"
                        ? Math.PI / 4
                        : wire.edge === "bottom-right"
                        ? Math.PI / 4
                        : 0,
                    ]}
                  >
                    <meshBasicMaterial
                      color={color}
                      polygonOffset
                      polygonOffsetFactor={-1}
                      polygonOffsetUnits={-4}
                      depthWrite={false}
                    />
                  </mesh>
                </group>
              );
            })
          )}
        </group>
      </>
    );
  }
);

export default ColumnRenderer;
