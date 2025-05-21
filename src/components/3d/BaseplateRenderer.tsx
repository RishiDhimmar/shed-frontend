import React, { useMemo } from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import baseplateStore from "../../stores/BasePlateStore";
import BoxRenderer from "./Box"; // Use the same BoxRenderer for consistency
import { removeDuplicatePoints } from "../../utils/PolygonUtils";
import { MeshBasicMaterial } from "three";
import { Shed3DConfig } from "../../Constants";

const BASEPLATE_HEIGHT =0.0075; // small extrusion height for baseplates

const BaseplateRenderer = observer(({ centerOffset = [0, 0], scale = 1 }) => {
  const instances = useMemo(() => {
    return baseplateStore.basePlates
      .map((baseplate) => {
        let rawPoints = baseplate.points || [];
        const cleanedPoints = removeDuplicatePoints(rawPoints);

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
          height: BASEPLATE_HEIGHT,
          position: [centerX, Shed3DConfig.heights.BASE_PLATES + BASEPLATE_HEIGHT / 2 , centerZ],
          color: "green",
        };
      })
      .filter(Boolean);
  }, [baseplateStore.basePlates , centerOffset]);

  console.log(instances);

  return (
    <>
      <BoxRenderer instances={instances} opacity={1} />
    </>
  );
});

export default BaseplateRenderer;
