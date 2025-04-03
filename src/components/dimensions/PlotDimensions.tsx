import { Line, Text } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import basePlotStore from "../../stores/BasePlotStore";

export const PlotDimensions = observer(() => {
  const { width = 0, length = 0, points } = basePlotStore;

  if (width === 0 || length === 0 || !points || points.length < 4) return null;

  const offset = 2;

  const widthLinePoints: [number, number, number][] = [
    [points[3][0], points[3][1] + offset, 0] as [number, number, number],
    [points[2][0], points[2][1] + offset, 0] as [number, number, number],
  ];

  const lengthLinePoints: [number, number, number][] = [
    [points[2][0] + offset, points[2][1], 0] as [number, number, number],
    [points[1][0] + offset, points[1][1], 0] as [number, number, number],
  ];

  const widthTextPosition: [number, number, number] = [
    (widthLinePoints[0][0] + widthLinePoints[1][0]) / 2,
    (widthLinePoints[0][1] + widthLinePoints[1][1]) / 2 + 1,
    0,
  ];

  const lengthTextPosition: [number, number, number] = [
    (lengthLinePoints[0][0] + lengthLinePoints[1][0]) / 2 + 1,
    (lengthLinePoints[0][1] + lengthLinePoints[1][1]) / 2,
    0,
  ];

  return (
    <>
      <Line points={widthLinePoints} color="black" lineWidth={2} />
      <Text
        position={widthTextPosition}
        fontSize={0.8}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`${width} m`}
      </Text>

      <Line points={lengthLinePoints} color="black" lineWidth={2} />
      <Text
        position={lengthTextPosition}
        fontSize={0.8}
        color="black"
        rotation={[0, 0, Math.PI / 2]}
        anchorX="center"
        anchorY="middle"
      >
        {`${length} m`}
      </Text>
    </>
  );
});
