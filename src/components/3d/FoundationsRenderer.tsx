import { toJS } from "mobx";
import foundationStore from "../../stores/FoundationStore";
import FrustumMesh from "./FrustumMesh";
import RCCRenderer from "./RCCRenderer";
import { Shed3DConfig } from "../../Constants";
import * as THREE from "three";
import React, { useMemo } from "react";
import configStore from "../../stores/ConfigStore";
import { observer } from "mobx-react-lite";
import uiStore from "../../stores/UIStore";
import AnyShapeRenderer from "./AnyShapeExtrudeRenderer";

const scale = 1;

// Precompute static geometries to avoid recreating them on every render
const pileLineGeometry = new THREE.CylinderGeometry(0.008, 0.008, 1, 8); // Height will be scaled in matrix
const ringGeometry = new THREE.TorusGeometry(0.3, 0.008, 8, 32);
const rodGeometry = new THREE.CylinderGeometry(
  0.01 * scale,
  0.01 * scale,
  1,
  8
); // Wire length will be scaled
const verticalRodGeometry = new THREE.CylinderGeometry(
  0.01 * scale,
  0.01 * scale,
  0.075 * scale,
  8
);

const FoundationsRenderer = observer(({ centerOffset }) => {
  const [offsetX, , offsetZ] = centerOffset;
  const foundations = useMemo(
    () => toJS(foundationStore.foundations),
    [foundationStore.foundations]
  );

  // Memoize group lookup to avoid repeated searches
  const groupMap = useMemo(() => {
    const map = {};
    foundationStore.ogGroups.forEach((g) => {
      map[g.name] = g.name.includes("Group 2");
    });
    return map;
  }, [foundationStore.ogGroups]);

  return foundations.map((f, i) => {
    // Transform points once per foundation
    const transformPoints = (points) =>
      (points || []).map((p) => ({
        x: -(p.x / 1000 - offsetX) * scale,
        y: -(p.y / 1000 - offsetZ) * scale,
      }));

    const outerPoints = transformPoints(f.outerFoundationPoints);
    const ppcPoints = transformPoints(f.ppcPoints);
    const excavationBottomPoints = transformPoints(f.excavationBottomPoints);
    const innerPoints = transformPoints(f.innerFoundationPoints);
    const isGroup2 = groupMap[f.group];

    // Memoize height values to avoid accessing store multiple times
    const heights = useMemo(
      () => ({
        pileHeight: isGroup2
          ? configStore.shed3D.heights.PILE_HEIGHT_CORNERS
          : configStore.shed3D.heights.PILE_HEIGHT,
        rccHeight: configStore.shed3D.heights.RCC,
        frustumHeight: configStore.shed3D.heights.FRUSTUM,
        groundBeam: configStore.shed3D.heights.GROUND_BEAM,
      }),
      [
        isGroup2,
        configStore.shed3D.heights.PILE_HEIGHT_CORNERS,
        configStore.shed3D.heights.PILE_HEIGHT,
        configStore.shed3D.heights.RCC,
        configStore.shed3D.heights.FRUSTUM,
        configStore.shed3D.heights.GROUND_BEAM,
      ]
    );

    // Prepare instanced mesh for pileLines
    const pileLinesMesh = useMemo(() => {
      if (!f.pileLines || f.pileLines.length === 0) return null;

      console.log(`pileLines for foundation ${i}:`, f.pileLines);

      const material = new THREE.MeshBasicMaterial({
        color: "blue",
        opacity: 1,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

      const instancedMesh = new THREE.InstancedMesh(
        pileLineGeometry,
        material,
        f.pileLines.length
      );

      f.pileLines.forEach((pileLine, index) => {
        const { x, y } = pileLine;
        const matrix = new THREE.Matrix4();
        matrix.makeScale(1, heights.pileHeight, 1); // Scale height dynamically
        matrix.setPosition(
          new THREE.Vector3(
            -(x / 1000 - offsetX) * scale,
            -heights.pileHeight / 2 - 0.2,
            -(y / 1000 - offsetZ) * scale
          )
        );
        instancedMesh.setMatrixAt(index, matrix);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      return instancedMesh;
    }, [f.pileLines, offsetX, offsetZ, heights.pileHeight]);

    // Prepare instanced mesh for pile rings
    const pileRingsMesh = useMemo(() => {
      if (!f.pileDetails || f.pileDetails.length === 0) return null;

      console.log(`Group for foundation ${i}:`, f.group);

      const spacing = 0.15;
      const numRingsPerPile = Math.floor(heights.pileHeight / spacing) + 1;
      const totalRings = f.pileDetails.length * numRingsPerPile;

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
        const baseY = -heights.pileHeight - 0.2;

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
    }, [f.pileDetails, offsetX, offsetZ, heights.pileHeight]);

    // Rod rendering function to avoid code duplication
    const renderRods = (yOffset) =>
      (f.rodData || []).map((rod, rodIndex) => {
        const { line1, line2, isHorizontal } = rod;
        const wireLength = Math.abs(
          (isHorizontal ? line1[2] - line1[0] : line1[3] - line1[1]) / 1000
        );

        const px = -((line1[0] + line1[2]) / 2 / 1000 - offsetX) * scale;
        const pz = -((line1[1] + line1[3]) / 2 / 1000 - offsetZ) * scale;
        const py = Shed3DConfig.heights.RCC / 2 - 0.01 + yOffset;

        const createVerticalRod = (x, z, key) => (
          <mesh
            key={key}
            geometry={verticalRodGeometry}
            position={[
              x,
              2 * (0.075 * scale) - 0.01 + yOffset > 0 ? 0.075 : -0.075,
              z + 0.001,
            ]}
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
              geometry={rodGeometry}
              position={[px, py, pz]}
              rotation={[0, isHorizontal ? 0 : -Math.PI / 2, Math.PI / 2]}
              scale={[1, wireLength, 1]} // Scale dynamically
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
      });

    return (
      <React.Fragment key={i}>
        <group visible={uiStore.visibility.excavation}>
          <AnyShapeRenderer
            bottomPoints={excavationBottomPoints}
            height={configStore.shed3D.heights.EXCAVATION}
            y={-heights.groundBeam / 4}
            color="brown"
          />
        </group>
        <group visible={uiStore.visibility.foundation}>
          {f.type === "Flat Foundation" && (
            <RCCRenderer
              bottomPoints={outerPoints}
              height={heights.rccHeight + heights.frustumHeight}
            />
          )}
          {f.type === "Pile Foundation" && (
            <>
              <AnyShapeRenderer
                bottomPoints={outerPoints}
                height={heights.frustumHeight}
              />
              {f.pileDetails.map((p, j) => (
                <mesh
                  position={[
                    -(p.x / 1000 - offsetX) * scale,
                    -(heights.pileHeight * 1.1) / 1.9,
                    -(p.y / 1000 - offsetZ) * scale,
                  ]}
                  key={j}
                  renderOrder={1}
                >
                  <cylinderGeometry
                    args={[
                      p.radius / 1000,
                      p.radius / 1000,
                      heights.pileHeight,
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
                floorY={heights.rccHeight}
                opacity={0.5}
                yDepth={heights.frustumHeight}
              />
              <RCCRenderer bottomPoints={outerPoints} />
              {/* ppc */}
              <group
                position={[
                  0,
                  0 - configStore.shed3D.heights.RCC / 2 - 0.125 / 2,
                  0,
                ]}
              >
                <RCCRenderer
                  bottomPoints={ppcPoints}
                  height={0.125}
                  color="magenta"
                />
              </group>
              {/* rubble soliling */}
              <group
                position={[
                  0,
                  -configStore.shed3D.heights.RCC / 2 - 0.125 - 0.23 / 2,
                  0,
                ]}
              >
                <RCCRenderer
                  bottomPoints={ppcPoints}
                  height={heights.rccHeight}
                  color="gray"
                />
              </group>
            </>
          )}
          {pileLinesMesh && <primitive object={pileLinesMesh} />}
          {pileRingsMesh && <primitive object={pileRingsMesh} />}
          <group position={[0, f.type === "Pile Foundation" ? -0.2 : -0.01, 0]}>
            {renderRods(-0.06)}
          </group>
          {f.type === "Pile Foundation" && (
            <group position={[0, 0.01, 0]}>{renderRods(0.01)}</group>
          )}
        </group>
      </React.Fragment>
    );
  });
});

export default FoundationsRenderer;
