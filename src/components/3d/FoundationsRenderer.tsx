// import { toJS } from "mobx";
// import foundationStore from "../../stores/FoundationStore";
// import FrustumMesh from "./FrustumMesh";
// import RCCRenderer from "./RCCRenderer";
// import { Shed3DConfig } from "../../Constants";
// import * as THREE from "three";
// import React, { useMemo } from "react";
// import configStore from "../../stores/ConfigStore";
// import { observer } from "mobx-react-lite";
// import { Cylinder } from "@react-three/drei";
// import AnyShapeRenderer from "./AnyShapeExtrudeRenderer";
// import uiStore from "../../stores/UIStore";

// const scale = 1;

// const FoundationsRenderer = observer(({ centerOffset }) => {
//   const [offsetX, , offsetZ] = centerOffset;
//   const foundations = useMemo(
//     () => toJS(foundationStore.foundations),
//     [foundationStore.foundations]
//   );

//   return foundations.map((f, i) => {
//     const transformPoints = (points) =>
//       (points || []).map((p) => ({
//         x: -(p.x / 1000 - offsetX) * scale,
//         y: -(p.y / 1000 - offsetZ) * scale,
//       }));

//     const outerPoints = transformPoints(f.outerFoundationPoints);
//     const excavationBottomPoints = transformPoints(f.excavationBottomPoints);
//     const innerPoints = transformPoints(f.innerFoundationPoints);

//     // Prepare instanced mesh for pileLines specific to this foundation
//     const pileLinesMesh = useMemo(() => {
//       if (!f.pileLines || f.pileLines.length === 0) return null;

//       console.log(`pileLines for foundation ${i}:`, f.pileLines);

//       const radius = 0.008;
//       const verticalHeight = 2;
//       const cylinderGeometry = new THREE.CylinderGeometry(
//         radius,
//         radius,
//         verticalHeight,
//         8
//       );
//       const material = new THREE.MeshBasicMaterial({
//         color: "blue",
//         transparent: true,
//         depthWrite: false,
//         depthTest: false,
//       });

//       const instancedMesh = new THREE.InstancedMesh(
//         cylinderGeometry,
//         material,
//         f.pileLines.length
//       );

//       f.pileLines.forEach((pileLine, index) => {
//         const { x, y } = pileLine;
//         const matrix = new THREE.Matrix4();
//         matrix.setPosition(
//           new THREE.Vector3(
//             -(x / 1000 - offsetX) * scale,
//             -verticalHeight / 2 - 0.2,
//             -(y / 1000 - offsetZ) * scale
//           )
//         );
//         instancedMesh.setMatrixAt(index, matrix);
//       });

//       instancedMesh.instanceMatrix.needsUpdate = true;
//       return instancedMesh;
//     }, [f.pileLines, offsetX, offsetZ]);

//     return (
//       <React.Fragment key={i}>
//         {uiStore.visibility.excavation && (
//           <AnyShapeRenderer
//             bottomPoints={excavationBottomPoints}
//             height={2.1}
//             y={-configStore.shed3D.heights.GROUND_BEAM / 4}
//             color="brown"
//           />
//         )}
//         {f.type === "Flat Foundation" && (
//           <RCCRenderer
//             bottomPoints={outerPoints}
//             height={
//               configStore.shed3D.heights.RCC +
//               configStore.shed3D.heights.FRUSTUM
//             }
//           />
//         )}
//         {f.type === "Pile Foundation" && (
//           <>
//             <AnyShapeRenderer
//               bottomPoints={outerPoints}
//               height={configStore.shed3D.heights.FRUSTUM}
//             />
//             {f.pileDetails.map((p, j) => (
//               <mesh
//                 position={[-(p.x / 1000 - offsetX) * scale, -1.2, -(p.y / 1000 - offsetZ) * scale]}
//                 key={j}
//                 renderOrder={1}
//               >
//                 <cylinderGeometry
//                   args={[
//                     p.radius / 1000,
//                     p.radius / 1000,
//                     2,
//                     p.segments || 32,
//                     p.heightSegments || 1,
//                     p.closed || false,
//                   ]}
//                 />
//                 <meshBasicMaterial
//                   color="magenta"
//                   opacity={0.5}
//                   transparent={true}
//                   depthWrite={false}
//                   depthTest={false}
//                 />
//               </mesh>
//             ))}
//           </>
//         )}
//         {!f.type && (
//           <>
//             <FrustumMesh
//               bottomPoints={outerPoints}
//               topPoints={innerPoints}
//               floorY={configStore.shed3D.heights.RCC}
//               opacity={0.5}
//               yDepth={configStore.shed3D.heights.FRUSTUM}
//             />
//             <RCCRenderer bottomPoints={outerPoints} />
//           </>
//         )}
//         {pileLinesMesh && <primitive object={pileLinesMesh} />}
//         {(f.rodData || []).map((rod, rodIndex) => {
//           const { line1, line2, isHorizontal } = rod;

//           const wireLength = Math.abs(
//             (isHorizontal ? line1[2] - line1[0] : line1[3] - line1[1]) / 1000
//           );

//           const radius = 0.01 * scale;
//           const verticalHeight = 0.075 * scale;

//           const cylinderGeometry = new THREE.CylinderGeometry(
//             radius,
//             radius,
//             wireLength,
//             8
//           );
//           const verticalGeometry = new THREE.CylinderGeometry(
//             radius,
//             radius,
//             verticalHeight,
//             8
//           );

//           const px = -((line1[0] + line1[2]) / 2 / 1000 - offsetX) * scale;
//           const pz = -((line1[1] + line1[3]) / 2 / 1000 - offsetZ) * scale;
//           const py = Shed3DConfig.heights.RCC / 2 - 0.01;

//           const createVerticalRod = (x, z, key) => (
//             <mesh
//               key={key}
//               geometry={verticalGeometry}
//               position={[x, verticalHeight * 2, z + 0.001]}
//               rotation={[0, 0, 0]}
//               castShadow
//               receiveShadow
//             >
//               <meshBasicMaterial color="blue" />
//             </mesh>
//           );

//           return (
//             <React.Fragment key={rod}>
//               <mesh
//                 geometry={cylinderGeometry}
//                 position={[px, py, pz]}
//                 rotation={[0, isHorizontal ? 0 : -Math.PI / 2, Math.PI / 2]}
//                 castShadow
//                 receiveShadow
//               >
//                 <meshBasicMaterial color="blue" depthWrite={false} />
//               </mesh>
//               {createVerticalRod(
//                 -((line1[0] + line2[0]) / 2 / 1000 - offsetX) * scale,
//                 -((line1[1] + line2[1]) / 2 / 1000 - offsetZ) * scale,
//                 `${rodIndex}-v1`
//               )}
//               {createVerticalRod(
//                 -((line1[2] + line2[2]) / 2 / 1000 - offsetX) * scale,
//                 -((line1[3] + line2[3]) / 2 / 1000 - offsetZ) * scale,
//                 `${rodIndex}-v2`
//               )}
//             </React.Fragment>
//           );
//         })}
//       </React.Fragment>
//     );
//   });
// });

// export default FoundationsRenderer;

import { toJS } from "mobx";
import foundationStore from "../../stores/FoundationStore";
import FrustumMesh from "./FrustumMesh";
import RCCRenderer from "./RCCRenderer";
import { Shed3DConfig } from "../../Constants";
import * as THREE from "three";
import React, { useMemo } from "react";
import configStore from "../../stores/ConfigStore";
import { observer } from "mobx-react-lite";
import { Cylinder } from "@react-three/drei";
import AnyShapeRenderer from "./AnyShapeExtrudeRenderer";
import uiStore from "../../stores/UIStore";

const scale = 1;

const FoundationsRenderer = observer(({ centerOffset }) => {
  const [offsetX, , offsetZ] = centerOffset;
  const foundations = useMemo(
    () => toJS(foundationStore.foundations),
    [foundationStore.foundations]
  );

  return foundations.map((f, i) => {
    const transformPoints = (points) =>
      (points || []).map((p) => ({
        x: -(p.x / 1000 - offsetX) * scale,
        y: -(p.y / 1000 - offsetZ) * scale,
      }));

    const outerPoints = transformPoints(f.outerFoundationPoints);
    const excavationBottomPoints = transformPoints(f.excavationBottomPoints);
    const innerPoints = transformPoints(f.innerFoundationPoints);

    // Prepare instanced mesh for pileLines specific to this foundation
    const pileLinesMesh = useMemo(() => {
      if (!f.pileLines || f.pileLines.length === 0) return null;

      console.log(`pileLines for foundation ${i}:`, f.pileLines);

      const radius = 0.008;
      const verticalHeight = 2;
      const cylinderGeometry = new THREE.CylinderGeometry(
        radius,
        radius,
        verticalHeight,
        8
      );
      const material = new THREE.MeshBasicMaterial({
        color: "blue",
        opacity: 1,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

      const instancedMesh = new THREE.InstancedMesh(
        cylinderGeometry,
        material,
        f.pileLines.length
      );

      f.pileLines.forEach((pileLine, index) => {
        const { x, y } = pileLine;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(
          new THREE.Vector3(
            -(x / 1000 - offsetX) * scale,
            -verticalHeight / 2 - 0.2,
            -(y / 1000 - offsetZ) * scale
          )
        );
        instancedMesh.setMatrixAt(index, matrix);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      return instancedMesh;
    }, [f.pileLines, offsetX, offsetZ]);

    // Prepare instanced mesh for rings around piles
    const pileRingsMesh = useMemo(() => {
      if (!f.pileDetails || f.pileDetails.length === 0) return null;

      const ringRadius = 0.3; // Ring radius
      const tubeRadius = 0.008; // Ring thickness
      const verticalHeight = 2; // Same as pile cylinder height
      const spacing = 0.15; // Vertical spacing between rings

      // Calculate number of rings per pile
      const numRingsPerPile = Math.floor(verticalHeight / spacing) + 1; // Include top/bottom
      const totalRings = f.pileDetails.length * numRingsPerPile;

      const ringGeometry = new THREE.TorusGeometry(
        ringRadius,
        tubeRadius,
        8,
        32
      );
      const material = new THREE.MeshBasicMaterial({
        color: "blue",
        opacity: 1,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

      const instancedMesh = new THREE.InstancedMesh(
        ringGeometry,
        material,
        totalRings
      );

      let ringIndex = 0;
      f.pileDetails.forEach((pile) => {
        const pileX = -(pile.x / 1000 - offsetX) * scale;
        const pileZ = -(pile.y / 1000 - offsetZ) * scale;
        const baseY = -verticalHeight - 0.2; // Match pileLinesMesh base

        for (let j = 0; j < numRingsPerPile; j++) {
          const yOffset = baseY + j * spacing;
          const matrix = new THREE.Matrix4();
          matrix.makeRotationX(Math.PI / 2);
          matrix.setPosition(new THREE.Vector3(pileX, yOffset, pileZ));

          instancedMesh.setMatrixAt(ringIndex, matrix);
          ringIndex++;
        }
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      return instancedMesh;
    }, [f.pileDetails, offsetX, offsetZ]);

    return (
      <React.Fragment key={i}>
        <group visible={uiStore.visibility.excavation}>
          <AnyShapeRenderer
            bottomPoints={excavationBottomPoints}
            height={2.1}
            y={-configStore.shed3D.heights.GROUND_BEAM / 4}
            color="brown"
          />
        </group>
        <group visible={uiStore.visibility.foundation}>
          {f.type === "Flat Foundation" && (
            <RCCRenderer
              bottomPoints={outerPoints}
              height={
                configStore.shed3D.heights.RCC +
                configStore.shed3D.heights.FRUSTUM
              }
            />
          )}
          {f.type === "Pile Foundation" && (
            <>
              <AnyShapeRenderer
                bottomPoints={outerPoints}
                height={configStore.shed3D.heights.FRUSTUM}
              />
              {f.pileDetails.map((p, j) => (
                <mesh
                  position={[
                    -(p.x / 1000 - offsetX) * scale,
                    -1.2,
                    -(p.y / 1000 - offsetZ) * scale,
                  ]}
                  key={j}
                  renderOrder={1}
                >
                  <cylinderGeometry
                    args={[
                      p.radius / 1000,
                      p.radius / 1000,
                      2,
                      p.segments || 32,
                      p.heightSegments || 1,
                      p.closed || false,
                    ]}
                  />
                  <meshBasicMaterial
                    color="magenta"
                    opacity={0.5}
                    transparent={true}
                    depthWrite={false}
                    depthTest={false}
                  />
                </mesh>
              ))}
            </>
          )}
          {!f.type && (
            <>
              <FrustumMesh
                bottomPoints={outerPoints}
                topPoints={innerPoints}
                floorY={configStore.shed3D.heights.RCC}
                opacity={0.5}
                yDepth={configStore.shed3D.heights.FRUSTUM}
              />
              <RCCRenderer bottomPoints={outerPoints} />
            </>
          )}
          {pileLinesMesh && <primitive object={pileLinesMesh} />}
          {pileRingsMesh && <primitive object={pileRingsMesh} />}
          {(f.rodData || []).map((rod, rodIndex) => {
            const { line1, line2, isHorizontal } = rod;

            const wireLength = Math.abs(
              (isHorizontal ? line1[2] - line1[0] : line1[3] - line1[1]) / 1000
            );

            const radius = 0.01 * scale;
            const verticalHeight = 0.075 * scale;

            const cylinderGeometry = new THREE.CylinderGeometry(
              radius,
              radius,
              wireLength,
              8
            );
            const verticalGeometry = new THREE.CylinderGeometry(
              radius,
              radius,
              verticalHeight,
              8
            );

            const px = -((line1[0] + line1[2]) / 2 / 1000 - offsetX) * scale;
            const pz = -((line1[1] + line1[3]) / 2 / 1000 - offsetZ) * scale;
            const py = Shed3DConfig.heights.RCC / 2 - 0.01;

            const createVerticalRod = (x, z, key) => (
              <mesh
                key={key}
                geometry={verticalGeometry}
                position={[x, 2 * verticalHeight - 0.01, z + 0.001]}
                rotation={[0, 0, 0]}
                castShadow
                receiveShadow
              >
                <meshBasicMaterial color="blue" />
              </mesh>
            );

            return (
              <React.Fragment key={rodIndex}>
                <mesh
                  geometry={cylinderGeometry}
                  position={[px, py, pz]}
                  rotation={[0, isHorizontal ? 0 : -Math.PI / 2, Math.PI / 2]}
                  castShadow
                  receiveShadow
                >
                  <meshBasicMaterial color="blue" depthWrite={false} />
                </mesh>
                {createVerticalRod(
                  -((line1[0] + line2[0]) / 2 / 1000 - offsetX) * scale,
                  -((line1[1] + line2[1]) / 2 / 1000 - offsetZ) * scale,
                  `${rodIndex}-v1`
                )}
                {createVerticalRod(
                  -((line1[2] + line2[2]) / 2 / 1000 - offsetX) * scale,
                  -((line1[3] + line2[3]) / 2 / 1000 - offsetZ) * scale,
                  `${rodIndex}-v2`
                )}
              </React.Fragment>
            );
          })}
        </group>
      </React.Fragment>
    );
  });
});

export default FoundationsRenderer;
