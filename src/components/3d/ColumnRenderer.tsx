import React, { useMemo } from "react";
import { toJS } from "mobx";
import columnStore from "../../stores/ColumnStore";
import BoxRenderer from "./Box";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import configStore from "../../stores/ConfigStore";

const scale = 1;

const ColumnRenderer = observer(({ centerOffset = [0, 0, 0], floorY = 0.075 }) => {
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
      <BoxRenderer instances={instances} opacity={0.2} />

      {columns.map((col, colIndex) =>
        (col.wireData || []).map((wire, wireIndex) => {
          if (!wire.x || !wire.y || !wire.radius) {
            console.warn(
              `Invalid wire data for column ${colIndex}, wire ${wireIndex}:`,
              toJS(wire)
            );
            return null;
          }

          const wireLength = configStore.shed3D.heights.COLUMNS;
          const radius = (wire.radius / 1000) * scale;

          const geometry = new THREE.CylinderGeometry(radius, radius, wireLength, 8);
          const color = "blue";

          return (
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
              />
            </mesh>
          );
        })
      )}
    </>
  );
});

export default ColumnRenderer;
