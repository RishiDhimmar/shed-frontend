export interface Point {
  X: number;
  Y: number;
}

export const getRectanglePoints = (
  length: number,
  width: number,
  center: [number, number] = [0, 0]
): number[][] => {
  const [cx, cy] = center;
  // debugger
  if (!length || !width) {
    console.log("Invalid width and length values : ", length, width);
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
  wallThickness: number
): number[][] => {
  const internalLength = length - 2 * wallThickness;
  const internalWidth = width - 2 * wallThickness;
  return internalLength > 0 && internalWidth > 0
    ? getRectanglePoints(internalLength, internalWidth, [0, 0])
    : [];
};


export const generateCenterFromRectanglePoints = (points: number[][]): Point => {
  const centerX = (points[0][0] + points[2][0]) / 2;
  const centerY = (points[0][1] + points[2][1]) / 2;
  return { X: centerX, Y: centerY };
}