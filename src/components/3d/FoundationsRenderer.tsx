import { toJS } from "mobx";
import foundationStore from "../../stores/FoundationStore";
import FrustumMesh from "./FrustumMesh";
import RCCRenderer from "./RCCRenderer";
import { Shed3DConfig } from "../../Constants";
import * as THREE from "three";
import React, { useMemo } from "react";
import configStore from "../../stores/ConfigStore";
import { observer } from "mobx-react-lite";
const scale = 1;

const FoundationsRenderer = observer(({ centerOffset }) => {
  const [offsetX, , offsetZ] = centerOffset;
  const foundations = useMemo(() => toJS(foundationStore.foundations), []); //foundationStore.foundations;

  return foundations.map((f, i) => {
    const transformPoints = (points) =>
      (points || []).map((p) => ({
        x: -(p.x / 1000 - offsetX) * scale,
        y: -(p.y / 1000 - offsetZ) * scale,
      }));

    const outerPoints = transformPoints(f.outerFoundationPoints);
    const innerPoints = transformPoints(f.innerFoundationPoints);

    return (
      <React.Fragment key={i}>
        <FrustumMesh
          bottomPoints={outerPoints}
          topPoints={innerPoints}
          floorY={configStore.shed3D.heights.RCC}
          opacity={0.5}
          yDepth={configStore.shed3D.heights.FRUSTUM}
        />
        <RCCRenderer bottomPoints={outerPoints} />

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

          const verticalY = Shed3DConfig.heights.RCC / 2 - 0.007;

          const createVerticalRod = (x, z, key) => (
            <mesh
              key={key}
              geometry={verticalGeometry}
              position={[x + 0, verticalHeight / 2, z + 0.001]}
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
                position={[px, 0, pz]}
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
                -(line2[2] / 1000 - offsetX) * scale,
                -(line2[3] / 1000 - offsetZ) * scale,
                `${rodIndex}-v2`
              )}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  });
});

export default FoundationsRenderer;
