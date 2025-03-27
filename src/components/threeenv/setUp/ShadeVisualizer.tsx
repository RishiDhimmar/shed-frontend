import basePlotStore from "../../../stores/BasePlotStore";
import { Line } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { getClosedPoints } from "../../../utils/geometryUtils";
import wallStore from "../../../stores/WallStore";
import baseplateStore from "../../../stores/BasePlateStore";
import BasePlateVisualizer from "./BasePlateVisualizer";

const ShadeVisualizer = observer(() => {
  return (
    <>
      {basePlotStore.points && (
        <Line points={getClosedPoints(basePlotStore.points)} color="red" />
      )}
      {wallStore.externalWallPoints && wallStore.internalWallPoints && (
        <>
          <Line
            points={getClosedPoints(wallStore.externalWallPoints)}
            color="gray"
          />
          <Line
            points={getClosedPoints(wallStore.internalWallPoints)}
            color="gray"
          />
        </>
      )}

      <BasePlateVisualizer />
    </>
  );
});

export default ShadeVisualizer;
