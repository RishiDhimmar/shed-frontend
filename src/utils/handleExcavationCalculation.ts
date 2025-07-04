// import { toJS } from "mobx";
// import foundationStore from "../stores/FoundationStore";
// import { items } from "./sheetItems";
// import configStore from "../stores/ConfigStore";

// export const handleExcavationCalculation = (): any => {
//   // Calculate dimensions for each foundation
//   const dimensionsList = foundationStore.groups.flatMap((group) =>
//     group.foundations.map((foundation) => {
//       const points = toJS(foundation.excavationBottomPoints);

//       // Extract x and y coordinates, each rounded to 3 decimal places
//       const xCoords = points.map((point) => Number(point.x.toFixed(3)));
//       const yCoords = points.map((point) => Number(point.y.toFixed(3)));

//       // Calculate length, breadth, and depth, rounded to 3 decimal places
//       const length =
//         Number(
//           Math.abs(Math.max(...xCoords) - Math.min(...xCoords)).toFixed(3)
//         ) * 0.001;
//       const breadth =
//         Number(
//           Math.abs(Math.max(...yCoords) - Math.min(...yCoords)).toFixed(3)
//         ) * 0.001;
//       const depth = Number(configStore.shed3D.heights.EXCAVATION.toFixed(3)); // Given depth, rounded to 3 decimal places

//       return { length, breadth, depth };
//     })
//   );

//   // Group by identical dimensions and count frequency
//   const dimensionsMap = new Map();

//   dimensionsList.forEach(({ length, breadth, depth }) => {
//     // Round to 3 decimal places
//     const roundedLength = Number(length.toFixed(3));
//     const roundedBreadth = Number(breadth.toFixed(3));
//     const roundedDepth = Number(depth.toFixed(3));

//     // Use rounded values for the key
//     const key = `${roundedLength}_${roundedBreadth}_${roundedDepth}`;

//     dimensionsMap.set(key, {
//       length: roundedLength,
//       breadth: roundedBreadth,
//       depth: roundedDepth,
//       frequency: (dimensionsMap.get(key)?.frequency || 0) + 1,
//     });
//   });

//   // Calculate volume for each entry and full volume
//   let fullVolume = 0;
//   const excavationDimensions = Array.from(dimensionsMap.values()).map(
//     (entry) => {
//       // Calculate volume for the entry (length * breadth * depth * frequency)
//       const volume = Number(
//         (entry.length * entry.breadth * entry.depth * entry.frequency).toFixed(
//           3
//         )
//       );
//       fullVolume += volume; // Add to full volume
//       return {
//         ...entry,
//         volume, // Volume for this entry (frequency included)
//       };
//     }
//   );

//   // Round fullVolume to 3 decimal places
//   fullVolume = Number(fullVolume.toFixed(3));

//   const result = {
//     dimensions: excavationDimensions,
//     fullVolume,
//   };

//   items.excavation_upto_8ft_depth.measurements = excavationDimensions.map(
//     (item) => {
//       return {
//         id: item.length + "_" + item.breadth + "_" + item.depth,
//         description: "",
//         nos: item.frequency,
//         length: item.length,
//         breadth: item.breadth,
//         depth: item.depth,
//         area: item.volume,
//       };
//     }
//   );

//   console.log(items.excavation_upto_8ft_depth.measurements);

//   items.excavation_upto_8ft_depth.total = fullVolume;

//   return result;
// };

import { toJS } from "mobx";
import foundationStore from "../stores/FoundationStore";
import { items } from "./sheetItems";
import configStore from "../stores/ConfigStore";
import {
  calculateLengthBreadthArea,
  convertToPointObjects,
} from "./PolygonUtils";
import dxfStore from "../stores/DxfStore";

export const handleExcavationCalculation = (): any => {
  let fullVolume = 0;
  const allMeasurements = [];
  const DEPTH = 0.15;

  // Process each group separately
  const groupedExcavationDimensions = foundationStore.groups.map(
    (group, groupIndex) => {
      const dimensionsMap = new Map();

      group.foundations.forEach((foundation) => {
        const points = toJS(foundation.excavationBottomPoints);
        const xCoords = points.map((p) => Number(p.x.toFixed(3)));
        const yCoords = points.map((p) => Number(p.y.toFixed(3)));

        const length =
          Number(
            Math.abs(Math.max(...xCoords) - Math.min(...xCoords)).toFixed(3)
          ) * 0.001;
        const breadth =
          Number(
            Math.abs(Math.max(...yCoords) - Math.min(...yCoords)).toFixed(3)
          ) * 0.001;
        const depth = 0.21;

        const key = `${length}_${breadth}_${depth}`;

        if (dimensionsMap.has(key)) {
          dimensionsMap.get(key).frequency += 1;
        } else {
          dimensionsMap.set(key, {
            length,
            breadth,
            depth,
            frequency: 1,
            name: group.name,
          });
        }
      });

      // Prepare the list of dimension entries for this group
      const groupMeasurements = Array.from(dimensionsMap.values()).map(
        (entry, index) => {
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
            description: group.name,
            // description: "Foundation Excavation",

            nos: entry.frequency,
            length: Number(entry.length.toFixed(3)), // Use rounded length for the itementry.length,
            breadth: Number(entry.breadth.toFixed(3)), // Use rounded breadth for the entry.breadth,
            depth: Number(entry.depth.toFixed(3)), // Use rounded depth for the entry.depth,
            area: Number(volume.toFixed(3)), // Use rounded volume for the entry.volume,
          };

          allMeasurements.push(item);
          return item;
        }
      );

      return groupMeasurements;
    }
  );

  // Update sheet items
  items.excavation_upto_8ft_depth.measurements = allMeasurements;
  items.excavation_upto_8ft_depth.total = Number(fullVolume.toFixed(3));

  const externalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(toJS(dxfStore.externalWallPolygon))
  );

  // Add brickwork volume using length and breadth of external wall with fixed depth 0.23
  const lengthVolume = parseFloat(
    (externalWallResult.length * 0.6 * DEPTH).toFixed(3)
  );
  const widthVolume = parseFloat(
    (externalWallResult.breadth * 0.6 * DEPTH).toFixed(3)
  );

  //empty space
  items.excavation_upto_8ft_depth.measurements.push({
    id: "empty_space",
    description: "",
    nos: 0,
    length: 0,
    breadth: 0,
    depth: 0,
    area: 0 * 0 * 0,
  });

  externalWallResult.length =
    Number(externalWallResult.length.toFixed(3)) + 0.075 + 0.075;
  externalWallResult.breadth =
    Number(externalWallResult.breadth.toFixed(3)) + 0.075 + 0.075;

  items.excavation_upto_8ft_depth.measurements.push({
    id: "brickwork",
    description: "GB",
    nos: 1,
    length: Number(Number(externalWallResult.length).toFixed(3)),
    breadth: 0.6,
    depth: DEPTH,
    area: Number(Number(externalWallResult.length * 0.6 * DEPTH).toFixed(3)),
  });

  items.excavation_upto_8ft_depth.measurements.push({
    id: "brickwork",
    description: "GB",
    nos: 1,
    length: Number(Number(externalWallResult.breadth).toFixed(3)),
    breadth: 0.6,
    depth: DEPTH,
    area: Number(Number(externalWallResult.breadth * 0.6 * DEPTH).toFixed(3)),
  });

  items.excavation_upto_8ft_depth.total = Number(
    (
      items.excavation_upto_8ft_depth.total +
      lengthVolume +
      widthVolume
    ).toFixed(3)
  );

  return {
    grouped: groupedExcavationDimensions, // nested grouped result
    allMeasurements,
    fullVolume: Number(fullVolume.toFixed(3)),
  };
};
