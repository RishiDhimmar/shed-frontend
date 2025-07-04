import React, { useMemo, useRef, useEffect } from "react";
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
import { Plane, mesh, useTexture } from "@react-three/drei";
import uiStore from "../../stores/UIStore";

// Extracted constants
const SCALE = 1; // Scaling factor
const PLASTER_THICKNESS = configStore.shed3D.heights.PLASTER_THICKNESS * SCALE; // 10mm = 0.01m, scaled
const COPING_BEAM_HEIGHT = configStore.shed3D.heights.COPING_BEAM_HEIGHT; // Coping beam height
const CYLINDER_RADIUS = 0.008; // Smaller radius for wire-like appearance
const CYLINDER_OFFSET = 0.1; // Offset for cylinders along beam length
const LINE_SPACING = 0.15; // 150mm in scaled units, matching GroundBeamRenderer
const WIRE_OFFSET = 0.05; // 50mm offset for frame positioning, matching GroundBeamRenderer

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

    // Reference for instanced mesh
    const instancedMeshRef = useRef();

    const instances = useMemo(() => {
      const beams = [];
      const plasterInstances = [];
      const brickWallInstances = [];
      const copingBeamInstances = [];
      const cylinderInstances = [];
      const verticalLines = [];
      const copingBeamAtPlinthInstances = [];
      let totalCylindersAndLinesLength = 0; // Track total length of cylinders and vertical lines

      // Ensure we have enough points to form at least one beam
      const minPoints = Math.min(
        externalWallPoints.length,
        internalWallPoints.length
      );
      if (minPoints < 2)
        return {
          beams: [],
          plaster: [],
          brickWall: [],
          copingBeam: [],
          copingBeamAtPlinth: [],
          cylinders: [],
          verticalLines: [],
          totalCylindersAndLinesLength: 0,
        };

      // Helper function to compute normal for a segment
      const computeNormal = (p1, p2, isExternal) => {
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length === 0) return { x: 0, z: 0 };
        return isExternal
          ? { x: dz / length, z: -dx / length } // Outward
          : { x: -dz / length, z: dx / length }; // Inward
      };

      // Iterate over points to create beams, plaster, and cylinders
      for (let i = 0; i < minPoints; i++) {
        let j = i + 1;
        if (j >= minPoints) j = 0;

        const extP1 = {
          x: -(externalWallPoints[i].x / 1000 - centerOffset[0]) * SCALE,
          z: -(externalWallPoints[i].y / 1000 - centerOffset[2]) * SCALE,
        };
        const extP2 = {
          x: -(externalWallPoints[j].x / 1000 - centerOffset[0]) * SCALE,
          z: -(externalWallPoints[j].y / 1000 - centerOffset[2]) * SCALE,
        };
        const intP1 = {
          x: -(internalWallPoints[i].x / 1000 - centerOffset[0]) * SCALE,
          z: -(internalWallPoints[i].y / 1000 - centerOffset[2]) * SCALE,
        };
        const intP2 = {
          x: -(internalWallPoints[j].x / 1000 - centerOffset[0]) * SCALE,
          z: -(internalWallPoints[j].y / 1000 - centerOffset[2]) * SCALE,
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
        let angle = Math.atan2(dz, dx);

        // Normalize angle to [0, 2π)
        if (angle < 0) {
          angle += Math.PI * 2;
        }

        const snapAngles = [0, Math.PI / 2, Math.PI, Math.PI * 2];
        const snapThreshold = 0.1745; // ~10 degrees in radians

        for (let snapAngle of snapAngles) {
          if (Math.abs(angle - snapAngle) < snapThreshold) {
            angle = snapAngle;
            break;
          }
        }

        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        // Add wall beam
        if (width > 0 && length > 0) {
          beams.push({
            width:
              i % 2 !== 0
                ? width - (2 * wallStore.wallThickness) / 1000
                : width,
            height: height * SCALE,
            length:
              i % 2 === 0
                ? length
                : length - (2 * wallStore.wallThickness) / 1000,
            position: [
              centerX,
              configStore.shed3D.heights.PLINTH + height / 2,
              centerZ,
            ],
            rotation: [0, angle, 0],
            color: "orange",
          });

          const h2 =
            configStore.shed3D.heights.PLINTH -
            configStore.shed3D.heights.PLINTH_Z_HEIGHT -
            (configStore.shed3D.heights.GROUND_BEAM +
              configStore.shed3D.heights.GB_Z_HEIGHT);

          brickWallInstances.push({
            width:
              i % 2 === 0
                ? width
                : width - (2 * wallStore.wallThickness) / 1000,
            height: h2,
            length:
              i % 2 !== 0
                ? length - (2 * wallStore.wallThickness) / 1000
                : length,
            position: [
              centerX,
              configStore.shed3D.heights.PLINTH -
                configStore.shed3D.heights.PLINTH_Z_HEIGHT -
                h2 / 2,
              centerZ,
            ],
            rotation: [0, angle, 0],
            color: "#CB4154",
          });

          copingBeamInstances.push({
            width:
              i % 2 !== 0
                ? width
                : width - (2 * wallStore.wallThickness) / 1000,
            height: COPING_BEAM_HEIGHT,
            length:
              i % 2 === 0
                ? length - (2 * wallStore.wallThickness) / 1000
                : length,
            position: [
              centerX,
              configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT +
                configStore.shed3D.heights.PLINTH -
                COPING_BEAM_HEIGHT / 2,
              centerZ,
            ],
            rotation: [0, angle, 0],
            color: "cyan",
          });
          copingBeamAtPlinthInstances.push({
            width:
              i % 2 !== 0
                ? width
                : width - (2 * wallStore.wallThickness) / 1000,
            height: 0.125,
            length:
              i % 2 === 0
                ? length - (2 * wallStore.wallThickness) / 1000
                : length,
            position: [
              centerX,
              configStore.shed3D.heights.PLINTH - COPING_BEAM_HEIGHT / 2,
              centerZ,
            ],
            rotation: [0, angle, 0],
            color: "cyan",
          });

          // Add reinforcement frames for coping beam (verticalLines)
          const beamHeight = COPING_BEAM_HEIGHT;
          const wireLength =
            boxWidth > boxLength ? boxWidth - 0.1 : boxLength - 0.1;
          const isLengthPrimary = boxLength >= boxWidth;
          const cosAngle = Math.cos(angle);
          const sinAngle = Math.sin(angle);
          const perpCos = Math.cos(angle + Math.PI / 2);
          const perpSin = Math.sin(angle + Math.PI / 2);

          if (wireLength > 0) {
            const numLines = Math.floor(wireLength / LINE_SPACING) + 1;
            const startOffset = -((numLines - 1) * LINE_SPACING) / 2;
            for (let k = 0; k < numLines; k++) {
              const offset = startOffset + k * LINE_SPACING;
              let lineX, lineZ;

              if (isLengthPrimary) {
                lineX = centerX + offset * cosAngle;
                lineZ = centerZ + offset * sinAngle;
              } else {
                lineX = centerX + offset * perpSin;
                lineZ = centerZ + offset * perpCos;
              }

              const halfWidth = Math.min(boxWidth, boxLength) / 2 - 0.02;
              const halfHeight = beamHeight / 2 - 0.0004;

              const corners = [
                [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
                [lineX - halfWidth * perpCos, lineZ - halfWidth * perpSin],
                [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
                [lineX + halfWidth * perpCos, lineZ + halfWidth * perpSin],
              ];

              // Vertical posts (four per frame)
              corners.forEach(([cornerX, cornerZ], cornerIndex) => {
                const verticalHeight = beamHeight - 0.0008;
                verticalLines.push({
                  radius: 0.008,
                  height: verticalHeight,
                  position: [
                    cornerX,
                    configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT +
                      configStore.shed3D.heights.PLINTH -
                      COPING_BEAM_HEIGHT / 2,
                    cornerZ,
                  ],
                  rotation: [0, 0, 0],
                  color: "purple",
                });

                // same entry with different height
                verticalLines.push({
                  radius: 0.008,
                  height: verticalHeight,
                  position: [
                    cornerX,
                    configStore.shed3D.heights.PLINTH -
                      configStore.shed3D.heights.PLINTH_Z_HEIGHT / 2,
                    cornerZ,
                  ],
                  rotation: [0, 0, 0],
                  color: "purple",
                });
                totalCylindersAndLinesLength += verticalHeight;
              });

              // Horizontal connections (two per frame)
              const connections = [
                {
                  start: [
                    lineX + halfWidth * perpCos,
                    lineZ + halfWidth * perpSin,
                  ],
                  end: [
                    lineX - halfWidth * perpCos,
                    lineZ - halfWidth * perpSin,
                  ],
                  verticalOffset: halfHeight,
                },
                {
                  start: [
                    lineX + halfWidth * perpCos,
                    lineZ + halfWidth * perpSin,
                  ],
                  end: [
                    lineX - halfWidth * perpCos,
                    lineZ - halfWidth * perpSin,
                  ],
                  verticalOffset: -halfHeight,
                },
              ];

              connections.forEach(({ start, end, verticalOffset }) => {
                const midX = (start[0] + end[0]) / 2;
                const midZ = (start[1] + end[1]) / 2;
                const connectionLength = Math.sqrt(
                  (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2
                );
                const connAngle = Math.atan2(
                  end[1] - start[1],
                  end[0] - start[0]
                );

                verticalLines.push({
                  radius: 0.008,
                  height: connectionLength,
                  position: [
                    midX,
                    configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT +
                      configStore.shed3D.heights.PLINTH -
                      COPING_BEAM_HEIGHT / 2 +
                      verticalOffset,
                    midZ,
                  ],
                  rotation: [Math.PI / 2, 0, connAngle + Math.PI / 2],
                  color: "purple",
                });

                // same entry with different height
                verticalLines.push({
                  radius: 0.008,
                  height: connectionLength,
                  position: [
                    midX,
                    configStore.shed3D.heights.PLINTH -
                      configStore.shed3D.heights.PLINTH_Z_HEIGHT / 2 +
                      verticalOffset,
                    midZ,
                  ],
                  rotation: [Math.PI / 2, 0, connAngle + Math.PI / 2],
                  color: "purple",
                });
                totalCylindersAndLinesLength += connectionLength;
              });
            }
          }

          // Calculate cylinder height for coping beam cylinders
          const cylinderHeight =
            angle === 0 || angle === Math.PI || angle === -Math.PI
              ? width - 0.1
              : length;

          // Add cylinders for coping beam and accumulate length
          cylinderInstances.push(
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX + 0.05,
                configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT +
                  configStore.shed3D.heights.PLINTH -
                  COPING_BEAM_HEIGHT / 2 -
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ - 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            },
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX - 0.05,
                configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT +
                  configStore.shed3D.heights.PLINTH -
                  COPING_BEAM_HEIGHT / 2 -
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ + 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            },
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX + 0.05,
                configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT +
                  configStore.shed3D.heights.COLUMNS -
                  COPING_BEAM_HEIGHT / 2 +
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ - 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            },
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX - 0.05,
                configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT +
                  configStore.shed3D.heights.COLUMNS -
                  COPING_BEAM_HEIGHT / 2 +
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ + 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            }
          );

          //push the same entires again but with different height
          cylinderInstances.push(
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX + 0.05,
                configStore.shed3D.heights.PLINTH -
                  configStore.shed3D.heights.PLINTH_Z_HEIGHT / 2 -
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ - 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            },
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX - 0.05,
                configStore.shed3D.heights.PLINTH -
                  configStore.shed3D.heights.PLINTH_Z_HEIGHT / 2 -
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ + 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            },
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX + 0.05,
                configStore.shed3D.heights.PLINTH -
                  configStore.shed3D.heights.PLINTH_Z_HEIGHT / 2 +
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ - 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            },
            {
              radius: CYLINDER_RADIUS,
              height: cylinderHeight,
              position: [
                angle === 0 || angle === Math.PI || angle === -Math.PI
                  ? centerX
                  : centerX - 0.05,
                configStore.shed3D.heights.PLINTH -
                  configStore.shed3D.heights.PLINTH_Z_HEIGHT / 2 +
                  0.05,
                angle === Math.PI / 2 || angle === -Math.PI / 2
                  ? centerZ
                  : centerZ + 0.05,
              ],
              rotation: [0, angle, 0],
              color: "blue",
            }
          );

          // Add to total length (4 cylinders per segment)
          totalCylindersAndLinesLength += 4 * cylinderHeight;

          // Compute normals for plaster
          const extNormal = computeNormal(extP1, extP2, true);
          const intNormal = computeNormal(intP1, intP2, false);

          // External plaster (offset outward)
          const extPlasterLength = Math.sqrt(
            (extP2.x - extP1.x) ** 2 + (extP2.z - extP1.z) ** 2
          );
          if (extPlasterLength > 0) {
            plasterInstances.push({
              width: PLASTER_THICKNESS,
              height: height * SCALE,
              length: extPlasterLength,
              position: [
                (extP1.x + extP2.x) / 2 + extNormal.x * (PLASTER_THICKNESS / 2),
                configStore.shed3D.heights.COLUMNS +
                  configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT / 2,
                (extP1.z + extP2.z) / 2 + extNormal.z * (PLASTER_THICKNESS / 2),
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
              width: PLASTER_THICKNESS,
              height: height * SCALE,
              length: intPlasterLength,
              position: [
                (intP1.x + intP2.x) / 2 + intNormal.x * (PLASTER_THICKNESS / 2),
                configStore.shed3D.heights.COLUMNS +
                  configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT / 2,
                (intP1.z + intP2.z) / 2 + intNormal.z * (PLASTER_THICKNESS / 2),
              ],
              rotation: angle,
            });
          }
        }
      }

      return {
        beams,
        plaster: plasterInstances,
        brickWall: brickWallInstances,
        copingBeam: copingBeamInstances,
        copingBeamAtPlinth: copingBeamAtPlinthInstances,
        cylinders: cylinderInstances,
        verticalLines,
        totalCylindersAndLinesLength, // Include total length
      };
    }, [
      externalWallPoints,
      internalWallPoints,
      centerOffset,
      height,
      floorY,
      configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
      configStore.shed3D.heights.COPING_BEAM_HEIGHT,
    ]);

    // Log total cylinder and vertical lines length for debugging
    useEffect(() => {
      console.log(
        `Total length of coping beam cylinders and vertical lines: ${instances.totalCylindersAndLinesLength.toFixed(
          2
        )} meters`
      );
      wallStore.setCopingBeamLength(instances.totalCylindersAndLinesLength);
    }, [instances.totalCylindersAndLinesLength]);

    // Update instanced mesh for vertical lines
    useEffect(() => {
      if (instancedMeshRef.current && instances.verticalLines.length > 0) {
        const matrix = new THREE.Matrix4();
        const dummy = new THREE.Object3D();

        instances.verticalLines.forEach((line, index) => {
          dummy.position.set(
            line.position[0],
            line.position[1],
            line.position[2]
          );
          dummy.rotation.set(
            line.rotation[0],
            line.rotation[1],
            line.rotation[2]
          );
          dummy.scale.set(1, line.height, 1);
          dummy.updateMatrix();
          instancedMeshRef.current.setMatrixAt(index, dummy.matrix);
        });

        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }, [instances.verticalLines]);

    return (
      <>
        <group visible={uiStore.visibility.shade}>
          <BoxRenderer instances={instances.beams} renderOrder={-1} />
        </group>
        <group visible={uiStore.visibility.brickWork}>
          <BoxRenderer instances={instances.brickWall} />
        </group>
        <group visible={uiStore.visibility.copingBeam}>
          <BoxRenderer instances={instances.copingBeam} />
          <BoxRenderer instances={instances.copingBeamAtPlinth} />
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
        <group visible={uiStore.visibility.copingBeam}>
          {instances.cylinders.map((cylinder, index) => (
            <mesh
              key={`cylinder-${index}`}
              position={cylinder.position}
              rotation={[0, cylinder.rotation[1] || 0, Math.PI / 2]}
            >
              <cylinderGeometry
                args={[cylinder.radius, cylinder.radius, cylinder.height, 32]}
              />
              <meshBasicMaterial color={cylinder.color} depthWrite={false} />
            </mesh>
          ))}
        </group>
        <group visible={uiStore.visibility.copingBeam}>
          {instances.verticalLines.length > 0 && (
            <instancedMesh
              ref={instancedMeshRef}
              args={[null, null, instances.verticalLines.length]}
              depthWrite={false}
            >
              <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
              <meshBasicMaterial color="purple" depthWrite={false} />
            </instancedMesh>
          )}
        </group>
      </>
    );
  }
);

export default ShedWallRenderer;
