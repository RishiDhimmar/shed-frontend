// import wallStore from "../../../stores/WallStore";
// import { Line } from "@react-three/drei";
// import { getClosedPoints } from "../../../utils/GeometryUtils";
// import { observer } from "mobx-react-lite";
// import WallDimensions from "../../dimensions/WallDimensions";

// const ShedWallVisualizer = observer(() => {
//   return (
//     <>
//       {wallStore.externalWallPoints.length > 0 &&
//         wallStore.internalWallPoints.length > 0 && (
//           <>
//             <Line
//               points={
//                 getClosedPoints(wallStore.externalWallPoints) as [
//                   x: number,
//                   y: number,
//                   z: number
//                 ][]
//               }
//               color="#ff7f00"
//               lineWidth={1.5}
//             />
//             <Line
//               points={
//                 getClosedPoints(wallStore.internalWallPoints) as [
//                   x: number,
//                   y: number,
//                   z: number
//                 ][]
//               }
//               color="#ff7f00"
//               lineWidth={1.5}
//             />
//             <WallDimensions />
//           </>
//         )}
//     </>
//   );
// });

// export default ShedWallVisualizer;

import { observer } from "mobx-react-lite";
import wallStore from "../../../stores/WallStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";

const ShedWallVisualizer = observer(() => {
  if (
    wallStore.externalWallPoints.length === 0 ||
    wallStore.internalWallPoints.length === 0
  )
    return null;
  if (
    wallStore.externalWallPoints.length === 0 ||
    wallStore.internalWallPoints.length === 0
  )
    return null;

  return (
    <>
      <LineVisualizer points={wallStore.externalWallPoints} color="#ff7f00" />
      <LineVisualizer points={wallStore.internalWallPoints} color="#ff7f00" />

      {uiStore.currentComponent === "shade" && (
        <>
          <DimensionLine
            startPoint={
              wallStore.externalWallPoints[0] as [number, number, number]
            }
            endPoint={
              wallStore.externalWallPoints[1] as [number, number, number]
            }
            length={wallStore.width}
            lineDirection="-y"
            lineOffset={5}
            textDirection="-y"
            textColor="#ff7f00"
            lineColor="#ff7f00"
            textOffset={0.5}
            textSize={0.6}
          />
          <DimensionLine
            startPoint={
              wallStore.externalWallPoints[1] as [number, number, number]
            }
            endPoint={
              wallStore.externalWallPoints[2] as [number, number, number]
            }
            length={wallStore.height}
            lineDirection="+x"
            lineOffset={5}
            textDirection="-x"
            textColor="#ff7f00"
            lineColor="#ff7f00"
            textOffset={0.5}
            textSize={0.6}
          />
          <DimensionLine
            startPoint={
              wallStore.internalWallPoints[0] as [number, number, number]
            }
            endPoint={
              wallStore.internalWallPoints[1] as [number, number, number]
            }
            length={wallStore.innerWidth}
            lineDirection="-y"
            lineOffset={3}
            textDirection="-y"
            textColor="#ff7f00"
            lineColor="#ff7f00"
            textOffset={0.5}
            textSize={0.6}
          />
          <DimensionLine
            startPoint={
              wallStore.internalWallPoints[1] as [number, number, number]
            }
            endPoint={
              wallStore.internalWallPoints[2] as [number, number, number]
            }
            length={wallStore.innerHeight}
            lineDirection="+x"
            lineOffset={3}
            textDirection="-x"
            textColor="#ff7f00"
            lineColor="#ff7f00"
            textOffset={0.5}
            textSize={0.6}
          />
        </>
      )}
    </>
  );
});

export default ShedWallVisualizer;
