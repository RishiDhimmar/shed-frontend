import wallStore from "../stores/WallStore";
import { items } from "./sheetItems";

export const handleFillingGoodSoilFromOutSide = () => {
  items.filling_good_soil_outside.measurements = [
    {
      description: "Filling with good soil brought from outside",
      nos: 0,
      length: wallStore.length,
      breadth: wallStore.breadth,
      depth: 0.15,
      area: wallStore.length * wallStore.breadth * 0.15,
    },
  ]
};
