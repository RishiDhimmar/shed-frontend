import { toJS } from "mobx";
import { convertToPointObjects } from "./PolygonUtils";
import dxfStore from "../stores/DxfStore";
import { items } from "./sheetItems";

export const handleBrickworkBelowPlinthCalculation = () => {
  const DEPTH = 0.23;
  let totalVolume = 0;
  const measurements = [];

  const calculateLengthBreadthArea = (points) => {
    if (!points || points.length < 3) {
      return {
        length: 0,
        breadth: 0,
        area: 0,
        error: "Invalid polygon: At least 3 points required",
      };
    }

    const scaledPoints = points.map((p) => ({
      x: p.x * 0.001,
      y: p.y * 0.001,
    }));

    const xs = scaledPoints.map((p) => p.x);
    const ys = scaledPoints.map((p) => p.y);
    const length = Math.max(...xs) - Math.min(...xs);
    const breadth = Math.max(...ys) - Math.min(...ys);

    // Shoelace formula for area
    let area = 0;
    const n = scaledPoints.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += scaledPoints[i].x * scaledPoints[j].y;
      area -= scaledPoints[j].x * scaledPoints[i].y;
    }
    area = Math.abs(area) / 2;

    return {
      length: parseFloat(length.toFixed(4)),
      breadth: parseFloat(breadth.toFixed(4)),
      area: parseFloat((area * DEPTH).toFixed(4)),
    };
  };

  const externalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(toJS(dxfStore.externalWallPolygon))
  );

  // Add brickwork volume using length and breadth of external wall with fixed depth 0.23
  const lengthVolume = parseFloat(
    (externalWallResult.length * 1 * DEPTH).toFixed(3)
  );
  const widthVolume = parseFloat(
    (externalWallResult.breadth * 1 * DEPTH).toFixed(3)
  );

  totalVolume = parseFloat((lengthVolume + widthVolume).toFixed(3));

  measurements.push(
    {
      id: "brickwork-length",
      description: "",
      nos: 1,
      length: externalWallResult.length,
      breadth: 0.6,
      depth: 0.23,
      area: lengthVolume,
    },
    {
      id: "brickwork-width",
      description: "",
      nos: 1,
      length: externalWallResult.breadth,
      breadth: 0.6,
      depth: 0.23,
      area: widthVolume,
    }
  );

  // Assign to items
  items.brickwork_below_plinth.measurements = measurements;
  items.brickwork_below_plinth.total = totalVolume;

  return {
    totalVolume,
    measurements,
  };
};
