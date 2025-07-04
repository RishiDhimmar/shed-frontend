import { toJS } from "mobx";
import dxfStore from "../stores/DxfStore";
import wallStore from "../stores/WallStore";
import {
  calculateLengthBreadthArea,
  convertToPointObjects,
} from "./PolygonUtils";
import { items } from "./sheetItems";

export const handleFillingGoodSoilFromOutSide = () => {
  const internalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(
      toJS(dxfStore.internalWallPolygon.filter((p, i) => (i + 1) % 3 !== 0))
    )
  );
  console.log(internalWallResult);
  const result = Number(
    (internalWallResult.length * internalWallResult.breadth * 0.3).toFixed(3)
  );
  items.filling_good_soil_outside.measurements = [
    {
      description: "",
      nos: 1,
      length: internalWallResult.length,
      breadth: internalWallResult.breadth,
      depth: 0.3,
      area: result,
    },
  ];
  items.filling_good_soil_outside.total = result;
};
