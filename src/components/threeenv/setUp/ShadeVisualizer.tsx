import basePlotStore from "../../../stores/BasePlotStore";
import { Line } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import wallStore from "../../../stores/WallStore";
import BasePlateVisualizer from "./BasePlateVisualizer";
import ColumnVisualizer from "./ColumnVisualizer";

const ShadeVisualizer = observer(() => {
  return (
    <>
      {basePlotStore.points && (
        <Line points={getClosedPoints(basePlotStore.points) as [x: number, y: number, z: number][]} color="red" />
      )}
      {wallStore.externalWallPoints && wallStore.internalWallPoints && (
        <>
          <Line
            points={getClosedPoints(wallStore.externalWallPoints) as [x: number, y: number, z: number][]}
            color="gray"
          />
          <Line
            points={getClosedPoints(wallStore.internalWallPoints) as [x: number, y: number, z: number][]}
            color="gray"
          />
        </>
      )}

      <BasePlateVisualizer />
      <ColumnVisualizer />
    </>
  );
});

export default ShadeVisualizer;
