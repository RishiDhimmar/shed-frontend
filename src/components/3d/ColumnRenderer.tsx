import React, { useEffect, useMemo } from "react";
import { toJS } from "mobx";
import columnStore from "../../stores/ColumnStore";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import configStore from "../../stores/ConfigStore";
import BoxRenderer from "./Box";
import uiStore from "../../stores/UIStore";
import MultiRingRenderer from "./MultiRingRenderer";
import wallStore from "../../stores/WallStore";

const scale = 1;

const ColumnRenderer = observer(
  ({ centerOffset = [0, 0, 0], floorY = 0.075, onAdditionalBeamCount }) => {
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
            grpName: c.groupName,
          };
        })
        .filter(Boolean);
    }, [columns, centerOffset, configStore.shed3D.heights.COLUMNS]);

    // 1. Memoize the beam calculation
    // const additionalBeamData = useMemo(() => {
    //   const tolerance = 0.001;
    //   const xCoords = instances.map((instance) => instance.centerX);
    //   const xCoordWithoutGroup4 = instances
    //     .filter((instance) =>
    //       instance.grpName.toLowerCase().includes("group 4")
    //     )
    //     .map((instance) => instance.centerX);
    //   const uniqueXCoords = [];
    //   xCoordWithoutGroup4.forEach((x) => {
    //     const isUnique = !uniqueXCoords.some(
    //       (existingX) => Math.abs(existingX - x) < tolerance
    //     );
    //     if (isUnique) uniqueXCoords.push(x);
    //   });

    //   const zCoords = instances.map((instance) => instance.centerZ);
    //   const zCoordWithoutGroup4 = instances
    //     .filter((instance) =>
    //       instance.grpName.toLowerCase().includes("group 4")
    //     )
    //     .map((instance) => instance.centerZ);
    //   const uniqueZCoords = [];
    //   zCoordWithoutGroup4.forEach((z) => {
    //     const isUnique = !uniqueZCoords.some(
    //       (existingZ) => Math.abs(existingZ - z) < tolerance
    //     );
    //     if (isUnique) uniqueZCoords.push(z);
    //   });

    //   const beamLines = [];
    //   const height = configStore.shed3D.heights.COLUMNS + floorY;

    //   console.log(
    //     "uniqueXCoords",
    //     uniqueXCoords.length,
    //     "uniqueZCoords",
    //     uniqueZCoords.length
    //   );

    //   if (uniqueXCoords.length <= uniqueZCoords.length) {
    //     const zMin = Math.min(...uniqueZCoords);
    //     const zMax = Math.max(...uniqueZCoords);

    //     //second minimum z
    //     const zMin2 = Math.min(
    //       ...zCoords.filter((z) => z !== zMin && z !== zMax)
    //     );
    //     const zMax2 = Math.max(
    //       ...zCoords.filter((z) => z !== zMin && z !== zMax)
    //     );
    //     uniqueXCoords.forEach((x) => {
    //       beamLines.push({
    //         start: { x, y: height, z: zMin - (zMin - zMin2) },
    //         end: { x, y: height, z: zMax + (zMax2 - zMax) },
    //       });
    //     });
    //   } else {
    //     const xMin = Math.min(...uniqueXCoords);
    //     const xMax = Math.max(...uniqueXCoords);

    //     //second minimum x
    //     const xMin2 = Math.min(
    //       ...xCoords.filter((x) => x !== xMin && x !== xMax)
    //     );
    //     const xMax2 = Math.max(
    //       ...xCoords.filter((x) => x !== xMin && x !== xMax)
    //     );
    //     uniqueZCoords.forEach((z) => {
    //       beamLines.push({
    //         start: { x: xMin - (xMin - xMin2), y: height, z },
    //         end: { x: xMax + (xMax2 - xMax), y: height, z },
    //       });
    //     });
    //   }

    //   return {
    //     beamLines,
    //     axis: uniqueXCoords.length <= uniqueZCoords.length ? "z" : "x",
    //     count:
    //       uniqueXCoords.length <= uniqueZCoords.length
    //         ? uniqueZCoords.length
    //         : uniqueXCoords.length,
    //   };
    // }, [instances, configStore.shed3D.heights.COLUMNS, floorY]);

    const additionalBeamData = useMemo(() => {
      const tolerance = 0.001;
      const xCoords = instances.map((instance) => instance.centerX);
      const xCoordWithoutGroup4 = instances
        .filter((instance) =>
          instance.grpName.toLowerCase().includes("group 4")
        )
        .map((instance) => instance.centerX);
      const uniqueXCoords = [];
      xCoordWithoutGroup4.forEach((x) => {
        const isUnique = !uniqueXCoords.some(
          (existingX) => Math.abs(existingX - x) < tolerance
        );
        if (isUnique) uniqueXCoords.push(x);
      });

      const zCoords = instances.map((instance) => instance.centerZ);
      const zCoordWithoutGroup4 = instances
        .filter((instance) =>
          instance.grpName.toLowerCase().includes("group 4")
        )
        .map((instance) => instance.centerZ);
      const uniqueZCoords = [];
      zCoordWithoutGroup4.forEach((z) => {
        const isUnique = !uniqueZCoords.some(
          (existingZ) => Math.abs(existingZ - z) < tolerance
        );
        if (isUnique) uniqueZCoords.push(z);
      });

      const beamLines = [];
      const height = configStore.shed3D.heights.COLUMNS + floorY;

      console.log(
        "uniqueXCoords",
        uniqueXCoords.length,
        "uniqueZCoords",
        uniqueZCoords.length
      );

      if (uniqueXCoords.length <= uniqueZCoords.length) {
        const zMin = Math.min(...uniqueZCoords);
        const zMax = Math.max(...uniqueZCoords);

        //second minimum z
        const zMin2 = Math.min(
          ...zCoords.filter((z) => z !== zMin && z !== zMax)
        );
        const zMax2 = Math.max(
          ...zCoords.filter((z) => z !== zMin && z !== zMax)
        );
        uniqueXCoords.forEach((x) => {
          beamLines.push({
            start: { x, y: height, z: zMin - (zMin - zMin2) },
            end: { x, y: height, z: zMax + (zMax2 - zMax) },
          });
        });
      } else {
        const xMin = Math.min(...uniqueXCoords);
        const xMax = Math.max(...uniqueXCoords);

        //second minimum x
        const xMin2 = Math.min(
          ...xCoords.filter((x) => x !== xMin && x !== xMax)
        );
        const xMax2 = Math.max(
          ...xCoords.filter((x) => x !== xMin && x !== xMax)
        );
        uniqueZCoords.forEach((z) => {
          beamLines.push({
            start: { x: xMin - (xMin - xMin2), y: height, z },
            end: { x: xMax + (xMax2 - xMax), y: height, z },
          });
        });
      }

      // Add columns to each beam line without modifying existing logic
      const beamLinesWithColumns = beamLines.map((beam) => {
        let columns;
        if (uniqueXCoords.length <= uniqueZCoords.length) {
          // Z-axis beams: match columns by x-coordinate
          columns = instances
            .filter(
              (instance) =>
                Math.abs(instance.centerX - beam.start.x) < tolerance
            )
            .sort((a, b) => a.centerZ - b.centerZ); // Sort by z-coordinate

          // columns.pop();
          // columns.shift();
        } else {
          // X-axis beams: match columns by z-coordinate
          columns = instances
            .filter(
              (instance) =>
                Math.abs(instance.centerZ - beam.start.z) < tolerance
            )
            .sort((a, b) => a.centerX - b.centerX); // Sort by x-coordinate
          // columns.pop();
          // columns.shift();
        }
        return { ...beam, columns };
      });

      return {
        beamLines: beamLinesWithColumns,
        axis: uniqueXCoords.length <= uniqueZCoords.length ? "z" : "x",
        count:
          uniqueXCoords.length <= uniqueZCoords.length
            ? uniqueZCoords.length
            : uniqueXCoords.length,
      };
    }, [instances, configStore.shed3D.heights.COLUMNS, floorY]);

    // 2. Trigger side effects with the result
    useEffect(() => {
      if (onAdditionalBeamCount) {
        onAdditionalBeamCount(additionalBeamData);
      }
      wallStore.setAdditionalBeams(additionalBeamData);
    }, [additionalBeamData, onAdditionalBeamCount]);

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
