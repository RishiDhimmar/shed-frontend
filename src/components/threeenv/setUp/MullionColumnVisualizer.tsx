// import { observer } from "mobx-react-lite";
// import { Line } from "@react-three/drei";
// import mullionColumnStore from "../../../stores/MullianColumnStore";
// import { getClosedPoints } from "../../../utils/GeometryUtils";
// import { useEffect } from "react";
// import baseplateStore from "../../../stores/BasePlateStore";

// const MullionColumnVisualizer = observer(() => {
//   useEffect(() => {
//     mullionColumnStore.calculateMullions();
//   },[baseplateStore.basePlates])
//   return (
//     <>
//       {mullionColumnStore.mullionPositions.length > 0 && mullionColumnStore.mullionPositions.map((mullionPoints, index) => (
//         <>
//         <Line
//           key={index}
//           points={
//             getClosedPoints(mullionPoints).map(([px, py]) => [px, py, 0]) as [
//               number,
//               number,
//               number
//             ][]
//           }
//           color="#FF0000"

//           lineWidth={1.5}
//           />
//           </>
//       ))}
//     </>
//   );
// });

// export default MullionColumnVisualizer;

import { observer } from "mobx-react-lite";
import mullionColumnStore from "../../../stores/MullianColumnStore";
import { useEffect } from "react";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";

const MullionColumnVisualizer = observer(() => {
  useEffect(() => {
    mullionColumnStore.calculateMullions();
  }, [baseplateStore.basePlates]);

  return (
    <>
      {mullionColumnStore.mullionPositions.map((points, index) => (
        <LineVisualizer key={index} points={points} color="#FF0000" />
      ))}

      {mullionColumnStore.mullionPositions.map((points, index) => {
        if (points.length < 3) return null;

        const toTuple = (p: number[]): [number, number, number] => [
          p[0] ?? 0,
          p[1] ?? 0,
          p[2] ?? 0,
        ];

        const p1 = toTuple(points[0]);
        const p2 = toTuple(points[1]);
        const p3 = toTuple(points[2]);

        // Calculate Width & Height
        const width = Math.abs(p2[0] - p1[0]);
        const height = Math.abs(p3[1] - p2[1]);

        return (
          <group key={`dim-${index}`}>
            {/* Width Dimension */}

            {uiStore.currentComponent === "mullionColumn" && (
              <>
                <DimensionLine
                  startPoint={p1}
                  endPoint={p2}
                  length={width}
                  lineColor="#FF0000"
                  textColor="#FF0000"
                  lineDirection="-y"
                  textDirection="-y"
                  lineOffset={0.3}
                  textOffset={0.5}
                  textSize={0.25}
                />

                {/* Height Dimension */}
                <DimensionLine
                  startPoint={p2}
                  endPoint={p3}
                  length={height}
                  lineColor="#FF0000"
                  textColor="#FF0000"
                  lineDirection="-x"
                  textDirection="-x"
                  lineOffset={0.3}
                  textOffset={0.5}
                  textSize={0.25}
                />
              </>
            )}
          </group>
        );
      })}
    </>
  );
});

export default MullionColumnVisualizer;
