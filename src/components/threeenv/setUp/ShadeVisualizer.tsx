import basePlotStore from "../../../stores/BasePlotStore";
import { Line } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { getClosedPoints } from "../../../utils/geometryUtils";

const ShadeVisualizer = observer(() => {
  return (
    <>
      {basePlotStore.points && (
        <Line points={getClosedPoints(basePlotStore.points)} color="red" />
      )}
    </>
  );
});

export default ShadeVisualizer;
