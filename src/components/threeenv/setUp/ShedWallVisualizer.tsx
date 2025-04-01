import wallStore from "../../../stores/WallStore";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import { observer } from "mobx-react-lite";

const ShedWallVisualizer = observer(() => {
  return (
    <>
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
              color="#ff7f00"
             
              lineWidth={1.5}
            />
            <Line
              points={
                getClosedPoints(wallStore.internalWallPoints) as [
                  x: number,
                  y: number,
                  z: number
                ][]
              }
              color="#ff7f00"
             
              lineWidth={1.5}
            />
          </>
        )}
    </>
  );
});

export default ShedWallVisualizer;
