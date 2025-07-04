// import { toJS } from "mobx";
// import dxfStore from "../stores/DxfStore";
// import { convertToPointObjects } from "./PolygonUtils";
// import { items } from "./sheetItems";
// import wallStore from "../stores/WallStore";
// import foundationStore from "../stores/FoundationStore";

// export const handleRubbleSoilingCalculation = () => {
//   // Helper function to calculate length, breadth, and area
//   const calculateLengthBreathArea = (points) => {
//     if (!points || points.length < 3) {
//       return {
//         length: 0,
//         breadth: 0,
//         area: 0,
//         error: "Invalid polygon: At least 3 points required",
//       };
//     }

//     // Scale points by 0.001
//     const scaledPoints = points.map((point) => ({
//       x: point.x * 0.001,
//       y: point.y * 0.001,
//     }));

//     // Calculate bounding box for length and breadth
//     let minX = scaledPoints[0].x;
//     let maxX = scaledPoints[0].x;
//     let minY = scaledPoints[0].y;
//     let maxY = scaledPoints[0].y;

//     scaledPoints.forEach((point) => {
//       minX = Math.min(minX, point.x);
//       maxX = Math.max(maxX, point.x);
//       minY = Math.min(minY, point.y);
//       maxY = Math.max(maxY, point.y);
//     });

//     const length = maxX - minX;
//     const breadth = maxY - minY;

//     // Calculate area using Shoelace formula
//     let area = 0;
//     const n = scaledPoints.length;

//     for (let i = 0; i < n; i++) {
//       const j = (i + 1) % n; // Next vertex, wraps around to 0
//       area += scaledPoints[i].x * scaledPoints[j].y;
//       area -= scaledPoints[j].x * scaledPoints[i].y;
//     }

//     area = Math.abs(area) / 2;

//     return {
//       length: parseFloat(length.toFixed(4)),
//       breadth: parseFloat(breadth.toFixed(4)),
//       area: parseFloat((area * 0.2).toFixed(4)),
//     };
//   };

//   const result = calculateLengthBreathArea(
//     convertToPointObjects(toJS(dxfStore.externalWallPolygon))
//   );

//  let fullVolume = 0;
//   const allMeasurements = [];

//   const groupedExcavationDimensions = foundationStore.groups.map(
//     (group, groupIndex) => {
//       const dimensionsMap = new Map();

//       group.foundations.forEach((foundation) => {
//         const points = toJS(foundation.excavationBottomPoints);
//         const xCoords = points.map((p) => Number(p.x.toFixed(3)));
//         const yCoords = points.map((p) => Number(p.y.toFixed(3)));

//         const length =
//           Number(
//             Math.abs(Math.max(...xCoords) - Math.min(...xCoords)).toFixed(3)
//           ) * 0.001;
//         const breadth =
//           Number(
//             Math.abs(Math.max(...yCoords) - Math.min(...yCoords)).toFixed(3)
//           ) * 0.001;
//         const depth = Number((2.3).toFixed(3));

//         const key = `${length}_${breadth}_${depth}`;

//         if (dimensionsMap.has(key)) {
//           dimensionsMap.get(key).frequency += 1;
//         } else {
//           dimensionsMap.set(key, {
//             length,
//             breadth,
//             depth,
//             frequency: 1,
//           });
//         }
//       });

//       // Prepare the list of dimension entries for this group
//       const groupMeasurements = Array.from(dimensionsMap.values()).map(
//         (entry, index) => {
//           const volume = Number(
//             (
//               entry.length *
//               entry.breadth *
//               entry.depth *
//               entry.frequency
//             ).toFixed(3)
//           );
//           fullVolume += volume;

//           const item = {
//             id: `group-${groupIndex}-item-${index}`,
//             description: "",
//             nos: entry.frequency,
//             length: entry.length,
//             breadth: entry.breadth,
//             depth: entry.depth,
//             area: volume,
//           };

//           allMeasurements.push(item);
//           return item;
//         }
//       );

//       return groupMeasurements;
//     })

//   items.rubble_solling_at_plinth_lvl.measurements = [
//     {
//       description: "soling for grade slab",
//       nos: 1,
//       length: result.length,
//       breadth: result.breadth,
//       depth: 0.23,
//       area: result.area,
//     },
//   ];
//   items.rubble_solling_at_plinth_lvl.total = result.area;

//   wallStore.length = result.length;
//   wallStore.breadth = result.breadth;
//   wallStore.area = result.area;
// };

import { toJS } from "mobx";
import dxfStore from "../stores/DxfStore";
import {
  calculateLengthBreadthArea,
  convertToPointObjects,
} from "./PolygonUtils";
import { items } from "./sheetItems";
import wallStore from "../stores/WallStore";
import foundationStore from "../stores/FoundationStore";

export const handleRubbleSoilingCalculation = () => {
  const DEPTH = 0.23;

  const internalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(
      dxfStore.internalWallPolygon.filter((p, i) => (i + 1) % 3 !== 0)
    )
  );

  let fullVolume = internalWallResult.area;
  const allMeasurements = [];

  // Include foundation group-based rubble soling
  const groupedRubbleSolingDimensions = foundationStore.groups.map(
    (group, groupIndex) => {
      const dimensionsMap = new Map();

      group.foundations.forEach((foundation) => {
        const points = toJS(foundation.ppcPoints);
        const xCoords = points.map((p) => Number(p.x.toFixed(3)));
        const yCoords = points.map((p) => Number(p.y.toFixed(3)));

        const length =
          Number((Math.max(...xCoords) - Math.min(...xCoords)).toFixed(3)) *
          0.001;
        const breadth =
          Number((Math.max(...yCoords) - Math.min(...yCoords)).toFixed(3)) *
          0.001;
        const depth = DEPTH;

        const key = `${length}_${breadth}_${depth}`;

        if (dimensionsMap.has(key)) {
          dimensionsMap.get(key).frequency += 1;
        } else {
          dimensionsMap.set(key, {
            length,
            breadth,
            depth,
            frequency: 1,
          });
        }
      });

      // Convert to item entries
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
          // description: "Foundation Rubble Soiling",
          description: group.name,

          nos: entry.frequency,

          length: Number(entry.length.toFixed(3)),
          breadth: Number(entry.breadth.toFixed(3)), //entry.breadth,
          depth: Number(entry.depth.toFixed(3)), //entry.depth,
          area: Number(volume.toFixed(3)), //volume,
        };

        allMeasurements.push(item);
        return item;
      });
    }
  );

  //empty entry
  allMeasurements.push({
    id: `empty`,
    description: " ",
    nos: 0,
    length: 0,
    breadth: 0,
    depth: 0,
    area: 0,
  });

  console.log(wallStore.wallThickness);
  // Include grade slab soling entry
  allMeasurements.push({
    id: `external-wall-soling`,
    description: "plinth lvl",
    nos: 1,
    length: Number(Number(internalWallResult.length).toFixed(3)),
    breadth: Number(Number(internalWallResult.breadth).toFixed(3)),
    depth: DEPTH,
    area: Number(
      (internalWallResult.length * internalWallResult.breadth * DEPTH).toFixed(
        3
      )
    ),
  });

  // Finalize
  items.rubble_solling_at_plinth_lvl.measurements = allMeasurements;
  items.rubble_solling_at_plinth_lvl.total = Number(fullVolume.toFixed(3));

  // wallStore.length = internalWallResult.length;
  // wallStore.breadth = internalWallResult.breadth;
  // wallStore.area = internalWallResult.area;

  return {
    grouped: groupedRubbleSolingDimensions,
    allMeasurements,
    fullVolume: Number(fullVolume.toFixed(3)),
  };
};
