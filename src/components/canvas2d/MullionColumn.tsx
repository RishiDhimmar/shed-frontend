import React from "react";
import uiStore from "../../stores/UIStore";
import { Line, Text } from "react-konva";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { observer } from "mobx-react-lite";

const MullionColumn = observer(() => {
  if (!uiStore.visibility.mullionColumn) return null;

  return (
    <>
      {mullionColumnStore.polygons.map((polygon, i) => (
        <React.Fragment key={`mullion-column-${i}`}>
          <Line
            points={polygon.points.flatMap((p) => [p.x, p.y])}
            stroke="red"
            strokeWidth={5}
            fill={uiStore.currentComponent === "mullionColumn" ? "red" : ""}
            opacity={uiStore.currentComponent === "mullionColumn" ? 0.5 : 1}
            closed
          />
          <Text
            x={polygon.points[0].x - 500}
            y={polygon.points[0].y + 500}
            text={polygon.label}
            fontSize={500}
            fill="red"
          />
        </React.Fragment>
      ))}
    </>
  );
})

export default MullionColumn;
