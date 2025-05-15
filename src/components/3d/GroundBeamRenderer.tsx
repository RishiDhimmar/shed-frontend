import React, { useMemo } from "react";
import { toJS } from "mobx";
import wallStore from "../../stores/WallStore";
import BoxRenderer from "./Box";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import { Shed3DConfig } from "../../Constants";
import { convertToPointObjects, sortPolygon, sortPolygonPointsClockwise } from "../../utils/PolygonUtils";
import { sortPolygonsClockwise } from "../../utils/sortPolygonsClockwise";

const scale = 0.1; // Scaling factor
const defaultBeamHeight = Shed3DConfig.heights.GROUND_BEAM || 0.1; // Default height, e.g., 100mm

const GroundBeamRenderer = observer(
  ({ centerOffset = [0, 0, 0], floorY = 0.01, height = defaultBeamHeight }) => {
    const externalWallPoints =
      sortPolygonPointsClockwise(convertToPointObjects(toJS(wallStore.externalWallPoints))) || [];
    const internalWallPoints =
      sortPolygonPointsClockwise(convertToPointObjects(toJS(wallStore.internalWallPoints))) || [];

    console.log(
      "externalWallPoints",
      externalWallPoints,
      "internalWallPoints",
      internalWallPoints
    );

    const instances = useMemo(() => {
      const beams = [];

      // Ensure we have enough points to form at least one beam
      const minPoints = Math.min(externalWallPoints.length, internalWallPoints.length);
      if (minPoints < 2) return [];

      // Iterate over points to create beams
      for (let i = 0; i <  1; i++) {
        const points = [
          // External points i and i+1
          {
            x: -(externalWallPoints[i].x / 1000 - centerOffset[0]) * scale, // Three.js X
            z: -(externalWallPoints[i].y / 1000 - centerOffset[2]) * scale, // Three.js Z
          },
          {
            x: -(externalWallPoints[i + 1].x / 1000 - centerOffset[0]) * scale,
            z: -(externalWallPoints[i + 1].y / 1000 - centerOffset[2]) * scale,
          },
          // Internal points i and i+1
          {
            x: -(internalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
            z: -(internalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
          },
          {
            x: -(internalWallPoints[i + 1].x / 1000 - centerOffset[0]) * scale,
            z: -(internalWallPoints[i + 1].y / 1000 - centerOffset[2]) * scale,
          },
        ];

        // Calculate bounding box for the quadrilateral
        const xs = points.map((p) => p.x);
        const zs = points.map((p) => p.z);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minZ = Math.min(...zs);
        const maxZ = Math.max(...zs);

        const length = maxX - minX;
        const width = maxZ - minZ;

        console.log("Beam", i, "minX", minX, "maxX", maxX, "minZ", minZ, "maxZ", maxZ, "width", width, "length", length);

        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        // Only include valid beams
        if (width > 0 && length > 0) {
          beams.push({
            width,
            height: wallStore.wallThickness / 10000, // Use input height, scaled consistently
            length,
            position: [centerX, (height * scale) / 2 + floorY, centerZ], // Center position, elevated by floorY
            color: "gray", // Default color for ground beams
          });
        }
      }

      return beams.filter(Boolean);
    }, [externalWallPoints, internalWallPoints, centerOffset, height, floorY]);

    return <BoxRenderer instances={instances} />;
  }
);

export default GroundBeamRenderer;