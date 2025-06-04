import { getRectanglePoints } from "../../utils/GeometryUtils";
import { getTrapezoidPoints } from "../../utils/PolygonUtils";

export function getPilePoints(
  numOfPile: number,
  cx,
  cy
): { x: number; y: number }[] {
  switch (numOfPile) {
    case 1:
      return getRectanglePoints(1500, 1500, [cx, cy]).map(([x, y]) => ({
        x,
        y,
      }));
    case 2:
      return getRectanglePoints(2000, 900, [cx, cy]).map(([x, y]) => ({
        x,
        y,
      }));
    case 3:
      return getTrapezoidPoints(cx, cy);
    default:
      return [];
  }
}
export interface CircleInfo {
  x: number;
  y: number;
  radius: number;
}
export function getPileCircles(
  numOfPile: number,
  cx: number,
  cy: number
): CircleInfo[] {
  const baseRadius = 200;

  switch (numOfPile) {
    case 1:
      return [{ x: cx, y: cy, radius: baseRadius }];

    case 2:
      const rectPoints = getRectanglePoints(2000, 900, [cx, cy]);
      const [p1, , p3] = rectPoints;
      const spacing = 500;
      return [
        { x: cx - spacing / 2, y: cy, radius: baseRadius },
        { x: cx + spacing / 2, y: cy, radius: baseRadius },
      ];

    case 3:
      const trapPoints = getTrapezoidPoints(cx, cy);
      const triangleRadius = 400;
      return [
        { x: cx, y: cy - triangleRadius, radius: baseRadius }, // Top
        {
          x: cx - triangleRadius * Math.cos(Math.PI / 6),
          y: cy + triangleRadius / 2,
          radius: baseRadius,
        }, // Bottom left
        {
          x: cx + triangleRadius * Math.cos(Math.PI / 6),
          y: cy + triangleRadius / 2,
          radius: baseRadius,
        }, // Bottom right
      ];

    default:
      return [];
  }
}
