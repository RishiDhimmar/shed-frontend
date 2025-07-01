import React, { useMemo, useState, useRef } from "react";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { toJS } from "mobx";
import configStore from "../../stores/ConfigStore";
import { observer } from "mobx-react-lite";
import {
  CylinderGeometry,
  MeshBasicMaterial,
  Mesh,
  LineSegments,
  EdgesGeometry,
  LineBasicMaterial,
  BoxGeometry,
} from "three";
import BoxRenderer from "./Box";
import RingRenderer from "./RingRenderer";

const MullionColumnRenderer = observer(
  ({ centerOffset, scale, camera, renderer }) => {
    const [shutterStates, setShutterStates] = useState([]);
    const windowRefs = useRef([]);

    const { columnInstances, cylinderInstances, windowInstances } =
      useMemo(() => {
        const columnInstances = [];
        const cylinderInstances = [];
        const windowInstances = [];
        let shutterFlag = true;

        mullionColumnStore.polygons.forEach((mc, index) => {
          let rawPoints = mc.points || [];
          const cleanedPoints = rawPoints;

          const points = cleanedPoints.map((p) => ({
            x: -(p.x / 1000 - centerOffset[0]) * scale,
            z: -(p.y / 1000 - centerOffset[2]) * scale,
          }));

          if (points.length !== 4) {
            console.warn("Invalid mullion column points", toJS(mc));
            return;
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
          const height = configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT;

          columnInstances.push({
            width,
            length,
            height,
            position: [
              centerX,
              configStore.shed3D.heights.COLUMNS + height / 2,
              centerZ,
            ],
            color: "red",
          });

          const offset = 0.04;
          const halfWidth = width / 2;
          const halfLength = length / 2;

          const corners = [
            {
              x: centerX + halfWidth - offset,
              z: centerZ + halfLength - offset,
            },
            {
              x: centerX + halfWidth - offset,
              z: centerZ - halfLength + offset,
            },
            {
              x: centerX - halfWidth + offset,
              z: centerZ + halfLength - offset,
            },
            {
              x: centerX - halfWidth + offset,
              z: centerZ - halfLength + offset,
            },
          ];

          corners.forEach((corner) => {
            cylinderInstances.push({
              position: [
                corner.x,
                configStore.shed3D.heights.COLUMNS + height / 2,
                corner.z,
              ],
              height,
              radius: 0.08,
            });
          });

          if (index + 1 < mullionColumnStore.polygons.length) {
            const nextMc = mullionColumnStore.polygons[index + 1];
            const nextPoints = nextMc.points.map((p) => ({
              x: -(p.x / 1000 - centerOffset[0]) * scale,
              z: -(p.y / 1000 - centerOffset[2]) * scale,
            }));

            if (nextPoints.length === 4) {
              const nextXs = nextPoints.map((p) => p.x);
              const nextZs = nextPoints.map((p) => p.z);
              const nextMinX = Math.min(...nextXs);
              const nextMaxX = Math.max(...nextXs);
              const nextMinZ = Math.min(...nextZs);
              const nextMaxZ = Math.max(...nextZs);
              const nextWidth = nextMaxX - nextMinX;
              const nextLength = nextMaxZ - nextMinZ;
              const nextCenterX = (nextMinX + nextMaxX) / 2;
              const nextCenterZ = (nextMinZ + nextMaxZ) / 2;

              const dx = nextCenterX - centerX;
              const dz = nextCenterZ - centerZ;
              const distance = Math.sqrt(dx * dx + dz * dz);
              const directionX = dx / distance;
              const directionZ = dz / distance;

              const windowWidth = 1.524; // 5ft
              const windowHeight = 1.524; // 5ft
              const shutterWidth = 3;
              const shutterHeight = 4.5;
              const windowThickness = Math.min(
                width,
                nextWidth,
                length,
                nextLength
              );

              const windowX = (centerX + nextCenterX) / 2;
              const windowZ = (centerZ + nextCenterZ) / 2;

              const rotationY = Math.atan2(directionX, directionZ);

              if (shutterFlag && directionX > 0) {
                shutterFlag = false;
                windowInstances.push({
                  width: shutterWidth,
                  height: shutterHeight,
                  thickness: windowThickness,
                  position: [
                    windowX,
                    configStore.shed3D.heights.PLINTH -
                      0.15 / 2 +
                      shutterHeight / 2,
                    windowZ,
                  ],
                  rotation: [
                    directionX > 0 ? 0 : Math.PI,
                    rotationY + Math.PI / 2,
                    0,
                  ],
                  isShutter: true,
                });
              } else {
                windowInstances.push({
                  width: windowWidth,
                  height: windowHeight,
                  thickness: windowThickness,
                  position: [
                    windowX,
                    configStore.shed3D.heights.PLINTH + 0.9 + windowHeight / 2,
                    windowZ,
                  ],
                  rotation: [
                    directionX > 0 ? 0 : Math.PI,
                    rotationY + Math.PI / 2,
                    0,
                  ],
                  isShutter: false,
                });
              }
            }
          } else if (mullionColumnStore.polygons.length > 1) {
            const nextMc = mullionColumnStore.polygons[0];
            const nextPoints = nextMc.points.map((p) => ({
              x: -(p.x / 1000 - centerOffset[0]) * scale,
              z: -(p.y / 1000 - centerOffset[2]) * scale,
            }));

            if (nextPoints.length === 4) {
              const nextXs = nextPoints.map((p) => p.x);
              const nextZs = nextPoints.map((p) => p.z);
              const nextMinX = Math.min(...nextXs);
              const nextMaxX = Math.max(...nextXs);
              const nextMinZ = Math.min(...nextZs);
              const nextMaxZ = Math.max(...nextZs);
              const nextWidth = nextMaxX - nextMinX;
              const nextLength = nextMaxZ - nextMinZ;
              const nextCenterX = (nextMinX + nextMaxX) / 2;
              const nextCenterZ = (nextMinZ + nextMaxZ) / 2;

              const dx = nextCenterX - centerX;
              const dz = nextCenterZ - centerZ;
              const distance = Math.sqrt(dx * dx + dz * dz);
              const directionX = dx / distance;
              const directionZ = dz / distance;

              const windowWidth = 1.524; // 5ft
              const windowHeight = 1.524; // 5ft
              const windowThickness = Math.min(
                width,
                nextWidth,
                length,
                nextLength
              );

              const windowX = (centerX + nextCenterX) / 2;
              const windowZ = (centerZ + nextCenterZ) / 2;

              const rotationY = Math.atan2(directionX, directionZ);

              windowInstances.push({
                width: windowWidth,
                height: windowHeight,
                thickness: windowThickness,
                position: [
                  windowX,
                  configStore.shed3D.heights.PLINTH + 0.9 + windowHeight / 2,
                  windowZ,
                ],
                rotation: [
                  directionX > 0 ? 0 : Math.PI,
                  rotationY + Math.PI / 2,
                  0,
                ],
                isShutter: false,
              });
            }
          }
        });

        // Initialize shutter states if not already set
        if (shutterStates.length !== windowInstances.length) {
          setShutterStates(() => windowInstances.map((w) => w.isShutter));
        }

        return { columnInstances, cylinderInstances, windowInstances };
      }, [
        mullionColumnStore.polygons,
        centerOffset,
        scale,
        configStore.shed3D.heights.COLUMNS,
        configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
      ]);

    const cylinderGeometry = useMemo(
      () => new CylinderGeometry(0.008, 0.008, 1, 16),
      []
    );
    const cylinderMaterial = useMemo(
      () =>
        new MeshBasicMaterial({
          color: "red",
          transparent: true,
          opacity: 0.5,
        }),
      []
    );

    const glassMaterial = useMemo(
      () =>
        new MeshBasicMaterial({
          color: "transparent",
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        }),
      []
    );

    const outlineMaterial = useMemo(
      () =>
        new LineBasicMaterial({
          color: "black",
          linewidth: 2,
        }),
      []
    );

    const windowGeometry = useMemo(() => new BoxGeometry(1.524, 1.524, 1), []);
    const shutterGeometry = useMemo(() => new BoxGeometry(3, 4.5, 1), []);

    const windowEdgesGeometry = useMemo(
      () => new EdgesGeometry(windowGeometry),
      [windowGeometry]
    );
    const shutterEdgesGeometry = useMemo(
      () => new EdgesGeometry(shutterGeometry),
      [shutterGeometry]
    );

    const shutterAndWindowCount = useMemo(() => {
      let shutters = 0;
      let windows = 0;
      shutterStates.forEach((isShutter) => {
        if (isShutter) shutters += 1;
        else windows += 1;
      });
      mullionColumnStore.setShutters(shutters);
      mullionColumnStore.setWindows(windows);
      return { shutters, windows };
    }, [shutterStates]);

    const handleWindowClick = (index, event) => {
      event.stopPropagation();
      const confirmShutter = window.confirm("Should this window be a shutter?");
      if (confirmShutter !== null) {
        setShutterStates((prev) => {
          const newStates = [...prev];
          newStates[index] = confirmShutter;
          return newStates;
        });
      }
    };

    return (
      <>
        <BoxRenderer instances={columnInstances} opacity={0.5} />
        <RingRenderer
          columns={mullionColumnStore.polygons}
          centerOffset={centerOffset}
          cornerOffset={0.03}
          rodDiameter={configStore.RINGS.MULLION_COLUMNS.diameter}
          yInterval={configStore.RINGS.MULLION_COLUMNS.gap}
          color="red"
          floorY={configStore.shed3D.heights.COLUMNS}
          height={configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT}
          opacity={1}
        />
        {cylinderInstances.map((cylinder, index) => (
          <mesh
            key={`cylinder-${index}`}
            position={cylinder.position}
            geometry={cylinderGeometry}
            material={cylinderMaterial}
            scale={[1, cylinder.height, 1]}
          />
        ))}
        {windowInstances.map((window, index) => {
          const isShutter = shutterStates[index];
          const yPosition = isShutter
            ? configStore.shed3D.heights.PLINTH - 0.15 / 2 + 4.5 / 2
            : configStore.shed3D.heights.PLINTH + 0.9 + 1.524 / 2;

          return (
            <group
              key={`window-group-${index}`}
              position={[window.position[0], yPosition, window.position[2]]}
              rotation={window.rotation}
              ref={(el) => (windowRefs.current[index] = el)}
              onClick={(e) => handleWindowClick(index, e)}
            >
              <mesh
                scale={[1, 1, window.thickness / (isShutter ? 1 : 1.524)]}
                geometry={isShutter ? shutterGeometry : windowGeometry}
              >
                <meshBasicMaterial {...glassMaterial} />
              </mesh>
              <lineSegments
                geometry={
                  isShutter ? shutterEdgesGeometry : windowEdgesGeometry
                }
                material={outlineMaterial}
                scale={[1, 1, window.thickness / (isShutter ? 1 : 1.524)]}
              />
            </group>
          );
        })}
      </>
    );
  }
);

export default MullionColumnRenderer;
