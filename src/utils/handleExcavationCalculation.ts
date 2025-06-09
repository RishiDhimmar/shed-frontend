import { toJS } from "mobx";
import foundationStore from "../stores/FoundationStore";
import { items } from "./sheetItems";

export const handleExcavationCalculation = (): any => {
  // Calculate dimensions for each foundation
  const dimensionsList = foundationStore.groups.flatMap((group) =>
    group.foundations.map((foundation) => {
      const points = toJS(foundation.excavationBottomPoints);

      // Extract x and y coordinates, each rounded to 3 decimal places
      const xCoords = points.map((point) => Number(point.x.toFixed(3)));
      const yCoords = points.map((point) => Number(point.y.toFixed(3)));

      // Calculate length, breadth, and depth, rounded to 3 decimal places
      const length =
        Number(
          Math.abs(Math.max(...xCoords) - Math.min(...xCoords)).toFixed(3)
        ) * 0.001;
      const breadth =
        Number(
          Math.abs(Math.max(...yCoords) - Math.min(...yCoords)).toFixed(3)
        ) * 0.001;
      const depth = Number((2.1).toFixed(3)); // Given depth, rounded to 3 decimal places

      return { length, breadth, depth };
    })
  );

  // Group by identical dimensions and count frequency
  const dimensionsMap = new Map();

  dimensionsList.forEach(({ length, breadth, depth }) => {
    // Round to 3 decimal places
    const roundedLength = Number(length.toFixed(3));
    const roundedBreadth = Number(breadth.toFixed(3));
    const roundedDepth = Number(depth.toFixed(3));

    // Use rounded values for the key
    const key = `${roundedLength}_${roundedBreadth}_${roundedDepth}`;

    dimensionsMap.set(key, {
      length: roundedLength,
      breadth: roundedBreadth,
      depth: roundedDepth,
      frequency: (dimensionsMap.get(key)?.frequency || 0) + 1,
    });
  });

  // Calculate volume for each entry and full volume
  let fullVolume = 0;
  const excavationDimensions = Array.from(dimensionsMap.values()).map(
    (entry) => {
      // Calculate volume for the entry (length * breadth * depth * frequency)
      const volume = Number(
        (entry.length * entry.breadth * entry.depth * entry.frequency).toFixed(
          3
        )
      );
      fullVolume += volume; // Add to full volume
      return {
        ...entry,
        volume, // Volume for this entry (frequency included)
      };
    }
  );

  // Round fullVolume to 3 decimal places
  fullVolume = Number(fullVolume.toFixed(3));

  const result = {
    dimensions: excavationDimensions,
    fullVolume,
  };

  items.excavation_upto_8ft_depth.measurements = excavationDimensions.map(
    (item) => {
      return {
        description: "",
        nos: item.frequency,
        length: item.length,
        breadth: item.breadth,
        depth: item.depth,
        area: item.volume,
      };
    }
  );

  items.excavation_upto_8ft_depth.total = fullVolume;

  return result;
};
