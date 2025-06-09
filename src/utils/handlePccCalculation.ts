import dxfStore from "../stores/DxfStore";
import wallStore from "../stores/WallStore";
import { convertToPointObjects } from "./PolygonUtils";
import { items } from "./sheetItems";

export const handlePccCalculation = () => {
  const points = convertToPointObjects(dxfStore.externalWallPolygon);
  const TOLERANCE = 0.001;
  const BREADTH = 0.38; // meters
  const DEPTH = 0.1; // meters

  // Classify lines
  const classifyLines = (points) => {
    const lines = [];
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length]; // Connect last point to first
      const dx = Math.abs(p1.x - p2.x);
      const dy = Math.abs(p1.y - p2.y);
      const length = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) / 1000; // Convert mm to m

      let type;
      if (dx < TOLERANCE && dy >= TOLERANCE) {
        type = "vertical";
      } else if (dy < TOLERANCE && dx >= TOLERANCE) {
        type = "horizontal";
      } else {
        type = "diagonal";
      }

      // Calculate volume (Length × Breadth × Depth)
      const volume = length * BREADTH * DEPTH;

      lines.push({
        start: p1,
        end: p2,
        type,
        length,
        volume,
        index: i,
      });
    }
    return lines;
  };

  const lines = classifyLines(points);

  // Filter out zero-length lines
  const validLines = lines.filter((line) => line.length > TOLERANCE);

  // Group by type and format as measurements
  const pccMeasurements = validLines
    .map((line) => ({
      description: `${line.type}`,
      nos: 1, // Each line is a single segment
      length: Number(line.length.toFixed(3)),
      breadth: BREADTH,
      depth: DEPTH,
      area: Number(line.volume.toFixed(3)), // Volume in cmt
      type: line.type,
    }))
    .concat([
      {
        description: "Shed area PCC for trimix",
        nos: 1,
        length: wallStore.length,
        breadth: wallStore.breadth,
        depth: 0.1,
        area: wallStore.length * wallStore.breadth * 0.1,
      },
    ]);

  // Calculate total volume
  items.pcc_m10_grade_1_3_6.total = pccMeasurements
    .reduce((sum, m) => sum + m.area, 0)
    .toFixed(3);

  items.pcc_m10_grade_1_3_6.measurements = pccMeasurements;
};
