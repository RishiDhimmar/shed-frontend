

import React, { useMemo } from "react";
import { toJS } from "mobx";
import wallStore from "../../stores/WallStore";
import BoxRenderer from "./Box";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import {
  convertToPointObjects,
  sortPolygonPointsClockwise,
} from "../../utils/PolygonUtils";
import dxfStore from "../../stores/DxfStore";
import configStore from "../../stores/ConfigStore";
import { Plane, mesh } from "@react-three/drei";
import uiStore from "../../stores/UIStore";

const scale = 1; // Scaling factor

const ShedWallRenderer = observer(
  ({
    centerOffset = [0, 0, 0],
    floorY = 0.4,
    height = configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
  }) => {
    const externalWallPoints =
      convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
    const internalWall = dxfStore.internalWallPolygon?.filter(
      (_, index) => index % 3 !== 2
    );
    const internalWallPoints = convertToPointObjects(internalWall) || [];

    const instances = useMemo(() => {
      const beams = [];
      const plasterInstances = [];

      // Ensure we have enough points to form at least one beam
      const minPoints = Math.min(
        externalWallPoints.length,
        internalWallPoints.length
      );
      if (minPoints < 2) return { beams: [], plaster: [] };

      // Helper function to compute normal for a segment
      const computeNormal = (p1, p2, isExternal) => {
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length === 0) return { x: 0, z: 0 };
        // Normal perpendicular to segment (rotate 90 degrees clockwise for external, counterclockwise for internal)
        return isExternal
          ? { x: dz / length, z: -dx / length } // Outward
          : { x: -dz / length, z: dx / length }; // Inward
      };

      // Iterate over points to create beams and plaster
      for (let i = 0; i < minPoints; i++) {
        let j = i + 1;
        if (j >= minPoints) j = 0;

        const extP1 = {
          x: -(externalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
          z: -(externalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
        };
        const extP2 = {
          x: -(externalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
          z: -(externalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
        };
        const intP1 = {
          x: -(internalWallPoints[i].x / 1000 - centerOffset[0]) * scale,
          z: -(internalWallPoints[i].y / 1000 - centerOffset[2]) * scale,
        };
        const intP2 = {
          x: -(internalWallPoints[j].x / 1000 - centerOffset[0]) * scale,
          z: -(internalWallPoints[j].y / 1000 - centerOffset[2]) * scale,
        };

        // Wall beam points
        const points = [extP1, extP2, intP1, intP2];

        // Calculate bounding box for the quadrilateral
        const xs = points.map((p) => p.x);
        const zs = points.map((p) => p.z);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minZ = Math.min(...zs);
        const maxZ = Math.max(...zs);

        // Wall beam dimensions
        const boxWidth = maxX - minX;
        const boxLength = maxZ - minZ;
        const width = boxWidth;
        const length = boxLength;

        // Calculate rotation for wall beam
        const dx = extP2.x - extP1.x;
        const dz = extP2.z - extP1.z;
        const angle = Math.atan2(dz, dx);
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        // Add wall beam
        if (width > 0 && length > 0) {
          beams.push({
            width,
            height: height * scale,
            length,
            position: [
              centerX,
              configStore.shed3D.heights.COLUMNS +
                configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT / 2,
              centerZ,
            ],
            rotation: [0, angle, 0], // Radians for Three.js
            color: "orange",
          });
        }

        // Compute normals for plaster
        const extNormal = computeNormal(extP1, extP2, true);
        const intNormal = computeNormal(intP1, intP2, false);

        // Plaster thickness (10mm = 0.01m)
        const plasterThickness = 0.1 * scale;

        // External plaster (offset outward)
        const extPlasterLength = Math.sqrt(
          (extP2.x - extP1.x) ** 2 + (extP2.z - extP1.z) ** 2
        );
        if (extPlasterLength > 0) {
          plasterInstances.push({
            width: plasterThickness,
            height: height * scale,
            length: extPlasterLength,
            position: [
              (extP1.x + extP2.x) / 2 + extNormal.x * (plasterThickness / 2),
              configStore.shed3D.heights.COLUMNS +
                configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT / 2,
              (extP1.z + extP2.z) / 2 + extNormal.z * (plasterThickness / 2),
            ],
            rotation: angle,
          });
        }

        // Internal plaster (offset inward)
        const intPlasterLength = Math.sqrt(
          (intP2.x - intP1.x) ** 2 + (intP2.z - intP1.z) ** 2
        );
        if (intPlasterLength > 0) {
          plasterInstances.push({
            width: plasterThickness,
            height: height * scale,
            length: intPlasterLength,
            position: [
              (intP1.x + intP2.x) / 2 + intNormal.x * (plasterThickness / 2),
              configStore.shed3D.heights.COLUMNS +
                configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT / 2,
              (intP1.z + intP2.z) / 2 + intNormal.z * (plasterThickness / 2),
            ],
            rotation: angle,
          });
        }
      }

      return { beams, plaster: plasterInstances };
    }, [
      externalWallPoints,
      internalWallPoints,
      centerOffset,
      height,
      floorY,
      configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
    ]);

    return (
      <>
        <group visible={uiStore.visibility.shade}>
          <BoxRenderer instances={instances.beams} />
        </group>
        <group visible={uiStore.visibility.plaster}>
          {instances.plaster.map((plaster, index) => (
            <mesh
              key={`plaster-${index}`}
              position={plaster.position}
              rotation={[0, (plaster.rotation || 0) + Math.PI / 2, 0]}
            >
              <boxGeometry
                args={[plaster.width, plaster.height, plaster.length]}
              />
              <meshBasicMaterial color="gray" depthWrite={false} opacity={1} />
            </mesh>
          ))}
        </group>
      </>
    );
  }
);

export default ShedWallRenderer;

