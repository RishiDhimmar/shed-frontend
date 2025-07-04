// // import dxfStore from "../stores/DxfStore";
// // import wallStore from "../stores/WallStore";
// // import { convertToPointObjects } from "./PolygonUtils";
// // import { items } from "./sheetItems";

// // export const handlePccCalculation = () => {
// //   const points = convertToPointObjects(dxfStore.externalWallPolygon);
// //   const TOLERANCE = 0.001;
// //   const BREADTH = 0.38; // meters
// //   const DEPTH = 0.1; // meters

// //   // Classify lines
// //   const classifyLines = (points) => {
// //     const lines = [];
// //     for (let i = 0; i < points.length; i++) {
// //       const p1 = points[i];
// //       const p2 = points[(i + 1) % points.length]; // Connect last point to first
// //       const dx = Math.abs(p1.x - p2.x);
// //       const dy = Math.abs(p1.y - p2.y);
// //       const length = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) / 1000; // Convert mm to m

// //       let type;
// //       if (dx < TOLERANCE && dy >= TOLERANCE) {
// //         type = "vertical";
// //       } else if (dy < TOLERANCE && dx >= TOLERANCE) {
// //         type = "horizontal";
// //       } else {
// //         type = "diagonal";
// //       }

// //       // Calculate volume (Length × Breadth × Depth)
// //       const volume = length * BREADTH * DEPTH;

// //       lines.push({
// //         start: p1,
// //         end: p2,
// //         type,
// //         length,
// //         volume,
// //         index: i,
// //       });
// //     }
// //     return lines;
// //   };

// //   const lines = classifyLines(points);

// //   // Filter out zero-length lines
// //   const validLines = lines.filter((line) => line.length > TOLERANCE);

// //   // Group by type and format as measurements
// //   const pccMeasurements = validLines
// //     .map((line) => ({
// //       description: `${line.type}`,
// //       nos: 1, // Each line is a single segment
// //       length: Number(line.length.toFixed(3)),
// //       breadth: BREADTH,
// //       depth: DEPTH,
// //       area: Number(line.volume.toFixed(3)), // Volume in cmt
// //       type: line.type,
// //     }))
// //     .concat([
// //       {
// //         description: "Shed area PCC for trimix",
// //         nos: 1,
// //         length: wallStore.length,
// //         breadth: wallStore.breadth,
// //         depth: 0.1,
// //         area: wallStore.length * wallStore.breadth * 0.1,
// //       },
// //     ]);

// //   // Calculate total volume
// //   items.pcc_m10_grade_1_3_6.total = pccMeasurements
// //     .reduce((sum, m) => sum + m.area, 0)
// //     .toFixed(3);

// //   items.pcc_m10_grade_1_3_6.measurements = pccMeasurements;
// // };

// import dxfStore from "../stores/DxfStore";
// import wallStore from "../stores/WallStore";
// import { convertToPointObjects } from "./PolygonUtils";
// import { items } from "./sheetItems";

// export const handlePccCalculation = () => {
//   const points = convertToPointObjects(dxfStore.externalWallPolygon);
//   const TOLERANCE = 0.001;
//   const BREADTH = 0.38; // meters
//   const DEPTH = 0.1; // meters

//   const classifyLines = (points) => {
//     const lines = [];
//     for (let i = 0; i < points.length; i++) {
//       const p1 = points[i];
//       const p2 = points[(i + 1) % points.length];
//       const dx = Math.abs(p1.x - p2.x);
//       const dy = Math.abs(p1.y - p2.y);
//       const length = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) / 1000;

//       let type;
//       if (dx < TOLERANCE && dy >= TOLERANCE) {
//         type = "vertical";
//       } else if (dy < TOLERANCE && dx >= TOLERANCE) {
//         type = "horizontal";
//       } else {
//         type = "diagonal";
//       }

//       const volume = length * BREADTH * DEPTH;

//       lines.push({
//         start: p1,
//         end: p2,
//         type,
//         length,
//         volume,
//         index: i,
//       });
//     }
//     return lines;
//   };

//   const lines = classifyLines(points);
//   const validLines = lines.filter((line) => line.length > TOLERANCE);

//   const pccMeasurements = validLines.map((line) => ({
//     description: `${line.type}`,
//     nos: 1,
//     length: Number(line.length.toFixed(3)),
//     breadth: BREADTH,
//     depth: DEPTH,
//     area: Number(line.volume.toFixed(3)),
//     type: line.type,
//   }));

//   // Add existing shed area PCC for trimix (0.1m depth)
//   const trimixArea = wallStore.length * wallStore.breadth;
//   pccMeasurements.push({
//     description: "Shed area PCC for trimix",
//     nos: 1,
//     length: wallStore.length,
//     breadth: wallStore.breadth,
//     depth: 0.1,
//     area: Number((trimixArea * 0.1).toFixed(3)),
//   });

//   // Add appended entry with 0.125m depth
//   pccMeasurements.push({
//     description: "Shed area PCC with 0.125m depth",
//     nos: 1,
//     length: wallStore.length,
//     breadth: wallStore.breadth,
//     depth: 0.125,
//     area: Number((trimixArea * 0.125).toFixed(3)),
//   });

//   // Calculate total volume
//   items.pcc_m10_grade_1_3_6.measurements = pccMeasurements;
//   items.pcc_m10_grade_1_3_6.total = pccMeasurements
//     .reduce((sum, m) => sum + m.area, 0)
//     .toFixed(3);
// };
import { toJS } from "mobx";
import foundationStore from "../stores/FoundationStore";
import wallStore from "../stores/WallStore";
import { items } from "./sheetItems";
import { convertToPointObjects } from "./PolygonUtils";
import dxfStore from "../stores/DxfStore";

export const handlePccCalculation = () => {
  const DEPTH = 0.125;
  let fullVolume = 0;
  const allMeasurements = [];

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

    // Shoelace formula
    let area = 0;
    const n = scaledPoints.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += scaledPoints[i].x * scaledPoints[j].y;
      area -= scaledPoints[j].x * scaledPoints[i].y;
    }
    area = Math.abs(area) / 2;

    return {
      length: parseFloat(length.toFixed(4)) + 0.075 + 0.075,
      breadth: parseFloat(breadth.toFixed(4)) + 0.075 + 0.075,
      area: parseFloat((area * DEPTH).toFixed(4)), // volume from area * depth
    };
  };

  // 1. PCC from foundation excavation areas
  const groupedPccDimensions = foundationStore.groups.map(
    (group, groupIndex) => {
      const dimensionsMap = new Map();

      group.foundations.forEach((foundation) => {
        const points = toJS(foundation.excavationBottomPoints);
        const xCoords = points.map((p) => Number(p.x.toFixed(3)));
        const yCoords = points.map((p) => Number(p.y.toFixed(3)));

        const length =
          Number((Math.max(...xCoords) - Math.min(...xCoords)).toFixed(3)) *
          0.001;
        const breadth =
          Number((Math.max(...yCoords) - Math.min(...yCoords)).toFixed(3)) *
          0.001;

        const key = `${length}_${breadth}_${DEPTH}`;

        if (dimensionsMap.has(key)) {
          dimensionsMap.get(key).frequency += 1;
        } else {
          dimensionsMap.set(key, {
            length,
            breadth,
            depth: DEPTH,
            frequency: 1,
          });
        }
      });

      return Array.from(dimensionsMap.values()).map((entry, index) => {
        const volume = Number(
          (
            entry.length *
            entry.breadth *
            entry.depth *
            entry.frequency
          ).toFixed(3)
        );
        fullVolume += volume;

        const item = {
          id: `group-${groupIndex}-item-${index}`,
          description: group.name || "Foundation PCC",
          nos: entry.frequency,
          length: Number(entry.length.toFixed(3)), // entry.length,
          breadth: Number(entry.breadth.toFixed(3)), // entry.breadth,
          depth: Number(entry.depth.toFixed(3)), // entry.depth,
          area: Number(volume.toFixed(3)), // volume,
        };

        allMeasurements.push(item);
        return item;
      });
    }
  );

  //empty entries
  const empty = {
    id: "empty",
    description: "",
    nos: 0,
    length: 0,
    breadth: 0,
    depth: 0,
    area: 0,
  };
  allMeasurements.push(empty);
  const label = {
    id: "label",
    description: "P.C.C (1:4:8) for Ground Beam ",
    nos: 0,
    length: 0,
    breadth: 0,
    depth: 0,
    area: 0,
  };
  allMeasurements.push(label);
  allMeasurements.push(empty);

  const externalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(toJS(dxfStore.externalWallPolygon))
  );

  // 2. Add Shed Length PCC (externalWallResult.length × 0.6 × 0.1)
  const lengthPccVolume = Number(
    (externalWallResult.length * 0.6 * 0.1).toFixed(3)
  );
  fullVolume += lengthPccVolume;

  allMeasurements.push({
    id: "shed-length-pcc",
    description: "Shed Length PCC (0.6m × 0.1m)",
    nos: 1,
    length: Number(externalWallResult.length.toFixed(3)), // externalWallResult.length,
    breadth: 0.6,
    depth: 0.1,
    area: lengthPccVolume,
  });

  // 3. Add Shed Width PCC (externalWallResult.breadth × 0.6 × 0.1)
  const widthPccVolume = Number(
    (externalWallResult.breadth * 0.6 * 0.1).toFixed(3)
  );
  fullVolume += widthPccVolume;

  allMeasurements.push({
    id: "shed-width-pcc",
    description: "Shed Width PCC (0.6m × 0.1m)",
    nos: 1,
    length: Number(externalWallResult.breadth.toFixed(3)), // externalWallResult.breadth,
    breadth: 0.6,
    depth: 0.1,
    area: widthPccVolume,
  });

  // Final assignment
  items.pcc_m10_grade_1_3_6.measurements = allMeasurements;
  items.pcc_m10_grade_1_3_6.total = Number(fullVolume.toFixed(3));

  return {
    grouped: groupedPccDimensions,
    allMeasurements,
    fullVolume: Number(fullVolume.toFixed(3)),
  };
};
