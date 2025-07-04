import { toJS } from "mobx";
import {
  calculateLengthBreadthArea,
  convertToPointObjects,
} from "./PolygonUtils";
import dxfStore from "../stores/DxfStore";
import { items } from "./sheetItems";
import wallStore from "../stores/WallStore";

const handleTrimixHardenerSpreadingCalculation = () => {
  const internalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(
      dxfStore.internalWallPolygon.filter((p, i) => (i + 1) % 3 !== 0)
    )
  );
  const result = Number(
    (internalWallResult.length * internalWallResult.breadth).toFixed(3)
  );
  items.trimix_hardener_spreading.measurements = [
    {
      description: "",
      nos: 1,
      length: internalWallResult.length,
      breadth: internalWallResult.breadth,
      depth: 1,
      area: result,
    },
  ];
  items.trimix_hardener_spreading.total = result;
  // items.trimix_hardener_spreading.total = items.trimix_hardener_spreading.total.toFixed(4);
};

export default handleTrimixHardenerSpreadingCalculation;
