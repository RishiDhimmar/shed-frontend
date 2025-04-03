// import { observer } from "mobx-react-lite";
// import { Line } from "@react-three/drei";
// import { getClosedPoints } from "../../../utils/GeometryUtils";
// import columnStore from "../../../stores/ColumnStore";
// import { useMemo } from "react";
// import baseplateStore from "../../../stores/BasePlateStore";

// const ColumnVisualizer = observer(() => {
//   useMemo(() => {
//     columnStore.generateColumns()
//   },[baseplateStore.basePlates])
//   return (
//     <>
//       {columnStore.columns.map((column) => (
//         <Line
//           points={
//             getClosedPoints(column.points) as [
//               x: number,
//               y: number,
//               z: number
//             ][]
//           }
//           color="#6363E1"
//           key={column.id}
//           lineWidth={1.5}
//         />
//       ))}
//     </>
//   );
// });

// export default ColumnVisualizer;
import { observer } from "mobx-react-lite";
import columnStore from "../../../stores/ColumnStore";
import { useMemo } from "react";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";

const ColumnVisualizer = observer(() => {
  useMemo(() => {
    columnStore.generateColumns();
  }, [baseplateStore.basePlates]);

  return (
    <>
      {columnStore.columns.map((column) => (
        <>
          <LineVisualizer
            key={column.id}
            points={column.points}
            color="#6363E1"
          />
          {uiStore.currentComponent === "column" && (
            <>
              <DimensionLine
                startPoint={column.points[0] as [number, number, number]}
                endPoint={column.points[1] as [number, number, number]}
                length={Math.abs(column.points[1][0] - column.points[0][0])}
                lineColor="#6363E1"
                textColor="#6363E1"
                lineDirection="+y"
                textDirection="+y"
                textOffset={0.5}
                textSize={0.5}
                lineOffset={1}
              />
              <DimensionLine
                startPoint={column.points[1] as [number, number, number]}
                endPoint={column.points[2] as [number, number, number]}
                length={Math.abs(column.points[2][1] - column.points[1][1])}
                lineColor="#6363E1"
                textColor="#6363E1"
                lineDirection="-x"
                textDirection="-x"
                textOffset={0.5}
                textSize={0.5}
                lineOffset={0.5}
              />
            </>
          )}
        </>
      ))}
    </>
  );
});

export default ColumnVisualizer;
