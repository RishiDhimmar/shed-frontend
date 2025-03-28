import { useEffect } from "react";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import baseplateStore from "../../../stores/BasePlateStore";
import { getClosedPoints } from "../../../utils/GeometryUtils";

const BasePlateVisualizer = observer(() => {
  useEffect(() => {
    baseplateStore.generatePlates();
  }, []);

  return (
    <>
      {baseplateStore.basePlates.map((baseplate) => (
        <Line
          points={
            getClosedPoints(baseplate.points) as [
              x: number,
              y: number,
              z: number
            ][]
          }
          color="blue"
          key={baseplate.id}
        />
      ))}
    </>
  );
});

export default BasePlateVisualizer;
