// import columnStore from "../stores/ColumnStore";

// export const handleColumnFromFootingToPlinthM25Calculation = () => {
//   columnStore.polygons.map((grp) => {
//     //get the length and width from grp.data.length and grp.data.width and the depth of 2.2
//     console.log(grp);
//   });
// };

import columnStore from "../stores/ColumnStore";
import configStore from "../stores/ConfigStore";
import { items } from "./sheetItems";

export const handleColumnFromFootingToPlinthM25Calculation = () => {
  const DEPTH =
    2.1 - configStore.shed3D.heights.FRUSTUM - configStore.shed3D.heights.RCC; // From Footing Top to Plinth Level
  const measurements = [];
  let totalVolume = 0;

  columnStore.polygons.forEach((grp, index) => {
    const length = Number(grp.data.length + 80 || 0);
    const breadth = Number(grp.data.width + 80 || 0);
    const volume = parseFloat(
      ((grp.columns.length * (length * breadth * DEPTH)) / 1000000).toFixed(3)
    );

    const entry = {
      id: `column-${index}`,
      description: "Column from footing to plinth",
      nos: grp.columns.length,
      length: Number(length.toFixed(3)) / 1000,
      breadth: Number(breadth.toFixed(3)) / 1000,
      depth: Number(DEPTH.toFixed(3)),
      area: Number(volume.toFixed(3)), // volume,
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
