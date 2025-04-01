import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import columnStore from "../../../stores/ColumnStore";

const ColumnVisualizer = observer(() => {
  


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
          lineWidth={1.5}
        />
      ))}
    </>
  );
});

export default ColumnVisualizer;
