import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import baseplateStore from "../../../stores/BasePlateStore";
import { getClosedPoints } from "../../../utils/GeometryUtils";

const BasePlateVisualizer = observer(() => {

  return (
    <>
      {baseplateStore.basePlates && baseplateStore.basePlates.map((baseplate) => (
        <Line
          points={
            getClosedPoints(baseplate.points) as [
              x: number,
              y: number,
              z: number
            ][]
          }
          color="#00ff00"
          key={baseplate.id}
          lineWidth={1.5}
        />
      ))}
    </>
  );
});

export default BasePlateVisualizer;
