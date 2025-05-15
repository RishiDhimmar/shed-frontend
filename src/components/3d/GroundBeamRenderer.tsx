import React, { useMemo } from "react";
import { toJS } from "mobx";
import wallStore from "../../stores/WallStore";
import BoxRenderer from "./Box";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import { Shed3DConfig } from "../../Constants";
import {
  convertToPointObjects,
  sortPolygonPointsClockwise,
} from "../../utils/PolygonUtils";
import dxfStore from "../../stores/DxfStore";

const scale = 0.1; // Scaling factor
const defaultBeamHeight = 0.5; // Default height, e.g., 100mm

const GroundBeamRenderer = observer(
  ({
    centerOffset = [0, 0, 0],
    floorY = 0.4,
    height = defaultBeamHeight,
  }) => {
    const externalWallPoints =
      convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
    const internalWall = dxfStore.internalWallPolygon?.filter(
      (_, index) => index % 3 !== 2
    );
    const internalWallPoints = convertToPointObjects(internalWall) || [];

    console.log(
      "externalWallPoints",
      externalWallPoints,
      "internalWallPoints",
      internalWallPoints
    );

    const instances = useMemo(() => {
      const beams = [];

      // Ensure we have enough points to form at least one beam
      const minPoints = Math.min(
        externalWallPoints.length,
        internalWallPoints.length
      );
      if (minPoints < 2) return [];

      // Iterate over points to create beams
      for (let i = 0; i < minPoints; i++) {
        let j = i + 1;

        // Ensure we have enough points to form a beam
        if (j >= minPoints) {
          j = 0;
        }
        const points = [
          // External points i and i+1
          {
            x: -(externalWallPoints[i].x / 1000 - centerOffset[0]) * scale, // Three.js X
            z: -(externalWallPoints[i].y / 1000 - centerOffset[2]) * scale, // Three.js Z
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
        const width = boxWidth; // Wall thickness in meters, scaled
        const length = boxLength; // Use the bounding box length

        // Calculate the primary direction for rotation (along external points)
        const dx = points[1].x - points[0].x;
        const dz = points[1].z - points[0].z;
        const angle = Math.atan2(dz, dx);

        console.log(
          "Beam",
          i,
          "minX",
          minX,
          "maxX",
          maxX,
          "minZ",
          minZ,
          "maxZ",
          maxZ,
          "width",
          width,
          "length",
          length,
          "angle",
          (angle * 360) / Math.PI
        );

        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        // Only include valid beams
        if (width > 0 && length > 0) {
          beams.push({
            width,
            height: height * scale, // Use input height, scaled consistently
            length,
            position: [centerX, floorY, centerZ], // Center position
            rotation: [0, (angle * 360) / Math.PI, 0], // Align with the primary direction
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
