import { toJS } from "mobx";
import {
  calculateLengthBreadthArea,
  convertToPointObjects,
} from "./PolygonUtils";
import dxfStore from "../stores/DxfStore";
import { items } from "./sheetItems";

export const handleGradeSlabM25WithTrimixCalculation = () => {
  const DEPTH = 0.15;
  const internalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(
      dxfStore.internalWallPolygon.filter((p, i) => (i + 1) % 3 !== 0)
    )
  );
  const result = Number(
    (internalWallResult.length * internalWallResult.breadth * DEPTH).toFixed(3)
  );
  items.grade_slab_m25_with_trimix.measurements = [
    {
      description: "",
      nos: 1,
      length: internalWallResult.length,
      breadth: internalWallResult.breadth,
      depth: DEPTH,
      area: result,
    },
  ];
  items.grade_slab_m25_with_trimix.total = result;
};
