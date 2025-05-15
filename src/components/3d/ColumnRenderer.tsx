import React, { useMemo } from "react";
import { toJS } from "mobx";
import columnStore from "../../stores/ColumnStore";
import BoxRenderer from "./Box"; // Your reusable component
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import { Shed3DConfig } from "../../Constants";

const height = Shed3DConfig.heights.COLUMNS; // 600mm height
const scale = 0.1; // Scaling factor

const ColumnRenderer = observer(({ centerOffset = [0, 0, 0] , floorY = 0.01}) => {
  const columns = toJS(columnStore.columns);

  const instances = useMemo(() => {
    return columns
      .map((c) => {
        const points = (c.points || []).map((p) => ({
          x: -(p.x / 1000 - centerOffset[0]) * scale, // Three.js X
          z: -(p.y / 1000 - centerOffset[2]) * scale , // Three.js Z
        }));

        if (points.length !== 4) return null;

        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.z);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxZ = Math.max(...ys);

        const width = maxX - minX;
        const length = maxZ - minY;
        const centerX = (minX + maxX) / 2;
        const centerZ = (minY + maxZ) / 2;

        return {
          width,
          length,
          height,
          position: [centerX, height / 2 + floorY, centerZ],
          color: "blue",
        };
      })
      .filter(Boolean);
  }, [columns, centerOffset]);

  return <BoxRenderer instances={instances} />;
})

export default ColumnRenderer;
