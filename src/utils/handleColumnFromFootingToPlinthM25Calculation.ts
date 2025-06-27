// import columnStore from "../stores/ColumnStore";

// export const handleColumnFromFootingToPlinthM25Calculation = () => {
//   columnStore.polygons.map((grp) => {
//     //get the length and width from grp.data.length and grp.data.width and the depth of 2.2
//     console.log(grp);
//   });
// };

import columnStore from "../stores/ColumnStore";
import { items } from "./sheetItems";

export const handleColumnFromFootingToPlinthM25Calculation = () => {
  const DEPTH = 2.2; // From Footing Top to Plinth Level
  const measurements = [];
  let totalVolume = 0;

  columnStore.polygons.forEach((grp, index) => {
    const length = Number(grp.data.length || 0);
    const breadth = Number(grp.data.width || 0);
    const volume = parseFloat(
      ((grp.columns.length * (length * breadth * DEPTH)) / 1000000).toFixed(3)
    );

    const entry = {
      id: `column-${index}`,
      description: ``,
      nos: grp.columns.length,
      length: length.toFixed(3) / 1000,
      breadth: breadth.toFixed(3) / 1000,
      depth: DEPTH.toFixed(3),
      area: volume,
    };

    measurements.push(entry);
    totalVolume += volume;
  });

  items.column_from_footing_to_plinth_m25.measurements = measurements;
  items.column_from_footing_to_plinth_m25.total = parseFloat(
    totalVolume.toFixed(3)
  );

  return {
    totalVolume: parseFloat(totalVolume.toFixed(3)),
    measurements,
  };
};
