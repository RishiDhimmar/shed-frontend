// import React, { useMemo } from "react";
// import { toJS } from "mobx";
// import columnStore from "../../stores/ColumnStore";
// import * as THREE from "three";
// import { observer } from "mobx-react-lite";
// import configStore from "../../stores/ConfigStore";
// import BoxRenderer from "./Box";
// import uiStore from "../../stores/UIStore";
// import MultiRingRenderer from "./MultiRingRenderer";

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

//     const instances = useMemo(() => {
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

//           const width = maxX - minX;
//           const length = maxZ - minZ;
//           const centerX = (minX + maxX) / 2;
//           const centerZ = (minZ + maxZ) / 2;

//           return {
//             width,
//             length,
//             height,
//             position: [centerX, height / 2 + floorY, centerZ],
//             color: "blue",
//           };
//         })
//         .filter(Boolean);
//     }, [columns, centerOffset, configStore.shed3D.heights.COLUMNS]);

//     return (
//       <>
//         <group visible={uiStore.visibility.column}>
//           {/* <RingRenderer
//             columns={columns}
//             centerOffset={centerOffset}
//             floorY={floorY}
//             yInterval={configStore.RINGS.COLUMNS.gap}
//             rodDiameter={configStore.RINGS.COLUMNS.diameter}
//             cornerOffset = {configStore.RINGS.COLUMNS.offset}
//           /> */}
//           <MultiRingRenderer
//             columns={columns}
//             centerOffset={centerOffset}
//             floorY={floorY}
//             yInterval={configStore.RINGS.COLUMNS.gap}
//             rodDiameter={configStore.RINGS.COLUMNS.diameter}
//             cornerOffset={configStore.RINGS.COLUMNS.offset}
//             onCalculateTotalLength={(totalLength) => {
//               columnStore.setTotalRingLength(totalLength);
//             }}
//           />

//           <BoxRenderer instances={instances} opacity={0.2} />

//           {columns.map((col, colIndex) =>
//             (col.wireData || []).map((wire, wireIndex) => {
//               const wireLength = configStore.shed3D.heights.COLUMNS;
//               const radius = (wire.radius / 1000) * scale;
//               const extensionLength = 450 / 1000;

//               const geometry = new THREE.CylinderGeometry(
//                 radius,
//                 radius,
//                 wireLength,
//                 8
//               );
//               const extensionGeometry = new THREE.CylinderGeometry(
//                 radius,
//                 radius,
//                 extensionLength,
//                 8
//               );
//               const color = "blue";

//               return (
//                 <group key={`wire-${colIndex}-${wireIndex}-group`}>
//                   <mesh
//                     key={`wire-${colIndex}-${wireIndex}`}
//                     geometry={geometry}
//                     position={[
//                       -(wire.x / 1000 - centerOffset[0]) * scale,
//                       wireLength / 2 + floorY,
//                       -(wire.y / 1000 - centerOffset[2]) * scale,
//                     ]}
//                   >
//                     <meshBasicMaterial
//                       color={color}
//                       // polygonOffset
//                       // polygonOffsetFactor={-1}
//                       // polygonOffsetUnits={-4}
//                       // depthWrite={false}
//                       // opacity={0.5}
//                     />
//                   </mesh>
//                   <mesh
//                     key={`wire-extension-${colIndex}-${wireIndex}`}
//                     geometry={extensionGeometry}
//                     position={
//                       wire.edge === "left"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale +
//                               450 / 2000,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale,
//                           ]
//                         : wire.edge === "right"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale -
//                               450 / 2000,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale,
//                           ]
//                         : wire.edge === "top"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale +
//                               450 / 2000,
//                           ]
//                         : wire.edge === "bottom"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale -
//                               450 / 2000,
//                           ]
//                         : wire.edge === "top-left"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale +
//                               450 / 2800,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale +
//                               450 / 2800,
//                           ]
//                         : wire.edge === "top-right"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale -
//                               450 / 2800,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale +
//                               450 / 2800,
//                           ]
//                         : wire.edge === "bottom-left"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale +
//                               450 / 2800,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale -
//                               450 / 2800,
//                           ]
//                         : wire.edge === "bottom-right"
//                         ? [
//                             -(wire.x / 1000 - centerOffset[0]) * scale -
//                               450 / 2800,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale -
//                               450 / 2800,
//                           ]
//                         : [
//                             -(wire.x / 1000 - centerOffset[0]) * scale,
//                             floorY,
//                             -(wire.y / 1000 - centerOffset[2]) * scale,
//                           ]
//                     }
//                     rotation={[
//                       wire.edge === "top"
//                         ? Math.PI / 2
//                         : wire.edge === "bottom"
//                         ? -Math.PI / 2
//                         : wire.edge === "top-left"
//                         ? Math.PI / 2
//                         : wire.edge === "top-right"
//                         ? -Math.PI / 2
//                         : wire.edge === "bottom-left"
//                         ? Math.PI / 2
//                         : wire.edge === "bottom-right"
//                         ? -Math.PI / 2
//                         : 0,
//                       0,
//                       wire.edge === "left"
//                         ? Math.PI / 2
//                         : wire.edge === "right"
//                         ? -Math.PI / 2
//                         : wire.edge === "top-left"
//                         ? -Math.PI / 4
//                         : wire.edge === "top-right"
//                         ? -Math.PI / 4
//                         : wire.edge === "bottom-left"
//                         ? Math.PI / 4
//                         : wire.edge === "bottom-right"
//                         ? Math.PI / 4
//                         : 0,
//                     ]}
//                   >
//                     <meshBasicMaterial
//                       color={color}
//                       // polygonOffset
//                       // polygonOffsetFactor={-1}
//                       // polygonOffsetUnits={-4}
//                       // depthWrite={false}
//                     />
//                   </mesh>
//                 </group>
//               );
//             })
//           )}
//         </group>
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
  ({ centerOffset = [0, 0, 0], floorY = 0.075, onHorizontalLinesCount }) => {
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
            centerX,
            centerZ,
          };
        })
        .filter(Boolean);
    }, [columns, centerOffset, configStore.shed3D.heights.COLUMNS]);

    // Calculate the minimum number of lines needed (x or z)
    const horizontalLinesCount = useMemo(() => {
      const tolerance = 0.001; // Tolerance in meters for both x and z

      // Unique x-coordinates
      const xCoords = instances.map((instance) => instance.centerX);
      const uniqueXCoords = [];
      xCoords.forEach((x) => {
        const isUnique = !uniqueXCoords.some(
          (existingX) => Math.abs(existingX - x) < tolerance
        );
        if (isUnique) {
          uniqueXCoords.push(x);
        }
      });

      // Unique z-coordinates
      const zCoords = instances.map((instance) => instance.centerZ);
      const uniqueZCoords = [];
      zCoords.forEach((z) => {
        const isUnique = !uniqueZCoords.some(
          (existingZ) => Math.abs(existingZ - z) < tolerance
        );
        if (isUnique) {
          uniqueZCoords.push(z);
        }
      });

      // Return the minimum of the two
      return Math.min(uniqueXCoords.length, uniqueZCoords.length);
    }, [instances]);

    // Pass the count to a callback if provided
    useMemo(() => {
      if (onHorizontalLinesCount) {
        onHorizontalLinesCount(horizontalLinesCount);
      }
    }, [horizontalLinesCount, onHorizontalLinesCount]);

    return (
      <>
        <group visible={uiStore.visibility.column}>
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
                  >
                    <meshBasicMaterial color={color} />
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
                    <meshBasicMaterial color={color} />
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
