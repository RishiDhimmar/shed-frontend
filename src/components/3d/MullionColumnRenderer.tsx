import React, { useMemo } from "react";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { toJS } from "mobx";
import wallStore from "../../stores/WallStore";
import BoxRenderer from "./Box";
import configStore from "../../stores/ConfigStore";
import { observer } from "mobx-react-lite";

const MullionColumnRenderer = observer (({ centerOffset, scale }) =>  {
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

        return {
          width,
          length,
          height: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
          position: [
            centerX,
            configStore.shed3D.heights.COLUMNS + configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT / 2,
            centerZ,
          ],
          color: "red",
        };
      })
      .filter(Boolean);
  }, [mullionColumnStore.polygons, centerOffset, configStore.shed3D.heights.COLUMNS, configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT]);


  return (
    <>
      <BoxRenderer instances={instances} opacity={0.5} />
    </>
  );
})

export default MullionColumnRenderer;
