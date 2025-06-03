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
