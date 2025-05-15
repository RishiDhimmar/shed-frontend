// export interface Point {
//   X: number;
//   Y: number;
// }

// export const getRectanglePoints = (
//   length: number,
//   width: number,
//   center: [number, number] = [0, 0]
// ): number[][] => {
//   const [cx, cy] = center;
//   // debugger
//   if (!length || !width) {
//     console.log("Invalid width and length values : ", length, width);
//     return [];
//   }
//   return [
//     [cx - length / 2, cy - width / 2],
//     [cx + length / 2, cy - width / 2],
//     [cx + length / 2, cy + width / 2],
//     [cx - length / 2, cy + width / 2],
//   ];
// };

// export const getClosedPoints = (points: number[][] = []): number[][] => {
//   if (!Array.isArray(points) || points.length === 0) return [];
//   const first = points[0];
//   const last = points[points.length - 1];
//   if (first[0] !== last[0] || first[1] !== last[1]) {
//     return [...points, first];
//   }
//   return points;
// };

// export const getInternalWallPoints = (
//   length: number,
//   width: number,
//   wallThickness: number
// ): number[][] => {
//   const internalLength = length - 2 * wallThickness;
//   const internalWidth = width - 2 * wallThickness;
//   return internalLength > 0 && internalWidth > 0
//     ? getRectanglePoints(internalLength, internalWidth, [0, 0])
//     : [];
// };

// export const generateCenterFromRectanglePoints = (points: number[][]): Point => {
//   const centerX = (points[0][0] + points[2][0]) / 2;
//   const centerY = (points[0][1] + points[2][1]) / 2;
//   return { X: centerX, Y: centerY };
// }
export interface Point {
  X: number;
  Y: number;
}

export const getRectanglePoints = (
  length: number,
  width: number,
  center: [number, number] = [0, 0],
): number[][] => {
  const [cx, cy] = center;
  // debugger
  if (!length || !width) {
    return [];
  }
  return [
    [cx - length / 2, cy - width / 2],
    [cx + length / 2, cy - width / 2],
    [cx + length / 2, cy + width / 2],
    [cx - length / 2, cy + width / 2],
  ];
};

export const getClosedPoints = (points: number[][] = []): number[][] => {
  if (!Array.isArray(points) || points.length === 0) return [];
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...points, first];
  }
  return points;
};

export const getInternalWallPoints = (
  length: number,
  width: number,
  wallThickness: number,
): number[][] => {
  const internalLength = length - 2 * wallThickness;
  const internalWidth = width - 2 * wallThickness;
  return internalLength > 0 && internalWidth > 0
    ? getRectanglePoints(internalLength, internalWidth, [0, 0])
    : [];
};

export const generateCenterFromRectanglePoints = (
  points: number[][],
): Point => {
  const centerX = (points[0][0] + points[2][0]) / 2;
  const centerY = (points[0][1] + points[2][1]) / 2;
  return { X: centerX, Y: centerY };
};

export const EPSILON = 0.01;
export const SCALE = 1 / 100;

export const key = (p) => `${p.x.toFixed(4)}:${p.y.toFixed(4)}`;
export const equal = (a, b) =>
  Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;
export const scalePoint = (pt) => ({ x: pt.x * SCALE, y: pt.y * SCALE });

export function isPointInPolygon(point, polygon) {
  let inside = false;
  let x = point.x,
    y = point.y;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export function calculateBoundingBoxArea(polygon) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const point of polygon) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return (maxX - minX) * (maxY - minY);
}

export function getEdgeCenter(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

export function getEdgeNormal(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy);
  return { x: -dy / length, y: dx / length };
}

export function raySegmentIntersection(rayOrigin, rayDir, segA, segB) {
  const v1 = { x: rayOrigin.x - segA.x, y: rayOrigin.y - segA.y };
  const v2 = { x: segB.x - segA.x, y: segB.y - segA.y };
  const v3 = { x: -rayDir.y, y: rayDir.x };

  const dot = v2.x * v3.x + v2.y * v3.y;
  if (Math.abs(dot) < 1e-8) return null;

  const t1 = (v2.x * v1.y - v2.y * v1.x) / dot;
  const t2 = (v1.x * v3.x + v1.y * v3.y) / dot;

  if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
    return {
      x: rayOrigin.x + rayDir.x * t1,
      y: rayOrigin.y + rayDir.y * t1,
    };
  }

  return null;
}
