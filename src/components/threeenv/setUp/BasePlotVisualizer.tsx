import { observer } from "mobx-react-lite";
import basePlotStore from "../../../stores/BasePlotStore";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import { Line } from "@react-three/drei";
import { PlotDimensions } from "../../dimensions/PlotDimensions";

const BasePlotVisualizer = observer(() => {
  return (
    <>
      {basePlotStore.points && (
        <>
          <Line
            points={
              getClosedPoints(basePlotStore.points) as [
                x: number,
                y: number,
                z: number
              ][]
            }
            lineWidth={1.5}
          />
          <PlotDimensions />
        </>
      )}
    </>
  );
});

export default BasePlotVisualizer;
