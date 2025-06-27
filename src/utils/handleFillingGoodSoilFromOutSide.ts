import { toJS } from "mobx";
import dxfStore from "../stores/DxfStore";
import wallStore from "../stores/WallStore";
import { convertToPointObjects } from "./PolygonUtils";
import { items } from "./sheetItems";

export const handleFillingGoodSoilFromOutSide = () => {
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
      area: parseFloat((area * 0.3).toFixed(4)),
    };
  };

  const externalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(toJS(dxfStore.externalWallPolygon))
  );
  items.filling_good_soil_outside.measurements = [
    {
      description: "",
      nos: 1,
      length: externalWallResult.length,
      breadth: externalWallResult.breadth,
      depth: 0.3,
      area: externalWallResult.length * externalWallResult.breadth * 0.3,
    },
  ];
  items.filling_good_soil_outside.total =
    externalWallResult.length * externalWallResult.breadth * 0.3;
};
