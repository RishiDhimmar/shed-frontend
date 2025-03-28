import basePlotStore from "../../../stores/BasePlotStore";
import { Line } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { getClosedPoints } from "../../../utils/geometryUtils";
import wallStore from "../../../stores/WallStore";
import baseplateStore from "../../../stores/BasePlateStore";
import BasePlateVisualizer from "./BasePlateVisualizer";
import { useEffect } from "react";

const ShadeVisualizer = observer(() => {
  useEffect(() => {
    wallStore.loadWallData();
  }, []);
  return (
    <>
      {basePlotStore.points && (
        <Line points={getClosedPoints(basePlotStore.points)} color="red" />
      )}
      {console.log(wallStore.externalWallPoints)}
      {wallStore.externalWallPoints.length > 0 &&
        wallStore.internalWallPoints.length > 0 && (
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
