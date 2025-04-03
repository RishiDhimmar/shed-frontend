import { Line, Text } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import wallStore from "../../stores/WallStore";

const WallDimensions = observer(() => {
  if (
    wallStore.externalWallPoints.length === 0 ||
    wallStore.internalWallPoints.length === 0
  ) {
    return null;
  }

  // Function to calculate width and height from given points
  const getDimensions = (points: number[][]) => {
    const xValues = points.map((p) => p[0]);
    const yValues = points.map((p) => p[1]);
    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
      width: Math.max(...xValues) - Math.min(...xValues),
      height: Math.max(...yValues) - Math.min(...yValues),
    };
  };

  const external = getDimensions(wallStore.externalWallPoints);
  const internal = getDimensions(wallStore.internalWallPoints);
  const offset = 0.3;

  return (
    <>
      {/* External Dimensions */}
      <Line
        points={[
          [external.minX, external.maxY + offset, 0],
          [external.maxX, external.maxY + offset, 0],
        ]}
        color="blue"
        lineWidth={2}
      />
      <Line
        points={[
          [external.maxX + offset, external.minY, 0],
          [external.maxX + offset, external.maxY, 0],
        ]}
        color="blue"
        lineWidth={2}
      />
      <Text
        position={[
          (external.minX + external.maxX) / 2,
          external.maxY + offset + 0.9,
          0,
        ]}
        color="blue"
        fontSize={0.8}
      >
        {external.width.toFixed(2)}m
      </Text>
      <Text
        position={[
          external.maxX + offset + 0.9,
          (external.minY + external.maxY) / 2,
          0,
        ]}
        color="blue"
        fontSize={0.8}
        rotation={[0, 0, Math.PI / 2]}
      >
        {external.height.toFixed(2)}m
      </Text>

      {/* Internal Dimensions */}
      <Line
        points={[
          [internal.minX, internal.maxY - offset, 0],
          [internal.maxX, internal.maxY - offset, 0],
        ]}
        color="red"
        lineWidth={2}
      />
      <Line
        points={[
          [internal.maxX - offset, internal.minY, 0],
          [internal.maxX - offset, internal.maxY, 0],
        ]}
        color="red"
        lineWidth={2}
      />
      <Text
        position={[
          (internal.minX + internal.maxX) / 2,
          internal.maxY - offset - 0.9,
          0,
        ]}
        color="red"
        fontSize={0.8}
      >
        {internal.width.toFixed(2)}m
      </Text>
      <Text
        position={[
          internal.maxX - offset - 0.9,
          (internal.minY + internal.maxY) / 2,
          0,
        ]}
        color="red"
        fontSize={0.8}
        rotation={[0, 0, Math.PI / 2]}
      >
        {internal.height.toFixed(2)}m
      </Text>
    </>
  );
});

export default WallDimensions;
