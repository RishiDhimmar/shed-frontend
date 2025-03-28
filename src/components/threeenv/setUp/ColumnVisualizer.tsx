import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import columnStore from "../../../stores/ColumnStore";

const ColumnVisualizer = observer(() => {
  useEffect(() => {
    columnStore.generateColumns();
    console.log(columnStore.columns)
  }, []);

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
          color="orange"
          key={column.id}
        />
      ))}
    </>
  );
});

export default ColumnVisualizer;
