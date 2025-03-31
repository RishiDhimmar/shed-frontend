import basePlotStore from "../../../stores/BasePlotStore";
import { Line } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import wallStore from "../../../stores/WallStore";
import BasePlateVisualizer from "./BasePlateVisualizer";
import ColumnVisualizer from "./ColumnVisualizer";
import MullionColumnVisualizer from "./MullionColumnVisualizer";

const ShadeVisualizer = observer(() => {
  // useEffect(() => {
  //   wallStore.loadWallData();
  // }, []);
  return (
    <>
      {basePlotStore.points && (
        <Line
          points={
            getClosedPoints(basePlotStore.points) as [
              x: number,
              y: number,
              z: number
            ][]
          }
          color="red"
        />
      )}
      {wallStore.externalWallPoints.length > 0 &&
        wallStore.internalWallPoints.length > 0 && (
          <>
            <Line
              points={
                getClosedPoints(wallStore.externalWallPoints) as [
                  x: number,
                  y: number,
                  z: number
                ][]
              }
              color="orange"
            />
            <Line
              points={
                getClosedPoints(wallStore.internalWallPoints) as [
                  x: number,
                  y: number,
                  z: number
                ][]
              }
              color="orange"
            />
          </>
        )}

      <BasePlateVisualizer />
      <ColumnVisualizer />
      <MullionColumnVisualizer />
    </>
  );
});

export default ShadeVisualizer;
