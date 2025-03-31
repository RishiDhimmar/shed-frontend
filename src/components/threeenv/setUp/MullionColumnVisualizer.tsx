import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import mullionColumnStore from "../../../stores/MullianColumnStore";
import { getClosedPoints } from "../../../utils/GeometryUtils";

const MullionColumnVisualizer = observer(() => {
  return (
    <>
      {mullionColumnStore.mullionPositions.map((mullionPoints, index) => (
        <Line
          key={index}
          points={
            getClosedPoints(mullionPoints).map(([px, py]) => [px, py, 0]) as [
              number,
              number,
              number
            ][]
          }
          color="#FF0000"
        />
      ))}
    </>
  );
});

export default MullionColumnVisualizer;
