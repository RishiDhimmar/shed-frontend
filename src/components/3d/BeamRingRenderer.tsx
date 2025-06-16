import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

const BeamRingRenderer = ({ beam, geometry, material }) => {
  const { width, height, length, position, rotation } = beam;
  const interval = 150 / 1000; // 150mm in meters

  const segments = useMemo(() => {
    const segs = [];
    // Space rings along local x-axis (beam's length direction)
    let x_local = -width / 2;
    while (x_local <= width / 2 + 1e-6) { // Add epsilon to include endpoint
      // Bottom: along local z at y=-height/2
      segs.push({
        start: [x_local, -height / 2, -length / 2],
        end: [x_local, -height / 2, length / 2],
        rotation: [Math.PI / 2, 0, 0], // Align cylinder along local z
        length: length,
      });
      // Top: along local z at y=height/2
      segs.push({
        start: [x_local, height / 2, -length / 2],
        end: [x_local, height / 2, length / 2],
        rotation: [Math.PI / 2, 0, 0], // Align cylinder along local z
        length: length,
      });
      // Left: along local y at z=-length/2
      segs.push({
        start: [x_local, -height / 2, -length / 2],
        end: [x_local, height / 2, -length / 2],
        rotation: [0, 0, 0], // Align cylinder along local y
        length: height,
      });
      // Right: along local y at z=length/2
      segs.push({
        start: [x_local, -height / 2, length / 2],
        end: [x_local, height / 2, length / 2],
        rotation: [0, 0, 0], // Align cylinder along local y
        length: height,
      });
      x_local += interval;
    }
    return segs;
  }, [width, height, length]);

  const meshRef = useRef();
  useEffect(() => {
    if (!meshRef.current) return;
    segments.forEach((segment, i) => {
      const position = [
        (segment.start[0] + segment.end[0]) / 2,
        (segment.start[1] + segment.end[1]) / 2,
        (segment.start[2] + segment.end[2]) / 2,
      ];
      const matrix = new THREE.Matrix4()
        .makeRotationFromEuler(new THREE.Euler(...segment.rotation, "XYZ"))
        .setPosition(...position)
        .scale(new THREE.Vector3(1, segment.length / geometry.parameters.height, 1));
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [segments, geometry]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, segments.length]}
      position={position}
      rotation={rotation}
    />
  );
};

export default BeamRingRenderer;