import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import columnStore from "../../../stores/ColumnStore";
import baseplateStore from "../../../stores/BasePlateStore";

const ColumnVisualizer = observer(() => {
  useEffect(() => {
    // Trigger column generation whenever baseplates or wall points change
    columnStore.generateColumns();
  }, [
    baseplateStore.basePlates,
    columnStore.cornerLength,
    columnStore.cornerWidth,
    columnStore.horizontalLength,
    columnStore.horizontalWidth,
    columnStore.verticalLength,
    columnStore.verticalWidth,
  ]);

  console.log("Columns:", columnStore.columns);

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
          color="blue"
          key={column.id}
        />
      ))}
    </>
  );
});

export default ColumnVisualizer;
