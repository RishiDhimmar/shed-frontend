import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import configStore from "../../stores/ConfigStore";
import { toJS } from "mobx";
import columnStore from "../../stores/ColumnStore";

const scale = 1;

// Helper function to generate random colors for each ring
const getRandomColorForRing = () => {
  const hue = Math.random() * 360; // Random hue between 0 and 360
  return new THREE.Color(`hsl(${hue}, 70%, 50%)`);
};

const MultiRingRenderer = observer(
  ({
    columns,
    centerOffset,
    floorY,
    yInterval = 250 / 1000, // Default 250mm in meters
    rodDiameter = 8 / 1000, // Default 8mm in meters
    color = "red", // Default fallback color
    cornerOffset = 0.04, // Default corner offset in meters
    segmentsCount = 8, // Default number of cylinder segments
    height = configStore.shed3D.heights.COLUMNS,
    opacity = 1,
    onCalculateTotalLength,
  }) => {
    const segments = useMemo(() => {
      // Variable to accumulate total cylinder length
      let totalLength = 0;

      // Generate y-levels
      const yLevels = [];
      for (let y = floorY; y <= height + floorY; y += yInterval) {
        yLevels.push(y);
      }

      const segmentData = columns
        .map((c) => {
          const group = columnStore.polygons.find(
            (g) => g.name === c.groupName
          );
          if (!group) {
            console.warn(`Group not found for column:`, toJS(c));
            return null;
          }

          const groupLength = (group.data?.length || 200) / 1000;
          const groupWidth = (group.data?.width || 100) / 1000;
          const hEdgeWires = group.hEdgeWires || 8;
          const vEdgeWires = group.vEdgeWires || 4;
          const ringData = group.ringData || [];

          const points = (c.points || []).map((p) => ({
            x: -(p.x / 1000 - centerOffset[0]) * scale,
            z: -(p.y / 1000 - centerOffset[2]) * scale,
          }));

          if (points.length !== 4) {
            console.warn(`Invalid points for column:`, toJS(c));
            return null;
          }

          const xs = points.map((p) => p.x);
          const zs = points.map((p) => p.z);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minZ = Math.min(...zs);
          const maxZ = Math.max(...zs);

          // Process ringData to generate segments
          const ringSegments = ringData
            .map((ring, ringIndex) => {
              const { on: ringLength, from, to } = ring;

              const wireSpacing = groupLength / (hEdgeWires - 1);
              // console.log("wireSpacing", wireSpacing);
              const leftOffset = Math.abs(from) * wireSpacing + 0.05;
              const rightOffset =
                Math.abs(hEdgeWires - to - 1) * wireSpacing + 0.05;

              const ringMinX = minX + leftOffset;
              const ringMaxX = maxX - rightOffset;

              const ringCorners = [
                { x: ringMinX, z: minZ + cornerOffset },
                { x: ringMaxX, z: minZ + cornerOffset },
                { x: ringMaxX, z: maxZ - cornerOffset },
                { x: ringMinX, z: maxZ - cornerOffset },
              ];

              return yLevels.map((y) => {
                const ringColor = getRandomColorForRing();
                const segments = [
                  {
                    start: [ringCorners[0].x, y, ringCorners[0].z],
                    end: [ringCorners[1].x, y, ringCorners[1].z],
                    rotation: [0, 0, Math.PI / 2],
                    length: Math.abs(ringCorners[1].x - ringCorners[0].x),
                    color: ringColor,
                  },
                  {
                    start: [ringCorners[1].x, y, ringCorners[1].z],
                    end: [ringCorners[2].x, y, ringCorners[2].z],
                    rotation: [Math.PI / 2, 0, 0],
                    length: Math.abs(ringCorners[2].z - ringCorners[1].z),
                    color: ringColor,
                  },
                  {
                    start: [ringCorners[2].x, y, ringCorners[2].z],
                    end: [ringCorners[3].x, y, ringCorners[3].z],
                    rotation: [0, 0, Math.PI / 2],
                    length: Math.abs(ringCorners[3].x - ringCorners[2].x),
                    color: ringColor,
                  },
                  {
                    start: [ringCorners[3].x, y, ringCorners[3].z],
                    end: [ringCorners[0].x, y, ringCorners[0].z],
                    rotation: [Math.PI / 2, 0, 0],
                    length: Math.abs(ringCorners[0].z - ringCorners[3].z),
                    color: ringColor,
                  },
                ];

                // Accumulate lengths for this ring
                segments.forEach((segment) => {
                  totalLength += segment.length;
                });

                return segments;
              });
            })
            .flat(2)
            .filter(Boolean);

          return {
            segments: ringSegments,
            color,
          };
        })
        .filter(Boolean);

      // Log the total accumulative length
      // console.log("Total Accumulative Cylinder Length (meters):", totalLength);
      onCalculateTotalLength(totalLength);
      return segmentData;
    }, [
      columns,
      centerOffset,
      floorY,
      yInterval,
      cornerOffset,
      color,
      rodDiameter,
      segmentsCount,
      height,
    ]);

    const cylinderGeometry = useMemo(
      () =>
        new THREE.CylinderGeometry(rodDiameter, rodDiameter, 1, segmentsCount),
      [rodDiameter, segmentsCount]
    );

    return (
      <>
        {segments.map((rect, index) => {
          const segmentsByRing = rect.segments.reduce(
            (acc, segment, segmentIndex) => {
              const y = segment.start[1];
              const ringIndex = Math.floor(segmentIndex / 4);
              const key = `${y}-${ringIndex}`;
              if (!acc[key]) acc[key] = { segments: [], color: segment.color };
              acc[key].segments.push(segment);
              return acc;
            },
            {}
          );

          return Object.entries(segmentsByRing).map(
            (
              [key, { segments: ringSegments, color: ringColor }],
              ringIndex
            ) => {
              const instanceCount = ringSegments.length;
              const meshRef = useRef();

              const material = useMemo(() => {
                const segmentColor = ringColor || new THREE.Color(rect.color);
                return new THREE.MeshBasicMaterial({
                  color: segmentColor,
                  polygonOffset: true,
                  opacity: 0.5,
                  transparent: opacity < 1,
                });
              }, [ringColor, rect.color, opacity]);

              useEffect(() => {
                if (!meshRef.current) return;

                ringSegments.forEach((segment, segmentIndex) => {
                  const position = [
                    (segment.start[0] + segment.end[0]) / 2,
                    segment.start[1],
                    (segment.start[2] + segment.end[2]) / 2,
                  ];
                  const matrix = new THREE.Matrix4()
                    .makeRotationFromEuler(
                      new THREE.Euler(...segment.rotation, "XYZ")
                    )
                    .setPosition(...position)
                    .scale(new THREE.Vector3(1, segment.length, 1));

                  meshRef.current.setMatrixAt(segmentIndex, matrix);
                });

                meshRef.current.instanceMatrix.needsUpdate = true;
              }, [ringSegments]);

              return (
                <instancedMesh
                  key={`rect-${index}-ring-${ringIndex}`}
                  ref={meshRef}
                  args={[cylinderGeometry, material, instanceCount]}
                  renderOrder={100}
                />
              );
            }
          );
        })}
      </>
    );
  }
);

export default MultiRingRenderer;
