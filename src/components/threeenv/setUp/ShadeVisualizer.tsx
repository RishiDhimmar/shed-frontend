import BasePlateVisualizer from "./BasePlateVisualizer";
import ColumnVisualizer from "./ColumnVisualizer";
import MullionColumnVisualizer from "./MullionColumnVisualizer";
import FoundationVisualizer from "./foundationVisualizer";
import GroundBeamVisualizer from "./GroundBeamVisualizer";
import BasePlotVisualizer from "./BasePlotVisualizer";
import ShedWallVisualizer from "./ShedWallVisualizer";
import uiStore from "../../../stores/UIStore";
import { observer } from "mobx-react-lite";

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
      {uiStore.visibility.Foundation && <FoundationVisualizer />}
      {uiStore.visibility.shade && <ShedWallVisualizer />}
      {uiStore.visibility.MullionColumn && <MullionColumnVisualizer />}
    </>
  );
});

export default ShadeVisualizer;
