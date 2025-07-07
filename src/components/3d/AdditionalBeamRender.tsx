import { JSX, useMemo } from "react";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import wallStore from "../../stores/WallStore";
import configStore from "../../stores/ConfigStore";
import { toJS } from "mobx";

// Wrap the component with observer to react to MobX changes
const AdditionalBeamRenderer = observer((): JSX.Element => {
  // Access the beamLines array from wallStore
  const beams = wallStore.additionalBeams.beamLines;

  console.log(toJS(beams));

  return (
    <>
      {beams?.map((beam, index) => {
        // Extract start and end points
        const start = beam.start;
        const end = beam.end;

        // Calculate the length of the beam (distance between start and end)
        const length = Math.sqrt(
          Math.pow(end.x - start.x, 2) +
            Math.pow(end.y - start.y, 2) +
            Math.pow(end.z - start.z, 2)
        );

        // Calculate the midpoint for positioning the box
        const position = new THREE.Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2,
          (start.z + end.z) / 2
        );

        // Calculate the direction vector for orientation
        const direction = new THREE.Vector3(
          end.x - start.x,
          end.y - start.y,
          end.z - start.z
        ).normalize();

        // Compute Euler rotation to align y-axis with direction and apply axis-based twist
        const rotation = (() => {
          if (!wallStore.additionalBeams.axis) {
            return [Math.PI / 2, 0, Math.PI / 2]; // Default rotation
          }

          const up = new THREE.Vector3(0, 1, 0);
          const axis = new THREE.Vector3()
            .crossVectors(up, direction)
            .normalize();
          const angle = Math.acos(up.dot(direction));

          const euler = new THREE.Euler();
          const quaternion = new THREE.Quaternion().setFromAxisAngle(
            axis,
            angle
          );
          euler.setFromQuaternion(quaternion, "XYZ");

          if (wallStore.additionalBeams.axis === "x") {
            euler.x += Math.PI / 2;
          }

          return [euler.x, euler.y, euler.z];
        })();

        // Box dimensions
        const width = 0.23;
        const depth = 0.6;
        const offset = 0.04; // Offset from edges

        // Corner cylinder dimensions
        const cornerCylinderRadius = 0.004; // Diameter 0.008 -> radius 0.004
        const cornerCylinderHeight = length;

        // Corner offsets for cylinders (width × depth cross-section) at 0.4 offset from edges
        const cornerOffsets = [
          new THREE.Vector3(width / 2 - offset, 0, depth / 2 - offset), // Top-right
          new THREE.Vector3(width / 2 - offset, 0, -(depth / 2 - offset)), // Top-left
          new THREE.Vector3(-(width / 2 - offset), 0, depth / 2 - offset), // Bottom-right
          new THREE.Vector3(-(width / 2 - offset), 0, -(depth / 2 - offset)), // Bottom-left
        ];

        // Ring cylinder dimensions
        const ringCylinderRadius = 0.004; // Same radius as corner cylinders
        const ringCylinderWidth = width - 2 * offset; // Adjusted for horizontal cylinders
        const ringCylinderDepth = depth - 2 * offset; // Adjusted for vertical cylinders

        // Calculate number of rings based on 0.15-unit spacing along the beam's length
        const ringSpacing = 0.15; // Adjusted to match scale of box dimensions
        const minRings = 3; // Minimum number of rings if length is short
        const numRings = Math.max(
          minRings,
          Math.floor(length / ringSpacing) + 1
        ); // Ensure at least minRings
        console.log(`Beam ${index} number of rings: ${numRings}`);

        return (
          <group key={index}>
            <group
              position={[
                position.x,
                configStore.shed3D.heights.GROUND_BEAM +
                  configStore.shed3D.heights.GB_Z_HEIGHT / 2,
                position.z,
              ]}
              rotation={rotation}
            >
              {/* Render the box */}
              <mesh>
                <boxGeometry args={[width, length, depth]} />
                <meshBasicMaterial
                  color="gray"
                  transparent={true}
                  opacity={0.5}
                />
              </mesh>
              {/* Render four corner cylinders */}
              {cornerOffsets.map((offset, cylIndex) => (
                <mesh
                  key={`_corner-cylinder-${cylIndex}`}
                  position={[offset.x, offset.y, offset.z]}
                >
                  <cylinderGeometry
                    args={[
                      cornerCylinderRadius,
                      cornerCylinderRadius,
                      cornerCylinderHeight,
                      32,
                    ]}
                  />
                  <meshStandardMaterial color="silver" />
                </mesh>
              ))}
              {/* Render multiple ring structures along the beam's length */}
              {Array.from({ length: numRings }).map((_, ringIndex) => {
                // Calculate offset along the beam's length (Y-axis in local space)
                const yOffset =
                  -length / 2 + (ringIndex * length) / (numRings - 1 || 1); // Evenly distribute if multiple rings
                return (
                  <group key={`ring-${ringIndex}`} position={[0, yOffset, 0]}>
                    {/* Horizontal cylinders (along X-axis, connecting top and bottom) */}
                    {[
                      {
                        start: [width / 2 - offset, 0, depth / 2 - offset],
                        end: [width / 2 - offset, 0, -(depth / 2 - offset)],
                        rotation: [0, Math.PI / 2, Math.PI / 2],
                      }, // Top
                      {
                        start: [-(width / 2 - offset), 0, depth / 2 - offset],
                        end: [-(width / 2 - offset), 0, -(depth / 2 - offset)],
                        rotation: [0, Math.PI / 2, Math.PI / 2],
                      }, // Bottom
                    ].map((cyl, cylIndex) => (
                      <mesh
                        key={`ring-horiz-${cylIndex}`}
                        position={[
                          (cyl.start[0] + cyl.end[0]) / 2,
                          0,
                          (cyl.start[2] + cyl.end[2]) / 2,
                        ]}
                        rotation={cyl.rotation}
                      >
                        <cylinderGeometry
                          args={[
                            ringCylinderRadius,
                            ringCylinderRadius,
                            ringCylinderDepth,
                            32,
                          ]}
                        />
                        <meshStandardMaterial color="gold" />
                      </mesh>
                    ))}
                    {/* Vertical cylinders (along Z-axis, connecting left and right) */}
                    {[
                      {
                        start: [width / 2 - offset, 0, depth / 2 - offset],
                        end: [-(width / 2 - offset), 0, depth / 2 - offset],
                        rotation: [Math.PI / 2, 0, Math.PI / 2],
                      }, // Mostly right
                      {
                        start: [width / 2 - offset, 0, -(depth / 2 - offset)],
                        end: [-(width / 2 - offset), 0, -(depth / 2 - offset)],
                        rotation: [Math.PI / 2, 0, Math.PI / 2],
                      }, // Mostly left
                    ].map((cyl, cylIndex) => (
                      <mesh
                        key={`ring-vert-${cylIndex}`}
                        position={[
                          (cyl.start[0] + cyl.end[0]) / 2,
                          0,
                          (cyl.start[2] + cyl.end[2]) / 2,
                        ]}
                        rotation={cyl.rotation}
                      >
                        <cylinderGeometry
                          args={[
                            ringCylinderRadius,
                            ringCylinderRadius,
                            ringCylinderWidth,
                            32,
                          ]}
                        />
                        <meshStandardMaterial color="gold" />
                      </mesh>
                    ))}
                  </group>
                );
              })}
            </group>
            <group>
              {/* Render column cylinders (two side by side) */}
              {beam.columns?.map((col, colIndex) => {
                // Determine column dimension based on axis
                const columnDimension =
                  wallStore.additionalBeams.axis === "x"
                    ? col.width || 0.23 // Default to beam width if col.width is undefined
                    : col.length || 0.6; // Default to beam depth if col.length is undefined

                // Calculate distances to previous and next columns
                const prevCoord =
                  colIndex > 0
                    ? wallStore.additionalBeams.axis === "x"
                      ? beam.columns[colIndex - 1].centerX
                      : beam.columns[colIndex - 1].centerZ
                    : null;
                const nextCoord =
                  colIndex < beam.columns.length - 1
                    ? wallStore.additionalBeams.axis === "x"
                      ? beam.columns[colIndex + 1].centerX
                      : beam.columns[colIndex + 1].centerZ
                    : null;
                const currentCoord =
                  wallStore.additionalBeams.axis === "x"
                    ? col.centerX
                    : col.centerZ;

                const distToPrev =
                  prevCoord !== null ? Math.abs(currentCoord - prevCoord) : 0;
                const distToNext =
                  nextCoord !== null ? Math.abs(currentCoord - nextCoord) : 0;

                // Calculate column cylinder length
                const cylinderLength =
                  0.25 * distToPrev + columnDimension + 0.25 * distToNext;

                // Calculate center offset for column cylinders
                const centerOffset =
                  (0.25 * distToNext - 0.25 * distToPrev) / 2;

                // Determine position and rotation for column cylinders
                const isXAxis = wallStore.additionalBeams.axis === "x";
                const sideOffset = 0.02; // Offset for side-by-side cylinders
                const columnPositions = isXAxis
                  ? [
                      // First column cylinder
                      [
                        col.centerX,
                        configStore.shed3D.heights.GROUND_BEAM + 0.5,
                        col.centerZ - sideOffset, // Offset left
                      ],
                      // Second column cylinder
                      [
                        col.centerX,
                        configStore.shed3D.heights.GROUND_BEAM + 0.5,
                        col.centerZ + sideOffset, // Offset right
                      ],
                    ]
                  : [
                      // First column cylinder
                      [
                        col.centerX - sideOffset, // Offset left
                        configStore.shed3D.heights.GROUND_BEAM + 0.5,
                        col.centerZ + centerOffset,
                      ],
                      // Second column cylinder
                      [
                        col.centerX + sideOffset, // Offset right
                        configStore.shed3D.heights.GROUND_BEAM + 0.5,
                        col.centerZ + centerOffset,
                      ],
                    ];
                const columnRotation = isXAxis
                  ? [Math.PI / 2, 0, Math.PI / 2]
                  : [Math.PI / 2, 0, 0];

                return columnPositions.map((pos, i) => (
                  <mesh
                    key={`column-cylinder-${colIndex}-${i}`}
                    position={pos}
                    rotation={columnRotation}
                  >
                    <cylinderGeometry
                      args={[0.008, 0.008, cylinderLength, 32]} // Dynamic length
                    />
                    <meshStandardMaterial color="red" />{" "}
                    {/* Distinct color for visibility */}
                  </mesh>
                ));
              })}
              {/* Render bars between adjacent columns (two side by side) */}
              {beam.columns?.slice(0, -1).map((col, colIndex) => {
                const nextCol = beam.columns[colIndex + 1];
                const isXAxis = wallStore.additionalBeams.axis === "x";

                // Calculate distance and midpoint between columns
                const distance = isXAxis
                  ? Math.abs(col.centerX - nextCol.centerX)
                  : Math.abs(col.centerZ - nextCol.centerZ);
                const barLength = 0.7 * distance;
                const midpoint = isXAxis
                  ? (col.centerX + nextCol.centerX) / 2
                  : (col.centerZ + nextCol.centerZ) / 2;

                // Calculate column cylinder length for y-position (x-axis beams)
                const columnDimension = isXAxis
                  ? col.width || 0.23
                  : col.length || 0.6;
                const prevCoord =
                  colIndex > 0
                    ? isXAxis
                      ? beam.columns[colIndex - 1].centerX
                      : beam.columns[colIndex - 1].centerZ
                    : null;
                const nextCoord =
                  colIndex < beam.columns.length - 1
                    ? isXAxis
                      ? beam.columns[colIndex + 1].centerX
                      : beam.columns[colIndex + 1].centerZ
                    : null;
                const currentCoord = isXAxis ? col.centerX : col.centerZ;
                const distToPrev =
                  prevCoord !== null ? Math.abs(currentCoord - prevCoord) : 0;
                const distToNext =
                  nextCoord !== null ? Math.abs(currentCoord - nextCoord) : 0;
                const cylinderLength =
                  0.25 * distToPrev + columnDimension + 0.25 * distToNext;
                const centerOffset =
                  (0.25 * distToNext - 0.25 * distToPrev) / 2;

                // Determine position and rotation for bars
                const sideOffset = 0.02; // Same offset as column cylinders
                const barPositions = isXAxis
                  ? [
                      // First bar
                      [
                        midpoint,
                        configStore.shed3D.heights.GROUND_BEAM + 0.1,
                        col.centerZ - sideOffset, // Offset left
                      ],
                      // Second bar
                      [
                        midpoint,
                        configStore.shed3D.heights.GROUND_BEAM + 0.1,
                        col.centerZ + sideOffset, // Offset right
                      ],
                    ]
                  : [
                      // First bar
                      [
                        col.centerX - sideOffset, // Offset left
                        configStore.shed3D.heights.GROUND_BEAM + 0.1,
                        midpoint,
                      ],
                      // Second bar
                      [
                        col.centerX + sideOffset, // Offset right
                        configStore.shed3D.heights.GROUND_BEAM + 0.1,
                        midpoint,
                      ],
                    ];
                const barRotation = rotation;

                return barPositions.map((pos, i) => (
                  <mesh
                    key={`bar-cylinder-${colIndex}-${i}`}
                    position={pos}
                    rotation={barRotation}
                  >
                    <cylinderGeometry
                      args={[0.008, 0.008, barLength, 32]} // Dynamic bar length
                    />
                    <meshStandardMaterial color="red" />{" "}
                    {/* Same color as column cylinders */}
                  </mesh>
                ));
              })}
            </group>
          </group>
        );
      })}
    </>
  );
});

export default AdditionalBeamRenderer;
