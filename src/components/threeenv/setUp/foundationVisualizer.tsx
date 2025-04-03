// import { observer } from "mobx-react-lite";
// import { Line } from "@react-three/drei";
// import { getClosedPoints } from "../../../utils/GeometryUtils";
// import foundationStore from "../../../stores/FoundationStore";

// const FoundationVisualizer = observer(() => {
//   return (
//     <>
//       {foundationStore.foundations.map((foundation) => (
//         <>
//         <Line
//           key={foundation.id}
//           points={
//             getClosedPoints(foundation.points) as [number, number, number][]
//           }
//           color="#ff00ff"
//           lineWidth={1.5}
//         />
//         </>
//       ))}
//     </>
//   );
// });

// export default FoundationVisualizer;

import { observer } from "mobx-react-lite";
import foundationStore from "../../../stores/FoundationStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";

const FoundationVisualizer = observer(() => {
  return (
    <>
      {foundationStore.foundations.map((foundation) => (
        <>
          {uiStore.currentComponent === "foundation" && (
            <>
              <LineVisualizer
                key={foundation.id}
                points={foundation.points}
                color="#ff00ff"
              />

              <DimensionLine
                startPoint={foundation.points[0] as [number, number, number]}
                endPoint={foundation.points[1] as [number, number, number]}
                length={Math.abs(
                  foundation.points[1][0] - foundation.points[0][0]
                )}
                lineColor="#ff00ff"
                textColor="#ff00ff"
                lineDirection="+y"
                textDirection="+y"
                textOffset={0.5}
                textSize={0.5}
                lineOffset={2}
              />

              <DimensionLine
                startPoint={foundation.points[1] as [number, number, number]}
                endPoint={foundation.points[2] as [number, number, number]}
                length={Math.abs(
                  foundation.points[2][1] - foundation.points[1][1]
                )}
                lineColor="#ff00ff"
                textColor="#ff00ff"
                lineDirection="+x"
                textDirection="+x"
                textOffset={0.5}
                textSize={0.5}
                lineOffset={1}
              />
            </>
          )}
        </>
      ))}
    </>
  );
});

export default FoundationVisualizer;
