import { toJS } from "mobx";
import columnStore from "../stores/ColumnStore";
import { items } from "./sheetItems";

export const handleFixingAnchorJBoltOnRccColumnCalculation = () => {
  const allMeasurements = [];
  let totalCount = 0;

  const dimensionsMap = new Map();

  // Group similar bolt fixing dimensions (based on length and width of column top)
  toJS(columnStore.polygons).forEach((column, index) => {
    const length = Number((column.data?.length || 0).toFixed(3));
    const breadth = Number((column.data?.width || 0).toFixed(3));

    const key = `${length}_${breadth}`;

    if (dimensionsMap.has(key)) {
      dimensionsMap.get(key).frequency += 1;
    } else {
      dimensionsMap.set(key, {
        length,
        breadth,
        frequency: 1,
      });
    }
  });

  // Convert grouped entries to measurements
  const groupedMeasurements = Array.from(dimensionsMap.values()).map(
    (entry, index) => {
      const count = entry.frequency;
      totalCount += count;

      const measurement = {
        id: `jbolt-group-${index}`,
        description: "",
        nos: count,
        length: 0,
        breadth: 0,
        depth: 0, // no depth, since it’s not volume-based
        area: 0, // using 'area' to store quantity
      };

      allMeasurements.push(measurement);
      return measurement;
    }
  );

  items.fixing_anchor_jbolt_on_rcc_column.measurements = allMeasurements;
  items.fixing_anchor_jbolt_on_rcc_column.total = totalCount;

  return {
    grouped: groupedMeasurements,
    allMeasurements,
    totalCount,
  };
};
