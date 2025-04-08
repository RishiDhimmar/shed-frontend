import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface HatchingLinesProps {
  outerPolygon: [number, number][];
  innerPolygon: [number, number][];
  exclusionAreas?: [number, number, number, number][];
  spacing?: number;
  angle?: number;
  color?: string;
  lineWidth?: number;
  depth?: number;
  depthOffset?: number;
}

const HatchingLines: React.FC<HatchingLinesProps> = ({
  outerPolygon,
  innerPolygon,
  exclusionAreas = [],
  spacing = 0.1,
  angle = 45,
  color = "#ff7f00",
  lineWidth = 1,
  depth = 0.01,
  depthOffset = 0.001,
}) => {
  const hatchLines = useMemo(() => {
    if (
      !outerPolygon ||
      !innerPolygon ||
      outerPolygon.length < 3 ||
      innerPolygon.length < 3
    )
      return [];

    const xValues = outerPolygon.map((p) => p[0]);
    const yValues = outerPolygon.map((p) => p[1]);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const diagonalLength = Math.sqrt(
      Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2)
    );

    const lines: [number, number, number][][] = [];
    const angleRad = (angle * Math.PI) / 180;
    const perpAngleRad = angleRad + Math.PI / 2;
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    const perpX = Math.cos(perpAngleRad);
    const perpY = Math.sin(perpAngleRad);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const numLines = Math.ceil(diagonalLength / spacing) * 2;
    const epsilon = 1e-10;

    const baseDepth = depth;

    for (let i = -numLines / 2; i < numLines / 2; i++) {
      const offsetX = i * spacing * perpX;
      const offsetY = i * spacing * perpY;

      const startX = centerX + offsetX - dirX * diagonalLength;
      const startY = centerY + offsetY - dirY * diagonalLength;
      const endX = centerX + offsetX + dirX * diagonalLength;
      const endY = centerY + offsetY + dirY * diagonalLength;

      const lineSegment = new THREE.Line3(
        new THREE.Vector3(startX, startY, 0),
        new THREE.Vector3(endX, endY, 0)
      );

      const outerIntersections = findIntersectionsWithPolygon(
        lineSegment,
        outerPolygon
      );
      const innerIntersections = findIntersectionsWithPolygon(
        lineSegment,
        innerPolygon
      );

      if (outerIntersections.length >= 2) {
        const allIntersections = [...outerIntersections, ...innerIntersections];

        const uniqueIntersections: [number, number][] = [];
        for (let j = 0; j < allIntersections.length; j++) {
          let isDuplicate = false;
          for (let k = 0; k < uniqueIntersections.length; k++) {
            const dist = Math.hypot(
              allIntersections[j][0] - uniqueIntersections[k][0],
              allIntersections[j][1] - uniqueIntersections[k][1]
            );
            if (dist < epsilon) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            uniqueIntersections.push(allIntersections[j]);
          }
        }

        uniqueIntersections.sort((a, b) => {
          const distA = Math.pow(a[0] - startX, 2) + Math.pow(a[1] - startY, 2);
          const distB = Math.pow(b[0] - startX, 2) + Math.pow(b[1] - startY, 2);
          return distA - distB;
        });

        for (let j = 0; j < uniqueIntersections.length - 1; j++) {
          const p1 = uniqueIntersections[j];
          const p2 = uniqueIntersections[j + 1];

          const segmentLength = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
          if (segmentLength < epsilon) continue;

          const midX = (p1[0] + p2[0]) / 2;
          const midY = (p1[1] + p2[1]) / 2;

          const isInOuter = pointInPolygon([midX, midY], outerPolygon);
          const isInHole = pointInPolygon([midX, midY], innerPolygon);
          const isInWall = isInOuter && !isInHole;

          const isInExclusionArea = exclusionAreas.some(
            ([x, y, width, height]) =>
              midX >= x - width / 2 &&
              midX <= x + width / 2 &&
              midY >= y - height / 2 &&
              midY <= y + height / 2
          );

          if (isInWall && !isInExclusionArea) {
            const zPos = baseDepth + Math.random() * 0.0001;
            const startPoint: [number, number, number] = [
              Math.round(p1[0] * 1e6) / 1e6,
              Math.round(p1[1] * 1e6) / 1e6,
              zPos,
            ];
            const endPoint: [number, number, number] = [
              Math.round(p2[0] * 1e6) / 1e6,
              Math.round(p2[1] * 1e6) / 1e6,
              zPos,
            ];
            lines.push([startPoint, endPoint]);
          }
        }
      }
    }

    return lines;
  }, [
    outerPolygon,
    innerPolygon,
    exclusionAreas,
    spacing,
    angle,
    depth,
    depthOffset,
  ]);

  return (
    <>
      {hatchLines.map((points, index) => (
        <Line
          key={`hatch-line-${index}`}
          points={points}
          color={color}
          lineWidth={lineWidth}
          dashed={false}
          depthTest={true}
          depthWrite={true}
          transparent={false}
          opacity={1}
          renderOrder={0}
        />
      ))}
    </>
  );
};

// Ray casting algorithm for point-in-polygon
function pointInPolygon(point: [number, number], polygon: [number, number][]) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-10) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function findIntersectionsWithPolygon(
  line: THREE.Line3,
  polygonPoints: [number, number][]
): [number, number][] {
  const intersections: [number, number][] = [];
  const epsilon = 1e-10;

  for (let i = 0; i < polygonPoints.length; i++) {
    const p1 = polygonPoints[i];
    const p2 = polygonPoints[(i + 1) % polygonPoints.length];

    const polygonSegment = new THREE.Line3(
      new THREE.Vector3(p1[0], p1[1], 0),
      new THREE.Vector3(p2[0], p2[1], 0)
    );

    const intersection = findLineIntersection(line, polygonSegment);
    if (intersection) {
      const x = Math.round(intersection.x * 1e6) / 1e6;
      const y = Math.round(intersection.y * 1e6) / 1e6;

      let isDuplicate = false;
      for (const point of intersections) {
        if (
          Math.abs(point[0] - x) < epsilon &&
          Math.abs(point[1] - y) < epsilon
        ) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        intersections.push([x, y]);
      }
    }
  }

  return intersections;
}

function findLineIntersection(
  line1: THREE.Line3,
  line2: THREE.Line3
): THREE.Vector2 | null {
  const p1 = line1.start;
  const p2 = line1.end;
  const p3 = line2.start;
  const p4 = line2.end;

  const denominator =
    (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

  if (Math.abs(denominator) < 1e-10) return null;

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
    denominator;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
    denominator;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    const intersectionX = p1.x + ua * (p2.x - p1.x);
    const intersectionY = p1.y + ua * (p2.y - p1.y);
    return new THREE.Vector2(intersectionX, intersectionY);
  }

  return null;
}

export default HatchingLines;
