// import { observer } from "mobx-react-lite";
// import { Line } from "@react-three/drei";
// import { getClosedPoints } from "../../../utils/GeometryUtils";

// interface LineVisualizerProps {
//   points: number[][] | undefined;
//   color?: string;
//   lineWidth?: number;
//   isDashed?: boolean;
// }

// const LineVisualizer = observer(
//   ({
//     points,
//     color = "#00ff00",
//     lineWidth = 1.5,
//     isDashed = false,
//   }: LineVisualizerProps) => {
//     if (!points || points.length === 0) return null;
//     return (
//       <Line
//         points={getClosedPoints(points) as [number, number, number][]}
//         color={color}
//         lineWidth={lineWidth}
//         dashed={isDashed}
//       />
//     );
//   }
// );

// export default LineVisualizer;

import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";

interface LineVisualizerProps {
  points: number[][] | undefined;
  color?: string;
  lineWidth?: number;
  isDashed?: boolean;
  closed?: boolean;
}

const LineVisualizer = observer(
  ({
    points,
    color = "#00ff00",
    lineWidth = 1.5,
    isDashed = false,
    closed = true, // default to closed for baseplates
  }: LineVisualizerProps) => {
    if (!points || points.length === 0) return null;
    const linePoints = closed ? [...points, points[0]] : points;

    return (
      <Line
        points={linePoints as [number, number, number][]}
        color={color}
        lineWidth={lineWidth}
        dashed={isDashed}
      />
    );
  },
);

export default LineVisualizer;
