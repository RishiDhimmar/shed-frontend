import React, { useMemo } from "react";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { toJS } from "mobx";
import wallStore from "../../stores/WallStore";
import BoxRenderer from "./Box";
import { Shed3DConfig } from "../../Constants";

const MUL_HEIGHT = 4;
function MullionColumnRenderer({ centerOffset, scale }) {
  const instances = useMemo(() => {
    return mullionColumnStore.polygons
      .map((mc) => {
        let rawPoints = mc.points || [];
        const cleanedPoints = rawPoints;

        const points = cleanedPoints.map((p) => ({
          x: -(p.x / 1000 - centerOffset[0]) * scale,
          z: -(p.y / 1000 - centerOffset[2]) * scale,
        }));

        if (points.length !== 4) {
          console.warn("Invalid baseplate points", toJS(baseplate));
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
        console.log(centerX, centerZ, width, length);

        return {
          width,
          length,
          height: MUL_HEIGHT,
          position: [
            centerX,
            Shed3DConfig.heights.MULLION_COLUMNS + MUL_HEIGHT / 2,
            centerZ,
          ],
          color: "red",
        };
      })
      .filter(Boolean);
  }, [mullionColumnStore.polygons, centerOffset]);

  console.log(instances);

  return (
    <>
      <BoxRenderer instances={instances} opacity={1} />
    </>
  );
}

export default MullionColumnRenderer;
