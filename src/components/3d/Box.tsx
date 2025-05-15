import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
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
}

const BoxRenderer = observer(({ instances }: BoxRendererProps) => {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  // Compute box vertices and edges for outlines
  const outlines = useMemo(() => {
    if (!instances || instances.length === 0) return [];

    return instances.map((inst) => {
      const { position, width, height, length } = inst;
      const [px, py, pz] = position;
      const hw = width / 2;
      const hh = height / 2;
      const hl = length / 2;

      // 8 vertices of the box
      const vertices = [
        [px - hw, py - hh, pz - hl], // 0: bottom-left-front
        [px + hw, py - hh, pz - hl], // 1: bottom-right-front
        [px + hw, py - hh, pz + hl], // 2: bottom-right-back
        [px - hw, py - hh, pz + hl], // 3: bottom-left-back
        [px - hw, py + hh, pz - hl], // 4: top-left-front
        [px + hw, py + hh, pz - hl], // 5: top-right-front
        [px + hw, py + hh, pz + hl], // 6: top-right-back
        [px - hw, py + hh, pz + hl], // 7: top-left-back
      ];

      // 12 edges: 4 bottom, 4 top, 4 vertical
      const edges = [
        // Bottom face
      ];

      return edges;
    });
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
      {/* Instanced mesh for boxes */}
      <instancedMesh ref={meshRef} args={[null, null, instances.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={instances[0]?.color || "magenta"}
          transparent
          opacity={0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
});

export default BoxRenderer;
