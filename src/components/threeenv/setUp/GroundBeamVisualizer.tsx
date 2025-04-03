import wallStore from "../../../stores/WallStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import { observer } from "mobx-react-lite";

const GroundBeamVisualizer = observer(() => {
  return (
    <>
      <LineVisualizer points={wallStore.externalWallPoints} color="#00ffff" />
      <LineVisualizer points={wallStore.internalWallPoints} color="#00ffff" />
    </>
  );
})

export default GroundBeamVisualizer;
