import { items } from "./sheetItems";

const handleTrimixGrooveCuttingCalculation = () => {
  const item = {
    id: "",
    description: "",
    nos: 0,
    length: 0,
    breadth: 0.15,
    depth: 0,
    area: 0,
  };

  items.trimix_groove_cutting.measurements = [item];
  items.trimix_groove_cutting.total = item.area;
};

export default handleTrimixGrooveCuttingCalculation;
