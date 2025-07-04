import { JSX } from "react";
import { observer } from "mobx-react-lite";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import wallStore from "../../stores/WallStore";
import configStore from "../../stores/ConfigStore";

// Wrap the component with observer to react to MobX changes
const AdditionalBeamRenderer = observer((): JSX.Element => {
  const { scene } = useThree();

  // Access the beamLines array from wallStore
  const beams = wallStore.additionalBeams.beamLines;

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

        // Log beam length for debugging
        console.log(`Beam ${index} length: ${length}`);

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

        // Create a quaternion to rotate the box, corner cylinders, and ring cylinders
        const quaternion = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0); // Default up direction
        quaternion.setFromUnitVectors(up, direction);

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
        const rotation =
          wallStore.additionalBeams.axis === "x"
            ? [Math.PI / 2, 0, Math.PI / 2]
            : [Math.PI / 2, 0, 0];

        return (
          <group
            key={index}
            position={[
              position.x,
              configStore.shed3D.heights.GROUND_BEAM +
                configStore.shed3D.heights.GB_Z_HEIGHT / 2,
              position.z,
            ]}
            quaternion={quaternion}
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
                key={`corner-cylinder-${cylIndex}`}
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
              // Calculate offset along the beam's length (Y-axis in local space after quaternion)
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
                    }, // Right
                    {
                      start: [width / 2 - offset, 0, -(depth / 2 - offset)],
                      end: [-(width / 2 - offset), 0, -(depth / 2 - offset)],
                      rotation: [Math.PI / 2, 0, Math.PI / 2],
                    }, // Left
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
        );
      })}
    </>
  );
});

export default AdditionalBeamRenderer;
