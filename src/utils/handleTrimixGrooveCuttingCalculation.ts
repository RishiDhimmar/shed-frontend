import dxfStore from "../stores/DxfStore";
import {
  calculateLengthBreadthArea,
  convertToPointObjects,
} from "./PolygonUtils";
import { items } from "./sheetItems";

const handleTrimixGrooveCuttingCalculation = () => {
  console.log(
    calculateLengthBreadthArea(
      convertToPointObjects(dxfStore.externalWallPolygon)
    )
  );

  // calc width / 6 - 1 and length / 6 - 1 add entries

  const { breadth, length } = calculateLengthBreadthArea(
    convertToPointObjects(dxfStore.externalWallPolygon)
  );
  console.log(breadth, length);
  const measurements = [];

  // 1st entry

  measurements.push({
    id: "1",
    description: "",
    nos: Math.floor(length / 6 - 1),
    length: breadth,
    // breadth: width / 6 - 1,
    // depth: 0.1,
    area: Math.floor(length / 6 - 1) * breadth,
  });
  measurements.push({
    id: "2",
    description: "",
    nos: Math.floor(breadth / 6 - 1),
    length: length,
    // breadth: width / 6 - 1,
    // depth: 0.1,
    area: Math.floor(breadth / 6 - 1) * length,
  });
  const total = Number(
    measurements.reduce((sum, m) => sum + m.area, 0).toFixed(3)
  );
  items.trimix_groove_cutting.measurements = measurements;
  items.trimix_groove_cutting.total = total;
};

export default handleTrimixGrooveCuttingCalculation;
