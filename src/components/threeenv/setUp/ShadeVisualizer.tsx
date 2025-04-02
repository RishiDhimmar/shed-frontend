import BasePlateVisualizer from "./BasePlateVisualizer";
import ColumnVisualizer from "./ColumnVisualizer";
import MullionColumnVisualizer from "./MullionColumnVisualizer";
import FoundationVisualizer from "./foundationVisualizer";
import GroundBeamVisualizer from "./GroundBeamVisualizer";
import BasePlotVisualizer from "./BasePlotVisualizer";
import ShedWallVisualizer from "./ShedWallVisualizer";
import uiStore from "../../../stores/UIStore";
import { observer } from "mobx-react-lite";
// import { useEffect } from "react";
// import wallStore from "../../../stores/WallStore";

const ShadeVisualizer = observer(() => {
  // useEffect(() => {
  //   wallStore.loadWallData();
  // }, []);
  return (
    <>
      {uiStore.visibility.groundBeam && <GroundBeamVisualizer />}
      {uiStore.visibility.plot && <BasePlotVisualizer />}
      {uiStore.visibility.baseplate && <BasePlateVisualizer />}
      {uiStore.visibility.column && <ColumnVisualizer />}
      {uiStore.visibility.foundation && <FoundationVisualizer />}
      {uiStore.visibility.shade && <ShedWallVisualizer />}
      {uiStore.visibility.mullionColumn && <MullionColumnVisualizer />}
    </>
  );
});

export default ShadeVisualizer;
