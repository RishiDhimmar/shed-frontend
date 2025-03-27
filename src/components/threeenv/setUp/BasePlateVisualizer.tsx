import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import baseplateStore from "../../../stores/BasePlateStore";
import { getClosedPoints } from "../../../utils/geometryUtils";

const BasePlateVisualizer = observer(() => {
  useEffect(() => {
    baseplateStore.generateCornerPlatePoints();
  }, []);

  return (
    <>
      {baseplateStore.basePlates.map((baseplate) => (
        <Line
          points={getClosedPoints(baseplate.points)}
          color="blue"
          key={baseplate.id}
        />
      ))}
    </>
  );
});

export default BasePlateVisualizer;
