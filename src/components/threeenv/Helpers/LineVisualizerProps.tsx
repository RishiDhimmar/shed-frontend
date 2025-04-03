import { observer } from "mobx-react-lite";
import { Line } from "@react-three/drei";
import { getClosedPoints } from "../../../utils/GeometryUtils";

interface LineVisualizerProps {
  points: number[][] | undefined;
  color?: string;
  lineWidth?: number;
}

const LineVisualizer = observer(({ points, color = "#00ff00", lineWidth = 1.5 }: LineVisualizerProps) => {
  if (!points || points.length === 0) return null;
  return (
    <Line
      points={getClosedPoints(points) as [number, number, number][]}
      color={color}
      lineWidth={lineWidth}
    />
  );
});

export default LineVisualizer;
