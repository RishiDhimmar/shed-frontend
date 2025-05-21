import React from "react";
import { Arrow, Line, Text, Group } from "react-konva";
import { fill } from "three/src/extras/TextureUtils.js";

const Dimension = ({
  p1,
  p2,
  offset,
  label,
  isVertical,
  dragPosition,
  onDragMove,
  rotation,
  color,
  isDraggable,
  fontSize = 100,
  textStrokeWidth = 3,
}) => {
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const offsetX = isVertical
    ? offset * Math.sin(angle)
    : offset * Math.sin(angle);
  const offsetY = isVertical
    ? -offset * Math.cos(angle)
    : -offset * Math.cos(angle);

  return (
    <Group>
      <Arrow
        points={[
          p1.x + offsetX,
          p1.y + offsetY,
          p2.x + offsetX,
          p2.y + offsetY,
        ]}
        pointerLength={20}
        pointerWidth={15}
        fill={color}
        stroke={color}
        strokeWidth={3}
        pointerAtBeginning={true}
        pointerAtEnding={true}
      />
      <Line
        points={[
          p1.x,
          p1.y,
          p1.x + offsetX - (isVertical ? dragPosition : 0),
          p1.y + offsetY - (isVertical ? 0 : dragPosition),
        ]}
        stroke={color}
        strokeWidth={3}
        dash={[10, 5]}
      />
      <Line
        points={[
          p2.x,
          p2.y,
          p2.x + offsetX - (isVertical ? dragPosition : 0),
          p2.y + offsetY - (isVertical ? 0 : dragPosition),
        ]}
        stroke={color}
        strokeWidth={3}
        dash={[10, 5]}
      />
      <Text
        x={(p1.x + p2.x) / 2 + offsetX + 50}
        y={(p1.y + p2.y) / 2 + offsetY + 50}
        text={`${label} mm`}
        fontSize={fontSize}
        stroke={"black"}
        strokeWidth={textStrokeWidth}
        fill={color}
        align="center"
        rotation={rotation}
      />
    </Group>
  );
};

export default Dimension;
