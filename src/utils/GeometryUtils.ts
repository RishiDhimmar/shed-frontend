export interface Point {
  X: number;
  Y: number;
}

export const getRectanglePoints = (
  length: number,
  width: number
): number[][] => [
  [-length / 2, -width / 2],
  [length / 2, -width / 2],
  [length / 2, width / 2],
  [-length / 2, width / 2],
];

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
  wallThickness: number
): number[][] => {
  const internalLength = length - 2 * wallThickness;
  const internalWidth = width - 2 * wallThickness;
  return internalLength > 0 && internalWidth > 0
    ? getRectanglePoints(internalLength, internalWidth)
    : [];
};
