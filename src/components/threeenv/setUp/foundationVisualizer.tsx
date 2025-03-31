import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import columnStore from "../../../stores/ColumnStore";
import baseplateStore from "../../../stores/BasePlateStore";
import foundationStore from "../../../stores/FoundationStore";

const FoundationVisualizer = observer(() => {
  useEffect(() => {
    // Trigger column generation whenever baseplates or wall points change
    foundationStore.generateFoundations();
  }, [
    baseplateStore.basePlates,
    foundationStore.RccBf,
    foundationStore.rccLf,
  ]);

  console.log("Columns:", foundationStore.foundations);

  return (
    <>
      {foundationStore.foundations.length > 0 && foundationStore.foundations.map((foundation) => (
        <>
        {console.log(foundation.points)}
        <Line
          points={
              getClosedPoints(foundation.points) as [
                  x: number,
                  y: number,
                  z: number
                ][]
            }
            color="white"
            key={foundation.id}
            />
            </>
      ))}
    </>
  );
});

export default FoundationVisualizer;
