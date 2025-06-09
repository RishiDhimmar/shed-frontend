import { toJS } from "mobx";
import dxfStore from "../stores/DxfStore";
import { convertToPointObjects } from "./PolygonUtils";
import { items } from "./sheetItems";
import wallStore from "../stores/WallStore";

export const handleRubbleSoilingCalculation = () => {
  // Helper function to calculate length, breadth, and area
  const calculateLengthBreathArea = (points) => {
    if (!points || points.length < 3) {
      return {
        length: 0,
        breadth: 0,
        area: 0,
        error: "Invalid polygon: At least 3 points required",
      };
    }

    // Scale points by 0.001
    const scaledPoints = points.map((point) => ({
      x: point.x * 0.001,
      y: point.y * 0.001,
    }));

    // Calculate bounding box for length and breadth
    let minX = scaledPoints[0].x;
    let maxX = scaledPoints[0].x;
    let minY = scaledPoints[0].y;
    let maxY = scaledPoints[0].y;

    scaledPoints.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    const length = maxX - minX;
    const breadth = maxY - minY;

    // Calculate area using Shoelace formula
    let area = 0;
    const n = scaledPoints.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n; // Next vertex, wraps around to 0
      area += scaledPoints[i].x * scaledPoints[j].y;
      area -= scaledPoints[j].x * scaledPoints[i].y;
    }

    area = Math.abs(area) / 2;

    return {
      length: parseFloat(length.toFixed(4)),
      breadth: parseFloat(breadth.toFixed(4)),
      area: parseFloat((area * 0.2).toFixed(4)),
    };
  };

  const result = calculateLengthBreathArea(
    convertToPointObjects(toJS(dxfStore.externalWallPolygon))
  );

  items.rubble_solling_at_plinth_lvl.measurements = [
    {
      description: "soling for grade slab",
      nos: 1,
      length: result.length,
      breadth: result.breadth,
      depth: 0.2,
      area: result.area,
    },
  ];
  items.rubble_solling_at_plinth_lvl.total = result.area;

  wallStore.length = result.length;
  wallStore.breadth = result.breadth;
  wallStore.area = result.area;
};
