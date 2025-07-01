import baseplateStore from "../stores/BasePlateStore";
import configStore from "../stores/ConfigStore";
import wallStore from "../stores/WallStore";
import { items } from "./sheetItems";

const handlePccMullionColumnCalculation = () => {
  const totalMC =
    baseplateStore.cornerBasePlates.length +
    baseplateStore.edgeBasePlates.length;

  const measurements = [];

  measurements.push({
    id: "deductions",
    description: "PCC for mullion columns",
    nos: totalMC,
    length: wallStore.wallThickness / 1000,
    breadth: wallStore.wallThickness / 1000,
    depth: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
    area:
      totalMC *
      (wallStore.wallThickness / 1000) *
      configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT *
      configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
  });

  items.pcc_mullion_column.measurements = measurements;
  items.pcc_mullion_column.total = measurements
    .reduce((sum, m) => sum + m.area, 0)
    .toFixed(3);
};

export default handlePccMullionColumnCalculation;
