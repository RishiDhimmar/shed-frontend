import React from "react";
import uiStore from "../../stores/UIStore";
import baseplateStore from "../../stores/BasePlateStore";
import { Line, Text, Group } from "react-konva";
import { observer } from "mobx-react-lite";

const BasePlate = observer(() => {
  if (!uiStore.visibility.baseplate) return null;

  const renderBaseplates = (baseplates, prefix) =>
    baseplates.map((baseplate, i) => (
      <Group key={`${prefix}-${i}`}>
        <Line
          points={baseplate.points.flatMap((p) => [p.x, p.y])}
          stroke="#00FF00"
          strokeWidth={5}
          fill={uiStore.currentComponent === "baseplate" ? "#00FF00" : ""}
          opacity={uiStore.currentComponent === "baseplate" ? 0.5 : 1}
          closed
        />
        <Text
          x={baseplate.points[0].x - 600}
          y={baseplate.points[0].y - 600}
          text={baseplate.label}
          rotation={baseplate.labelRotation}
          fontSize={500}
          draggable
          fill="#00FF00"
        />
      </Group>
    ));

  return (
    <>
      {renderBaseplates(baseplateStore.cornerBasePlates, "corner")}
      {renderBaseplates(baseplateStore.edgeBasePlates, "edge")}
      {renderBaseplates(baseplateStore.middleBasePlates, "middle")}
    </>
  );
})

export default BasePlate;
