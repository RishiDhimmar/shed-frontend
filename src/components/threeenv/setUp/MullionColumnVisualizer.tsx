import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import mullionColumnStore from "../../../stores/MullianColumnStore";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import { useEffect } from "react";
import baseplateStore from "../../../stores/BasePlateStore";

const MullionColumnVisualizer = observer(() => {
  useEffect(() => {
    mullionColumnStore.calculateMullions();
  },[baseplateStore.basePlates])
  return (
    <>
      {mullionColumnStore.mullionPositions.length > 0 && mullionColumnStore.mullionPositions.map((mullionPoints, index) => (
        <>
        {console.log(mullionColumnStore.mullionPositions.length)}
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
        
          lineWidth={1.5}
          />
          </>
      ))}
    </>
  );
});

export default MullionColumnVisualizer;
