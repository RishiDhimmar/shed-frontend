import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import columnStore from "../../../stores/ColumnStore";
import { useMemo } from "react";
import baseplateStore from "../../../stores/BasePlateStore";

const ColumnVisualizer = observer(() => {
  useMemo(() => {
    columnStore.generateColumns()
  },[baseplateStore.basePlates])
  return (
    <>
      {columnStore.columns.map((column) => (
        <Line
          points={
            getClosedPoints(column.points) as [
              x: number,
              y: number,
              z: number
            ][]
          }
          color="#6363E1"
          key={column.id}
          lineWidth={1.5}
        />
      ))}
    </>
  );
});

export default ColumnVisualizer;
