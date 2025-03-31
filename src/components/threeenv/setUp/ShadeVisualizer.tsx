import wallStore from "../../../stores/WallStore";
import BasePlateVisualizer from "./BasePlateVisualizer";
import ColumnVisualizer from "./ColumnVisualizer";
import MullionColumnVisualizer from "./MullionColumnVisualizer";
import FoundationVisualizer from "./foundationVisualizer";
import { useEffect } from "react";
import GroundBeamVisualizer from "./GroundBeamVisualizer";
import BasePlotVisualizer from "./BasePlotVisualizer";
import ShedWallVisualizer from "./ShedWallVisualizer";

const ShadeVisualizer = () => {
  useEffect(() => {
    wallStore.loadWallData();
  }, []);
  return (
    <>
      <GroundBeamVisualizer />
      <BasePlotVisualizer />
      <ShedWallVisualizer />
      <BasePlateVisualizer />
      <ColumnVisualizer />
      <FoundationVisualizer />
      <MullionColumnVisualizer />
      <FoundationVisualizer />
    </>
  );
};

export default ShadeVisualizer;
