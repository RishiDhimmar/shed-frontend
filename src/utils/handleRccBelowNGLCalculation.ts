// // export const handleRccBelowNGLCalculation = () => {};

// import { toJS } from "mobx";
// import foundationStore from "../stores/FoundationStore";
// import { items } from "./sheetItems";
// import configStore from "../stores/ConfigStore";

// export const handleRccBelowNGLCalculation = () => {
//   const CUBOID_DEPTH = configStore.shed3D.heights.RCC; // Example RCC footing depth, adjust as needed
//   const FRUSTUM_DEPTH = configStore.shed3D.heights.FRUSTUM;

//   let fullVolume = 0;
//   const allMeasurements = [];

//   const calculateLengthBreadthVolume = (points) => {
//     if (!points || points.length < 3) return { length: 0, breadth: 0, area: 0 };

//     const scaledPoints = points.map((p) => ({
//       x: p.x * 0.001,
//       y: p.y * 0.001,
//     }));

//     const xs = scaledPoints.map((p) => p.x);
//     const ys = scaledPoints.map((p) => p.y);
//     const length = Math.max(...xs) - Math.min(...xs);
//     const breadth = Math.max(...ys) - Math.min(...ys);

//     const n = scaledPoints.length;
//     let area = 0;
//     for (let i = 0; i < n; i++) {
//       const j = (i + 1) % n;
//       area += scaledPoints[i].x * scaledPoints[j].y;
//       area -= scaledPoints[j].x * scaledPoints[i].y;
//     }
//     area = Math.abs(area) / 2;

//     return {
//       length: parseFloat(length.toFixed(4)),
//       breadth: parseFloat(breadth.toFixed(4)),
//       area: parseFloat((area * CUBOID_DEPTH).toFixed(4)), // volume
//     };
//   };

//   // 1. RCC from foundation rccPoints
//   const groupedRccDimensions = foundationStore.groups.map(
//     (group, groupIndex) => {
//       const dimensionsMap = new Map();

//       group.foundations.forEach((foundation) => {
//         const points = toJS(foundation.outerFoundationPoints);
//         if (!points) return;
//         const xCoords = points.map((p) => Number(p.x.toFixed(3)));
//         const yCoords = points.map((p) => Number(p.y.toFixed(3)));

//         const length =
//           Number((Math.max(...xCoords) - Math.min(...xCoords)).toFixed(3)) *
//           0.001;
//         const breadth =
//           Number((Math.max(...yCoords) - Math.min(...yCoords)).toFixed(3)) *
//           0.001;

//         const key = `${length}_${breadth}_${CUBOID_DEPTH}`;

//         if (dimensionsMap.has(key)) {
//           dimensionsMap.get(key).frequency += 1;
//         } else {
//           dimensionsMap.set(key, {
//             length,
//             breadth,
//             depth: CUBOID_DEPTH,
//             frequency: 1,
//           });
//         }
//       });

//       return Array.from(dimensionsMap.values()).map((entry, index) => {
//         const volume = Number(
//           (
//             entry.length *
//             entry.breadth *
//             entry.depth *
//             entry.frequency
//           ).toFixed(3)
//         );
//         fullVolume += volume;

//         const item = {
//           id: `rcc-group-${groupIndex}-item-${index}`,
//           description: "",
//           nos: entry.frequency,
//           length: entry.length,
//           breadth: entry.breadth,
//           depth: entry.depth,
//           area: volume,
//         };

//         allMeasurements.push(item);
//         return item;
//       });
//     }
//   );

//   // Final assignment
//   items.rcc_below_ngl_footing_m25.measurements = allMeasurements;
//   items.rcc_below_ngl_footing_m25.total = Number(fullVolume.toFixed(3));

//   return {
//     grouped: groupedRccDimensions,
//     allMeasurements,
//     fullVolume: Number(fullVolume.toFixed(3)),
//   };
// };
import { toJS } from "mobx";
import foundationStore from "../stores/FoundationStore";
import { items } from "./sheetItems";
import configStore from "../stores/ConfigStore";

export const handleRccBelowNGLCalculation = () => {
  const RCC_DEPTH = configStore.shed3D.heights.RCC;
  const FRUSTUM_DEPTH = configStore.shed3D.heights.FRUSTUM;

  let fullVolume = 0;
  const allMeasurements = [];

  const getArea = (points) => {
    if (!points || points.length < 3) return 0;
    const scaled = points.map((p) => ({ x: p.x * 0.001, y: p.y * 0.001 }));
    let area = 0;
    for (let i = 0; i < scaled.length; i++) {
      const j = (i + 1) % scaled.length;
      area += scaled[i].x * scaled[j].y - scaled[j].x * scaled[i].y;
    }
    return Math.abs(area / 2);
  };

  // Grouped by foundationStore.groups
  const groupedRccDimensions = foundationStore.groups.map(
    (group, groupIndex) => {
      let groupVolume = 0;
      let count = 0;

      group.foundations.forEach((foundation) => {
        const outer = toJS(foundation.outerFoundationPoints);
        const inner = toJS(foundation.innerFoundationPoints);
        if (!outer || !inner) return;

        const A1 = getArea(inner);
        const A2 = getArea(outer);

        const cuboidVol = A2 * RCC_DEPTH;
        const frustumVol =
          (1 / 3) * FRUSTUM_DEPTH * (A1 + A2 + Math.sqrt(A1 * A2));
        const totalVolume = cuboidVol + frustumVol;

        groupVolume += totalVolume;
        count += 1;
      });

      fullVolume += groupVolume;

      const item = {
        id: `rcc-group-${groupIndex}`,
        description: "Foundation RCC",
        nos: count,
        length: 0,
        breadth: Number(Number(groupVolume / count).toFixed(3)),
        depth: 0,
        area: Number(groupVolume.toFixed(3)),
      };

      allMeasurements.push(item);
      return [item]; // maintain same structure
    }
  );

  // Final assignment to sheet
  items.rcc_below_ngl_footing_m25.measurements = allMeasurements;
  items.rcc_below_ngl_footing_m25.total = Number(fullVolume.toFixed(3));

  return {
    grouped: groupedRccDimensions,
    allMeasurements,
    fullVolume: Number(fullVolume.toFixed(3)),
  };
};
