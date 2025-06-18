import { getRectanglePoints } from "../../utils/GeometryUtils";
import { getTrapezoidPoints } from "../../utils/PolygonUtils";

export function getPilePoints(
  numOfPile: number,
  cx,
  cy
): { x: number; y: number }[] {
  const D = 600;
  switch (numOfPile) {
    case 1:
      return getRectanglePoints(D * 2, D * 2, [cx, cy]).map(([x, y]) => ({
        x,
        y,
      }));
    case 2:
      return getRectanglePoints(D * 4.5, D * 2, [cx, cy]).map(([x, y]) => ({
        x,
        y,
      }));
    case 3:
      return getTrapezoidPoints(cx, cy);

    case 4:
      return getRectanglePoints(D * 4.5, D * 4.5, [cx, cy]).map(([x, y]) => ({
        x,
        y,
      }));
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
  const D = 600;
  const baseRadius = D / 2;

  switch (numOfPile) {
    case 1:
      return [{ x: cx, y: cy, radius: baseRadius }];

    case 2:
      const rectPoints = getRectanglePoints(D * 4.5, D * 2, [cx, cy]);
      const [p1, , p3] = rectPoints;
      const spacing = D * 2.5;
      return [
        { x: cx - spacing / 2, y: cy, radius: baseRadius },
        { x: cx + spacing / 2, y: cy, radius: baseRadius },
      ];

    case 3:
      const trapPoints = getTrapezoidPoints(cx, cy);
      const sideLength = D * 3;
      const triangleRadius = sideLength / Math.sqrt(3); // ≈ 1039.23
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

    case 4:
      const rectPointsFour = getRectanglePoints(D * 4.5, D * 4.5, [cx, cy]);
      const [px, , pz] = rectPointsFour;
      const spacingFour = D * 2.5;
      return [
        {
          x: cx - spacingFour / 2,
          y: cy - spacingFour / 2,
          radius: baseRadius,
        },
        {
          x: cx + spacingFour / 2,
          y: cy - spacingFour / 2,
          radius: baseRadius,
        },
        {
          x: cx + spacingFour / 2,
          y: cy + spacingFour / 2,
          radius: baseRadius,
        },
        {
          x: cx - spacingFour / 2,
          y: cy + spacingFour / 2,
          radius: baseRadius,
        },
      ];

    default:
      return [];
  }
}
