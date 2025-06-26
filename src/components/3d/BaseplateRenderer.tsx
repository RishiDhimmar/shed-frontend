// import React, { useMemo } from "react";
// import { toJS } from "mobx";
// import { observer } from "mobx-react-lite";
// import baseplateStore from "../../stores/BasePlateStore";
// import BoxRenderer from "./Box"; // Use the same BoxRenderer for consistency
// import { removeDuplicatePoints } from "../../utils/PolygonUtils";
// import { MeshBasicMaterial } from "three";
// import configStore from "../../stores/ConfigStore";

// const BASEPLATE_HEIGHT = 0.0075; // small extrusion height for baseplates

// const BaseplateRenderer = observer(({ centerOffset = [0, 0], scale = 1 }) => {
//   const instances = useMemo(() => {
//     return baseplateStore.basePlates
//       .map((baseplate) => {
//         let rawPoints = baseplate.points || [];
//         const cleanedPoints = removeDuplicatePoints(rawPoints);

//         const points = cleanedPoints.map((p) => ({
//           x: -(p.x / 1000 - centerOffset[0]) * scale,
//           z: -(p.y / 1000 - centerOffset[2]) * scale,
//         }));

//         if (points.length !== 4) {
//           console.warn("Invalid baseplate points", toJS(baseplate));
//           return null;
//         }

//         const xs = points.map((p) => p.x);
//         const zs = points.map((p) => p.z);

//         const minX = Math.min(...xs);
//         const maxX = Math.max(...xs);
//         const minZ = Math.min(...zs);
//         const maxZ = Math.max(...zs);

//         const width = maxX - minX;
//         const length = maxZ - minZ;
//         const centerX = (minX + maxX) / 2;
//         const centerZ = (minZ + maxZ) / 2;

//         return {
//           width,
//           length,
//           height: BASEPLATE_HEIGHT,
//           position: [
//             centerX,
//             configStore.shed3D.heights.COLUMNS + BASEPLATE_HEIGHT + 0.075 ,
//             centerZ,
//           ],
//           color: "green",
//         };
//       })
//       .filter(Boolean);
//   }, [baseplateStore.basePlates, centerOffset, configStore.shed3D.heights.COLUMNS]);

//   return (
//     <>
//       <BoxRenderer instances={instances} opacity={1} />
//     </>
//   );
// });

// export default BaseplateRenderer;

import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import baseplateStore from "../../stores/BasePlateStore";
import configStore from "../../stores/ConfigStore";
import { removeDuplicatePoints } from "../../utils/PolygonUtils";
import { toJS } from "mobx";

const BASEPLATE_HEIGHT = 0.0075;
const VERTICAL_BOX_HEIGHT = 6.0;
const VERTICAL_BOX_WIDTH = 0.45;
const VERTICAL_BOX_DEPTH = 0.15;

const BaseplateRenderer = observer(
  ({ centerOffset = [0, 0, 0], scale = 1 }) => {
    const baseplates = useMemo(() => {
      return baseplateStore.cornerBasePlates.concat(
        baseplateStore.edgeBasePlates.filter(
          (p) => p.hits[0].direction !== "+y" && p.hits[0].direction !== "-y"
        )
      );
    }, [baseplateStore.cornerBasePlates, baseplateStore.edgeBasePlates]);

    const { baseplateMeshes, verticalBoxes, verticalBoxOutlines, topCenters } =
      useMemo(() => {
        const baseplateMeshes: JSX.Element[] = [];
        const verticalBoxes: JSX.Element[] = [];
        const verticalBoxOutlines: JSX.Element[] = []; // New array for outlines
        const topCenters: { id: string; pos: THREE.Vector3 }[] = [];

        baseplates.forEach((bp, idx) => {
          console.log(toJS(bp));
          const raw = bp.points || [];
          const points = removeDuplicatePoints(raw);
          if (points.length < 3) return;

          const shape = new THREE.Shape();
          points.forEach((p, i) => {
            const x = -(p.x / 1000 - centerOffset[0]) * scale;
            const z = -(p.y / 1000 - centerOffset[2]) * scale;
            if (i === 0) shape.moveTo(x, z);
            else shape.lineTo(x, z);
          });
          shape.closePath();

          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: BASEPLATE_HEIGHT,
            bevelEnabled: false,
          });

          geometry.rotateX(-Math.PI / 2);
          const baseplateY =
            configStore.shed3D.heights.COLUMNS + BASEPLATE_HEIGHT + 0.075;
          geometry.translate(0, baseplateY, 0);

          const baseplateMaterial = new THREE.MeshBasicMaterial({
            color: "green",
          });
          baseplateMeshes.push(
            <mesh
              key={`bp-${idx}`}
              geometry={geometry}
              material={baseplateMaterial}
            />
          );

          const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
          const center = bbox.getCenter(new THREE.Vector3());
          const topCenter = new THREE.Vector3(center.x, bbox.max.y, center.z);
          topCenters.push({ id: bp.id, pos: topCenter });

          const verticalBoxGeometry = new THREE.BoxGeometry(
            VERTICAL_BOX_WIDTH,
            VERTICAL_BOX_HEIGHT,
            VERTICAL_BOX_DEPTH
          );
          const verticalBoxMaterial = new THREE.MeshBasicMaterial({
            color: "gray",
            depthTest: false,
            depthWrite: false,
            transparent: true,
          });
          const verticalBoxPosition = new THREE.Vector3(
            center.x,
            bbox.max.y + VERTICAL_BOX_HEIGHT / 2,
            center.z
          );

          verticalBoxes.push(
            <mesh
              key={`vertical-${idx}`}
              geometry={verticalBoxGeometry}
              material={verticalBoxMaterial}
              position={verticalBoxPosition}
            />
          );

          // Add outline for vertical box
          const edgesGeometry = new THREE.EdgesGeometry(verticalBoxGeometry);
          const outlineMaterial = new THREE.LineBasicMaterial({
            color: "black", // Outline color
            linewidth: 2,
          });
          verticalBoxOutlines.push(
            <lineSegments
              key={`vertical-outline-${idx}`}
              geometry={edgesGeometry}
              material={outlineMaterial}
              position={verticalBoxPosition}
              renderOrder={1000} // Ensure outlines render on top
            />
          );
        });

        return {
          baseplateMeshes,
          verticalBoxes,
          verticalBoxOutlines,
          topCenters,
        };
      }, [baseplates, centerOffset, scale, configStore.shed3D.heights.COLUMNS]);

    const { connectors, connectorOutlines } = useMemo(() => {
      const connectorMeshes: JSX.Element[] = [];
      const connectorOutlines: JSX.Element[] = [];
      const LEG_ANGLE = (-171 * Math.PI) / 180; // Convert 171 degrees to radians
      const legBaseLength = 0.5; // Arbitrary length for leg projection
      const halfAngle = (Math.PI - LEG_ANGLE) / 2; // Angle between vertical and each leg
      const heightOffset = legBaseLength * Math.cos(halfAngle); // Define heightOffset
      const lateralOffset = legBaseLength * Math.sin(halfAngle); // Define lateralOffset

      for (let i = 0; i < topCenters.length; i++) {
        const from = topCenters[i];
        const ray = new THREE.Ray(from.pos, new THREE.Vector3(1, 0, 0));

        let closest: { id: string; pos: THREE.Vector3 } | null = null;
        let minDistance = Infinity;

        for (let j = 0; j < topCenters.length; j++) {
          if (i === j) continue;
          const to = topCenters[j];

          const delta = new THREE.Vector3().subVectors(to.pos, from.pos);
          const projected = delta.dot(ray.direction);

          if (
            projected > 0 &&
            projected < minDistance &&
            Math.abs(delta.z) < 0.01
          ) {
            minDistance = projected;
            closest = to;
          }
        }

        if (closest) {
          const fromPos = from.pos;
          const toPos = closest.pos;
          const midPoint = new THREE.Vector3()
            .addVectors(fromPos, toPos)
            .multiplyScalar(0.5);
          const length = fromPos.distanceTo(toPos);

          const connectorGeometry = new THREE.BoxGeometry(length, 0.45, 0.15);
          const connectorMaterial = new THREE.MeshBasicMaterial({
            color: "gray",
            depthTest: false,
            depthWrite: false,
            transparent: true,
          });
          const direction = new THREE.Vector3()
            .subVectors(toPos, fromPos)
            .normalize();
          const quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(1, 0, 0),
            direction
          );

          const raisedMid = midPoint.clone();
          raisedMid.y += VERTICAL_BOX_HEIGHT;

          // === V LEG 1 ===
          const leg1Start = fromPos
            .clone()
            .add(new THREE.Vector3(0, VERTICAL_BOX_HEIGHT, 0));
          const leg1End = raisedMid
            .clone()
            .sub(direction.clone().multiplyScalar(lateralOffset))
            .sub(new THREE.Vector3(0, heightOffset, 0));

          const leg1Vec = new THREE.Vector3().subVectors(leg1End, leg1Start);
          const leg1Length = leg1Vec.length();
          const leg1Mid = new THREE.Vector3()
            .addVectors(leg1Start, leg1End)
            .multiplyScalar(0.5);
          const leg1Quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            leg1Vec.clone().normalize()
          );

          const leg1Geometry = new THREE.BoxGeometry(
            VERTICAL_BOX_WIDTH,
            leg1Length + 0.3,
            VERTICAL_BOX_DEPTH
          );
          connectorMeshes.push(
            <mesh
              key={`vleg-from-${from.id}-${closest.id}`}
              geometry={leg1Geometry}
              material={connectorMaterial}
              position={[leg1Mid.x, leg1Mid.y - 0.19, leg1Mid.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              quaternion={leg1Quat}
              renderOrder={1000}
            />
          );

          // Add outline for V leg 1
          const leg1Edges = new THREE.EdgesGeometry(leg1Geometry);
          connectorOutlines.push(
            <lineSegments
              key={`vleg-from-outline-${from.id}-${closest.id}`}
              geometry={leg1Edges}
              material={
                new THREE.LineBasicMaterial({
                  color: "black",
                  linewidth: 2,
                })
              }
              position={[leg1Mid.x, leg1Mid.y - 0.19, leg1Mid.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              quaternion={leg1Quat}
              renderOrder={1001}
            />
          );

          // === V LEG 2 ===
          const leg2Start = toPos
            .clone()
            .add(new THREE.Vector3(0, VERTICAL_BOX_HEIGHT, 0));
          const leg2End = raisedMid
            .clone()
            .add(direction.clone().multiplyScalar(lateralOffset))
            .sub(new THREE.Vector3(0, heightOffset, 0));

          const leg2Vec = new THREE.Vector3().subVectors(leg2End, leg2Start);
          const leg2Length = leg2Vec.length();
          const leg2Mid = new THREE.Vector3()
            .addVectors(leg2Start, leg2End)
            .multiplyScalar(0.5);
          const leg2Quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            leg2Vec.clone().normalize()
          );

          const leg2Geometry = new THREE.BoxGeometry(
            VERTICAL_BOX_WIDTH,
            leg2Length + 0.3,
            VERTICAL_BOX_DEPTH
          );
          connectorMeshes.push(
            <mesh
              key={`vleg-to-${from.id}-${closest.id}`}
              geometry={leg2Geometry}
              material={connectorMaterial}
              position={[leg2Mid.x, leg2Mid.y - 0.19, leg2Mid.z]}
              rotation={[Math.PI, 0, 0]}
              quaternion={leg2Quat}
              renderOrder={10}
            />
          );

          // Add outline for V leg 2
          const leg2Edges = new THREE.EdgesGeometry(leg2Geometry);
          connectorOutlines.push(
            <lineSegments
              key={`vleg-to-outline-${from.id}-${closest.id}`}
              geometry={leg2Edges}
              material={
                new THREE.LineBasicMaterial({
                  color: "black",
                  linewidth: 2,
                })
              }
              position={[leg2Mid.x, leg2Mid.y - 0.19, leg2Mid.z]}
              rotation={[Math.PI, 0, 0]}
              quaternion={leg2Quat}
              renderOrder={1001}
            />
          );
        }
      }

      return { connectors: connectorMeshes, connectorOutlines };
    }, [topCenters]);

    return (
      <>
        <group>{baseplateMeshes}</group>
        <group>{verticalBoxes}</group>
        <group>{verticalBoxOutlines}</group>
        <group>{connectors}</group>
        <group>{connectorOutlines}</group>
      </>
    );
  }
);

export default BaseplateRenderer;
