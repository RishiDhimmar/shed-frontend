
import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";

interface Instance {
  position: [number, number, number];
  width: number;
  height: number;
  length: number;
  color?: string;
}

interface BoxRendererProps {
  instances: Instance[];
  opacity?: number;
}

const BoxRenderer = observer(
  ({ instances, opacity = 0.5 }: BoxRendererProps) => {
    const meshRef = useRef<THREE.InstancedMesh | null>(null);
    const lineRef = useRef<THREE.LineSegments | null>(null);

    const mergedLineGeometry = useMemo(() => {
      const positions: number[] = [];

      instances.forEach((inst) => {
        const { position, width, height, length } = inst;
        const [px, py, pz] = position;

        const hw = width / 2;
        const hh = height / 2;
        const hl = length / 2;

        const v = [
          new THREE.Vector3(px - hw, py - hh, pz - hl),
          new THREE.Vector3(px + hw, py - hh, pz - hl),
          new THREE.Vector3(px + hw, py - hh, pz + hl),
          new THREE.Vector3(px - hw, py - hh, pz + hl),
          new THREE.Vector3(px - hw, py + hh, pz - hl),
          new THREE.Vector3(px + hw, py + hh, pz - hl),
          new THREE.Vector3(px + hw, py + hh, pz + hl),
          new THREE.Vector3(px - hw, py + hh, pz + hl),
        ];

        const edgeIndices = [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0], // bottom
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 4], // top
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7], // sides
        ];

        edgeIndices.forEach(([start, end]) => {
          positions.push(...v[start].toArray(), ...v[end].toArray());
        });
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );

      return geometry;
    }, [instances]);

    useEffect(() => {
      if (!meshRef.current || instances.length === 0) return;

      const dummy = new THREE.Object3D();
      const dispose = reaction(
        () =>
          instances.map((inst) => [
            inst.position[0],
            inst.position[1],
            inst.position[2],
            inst.width,
            inst.height,
            inst.length,
          ]),
        () => {
          instances.forEach((inst, i) => {
            dummy.position.set(...inst.position);
            dummy.scale.set(inst.width, inst.height, inst.length);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
          });
          meshRef.current!.instanceMatrix.needsUpdate = true;
        },
        { fireImmediately: true }
      );

      return () => dispose();
    }, [instances]);

    if (instances.length === 0) return null;

    return (
      <group>
        <instancedMesh ref={meshRef} args={[null, null, instances.length]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={instances[0]?.color || "magenta"}
            transparent
            opacity={opacity}
            depthWrite={false}
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </instancedMesh>
        {
          <lineSegments ref={lineRef} geometry={mergedLineGeometry}>
            <lineBasicMaterial
              color={instances[0]?.color || "magenta"}
              depthTest={false}
              transparent
            />
          </lineSegments>
        }
      </group>
    );
  }
);

export default BoxRenderer;
