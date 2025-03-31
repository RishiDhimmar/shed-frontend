import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import foundationStore from "../../../stores/FoundationStore";

const FoundationVisualizer = observer(() => {
  return (
    <>
      {foundationStore.foundations.map((foundation) => (
        <>
          {console.log(foundation)}
          <Line
            key={foundation.id}
            points={
              getClosedPoints(foundation.points) as [number, number, number][]
            }
            color="#FF00FF"
          />
        </>
      ))}
    </>
  );
});

export default FoundationVisualizer;
