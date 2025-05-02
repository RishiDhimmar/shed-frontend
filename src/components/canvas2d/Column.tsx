import React from "react";
import uiStore from "../../stores/UIStore";
import { Line, Text, Group } from "react-konva";
import columnStore from "../../stores/ColumnStore";
import { observer } from "mobx-react-lite";

const Column = observer(() => {
  if (!uiStore.visibility.column) return null;

  return (
    <>
      {columnStore.polygons.map((column, i) => (
        <Group key={`column-group-${i}`}>
          <Line
            points={column.points.flatMap((p) => [p.x, p.y])}
            stroke="#6363E1"
            strokeWidth={5}
            fill={uiStore.currentComponent === "column" ? "blue" : ""}
            opacity={uiStore.currentComponent === "column" ? 0.5 : 1}
            closed
            listening={false} // Optional: make Line ignore pointer events
          />
          <Text
            x={column.points[0].x - 500}
            y={column.points[0].y + 700}
            text={column.label}
            fontSize={500}
            fill="#6363E1"
            draggable={true}
            
          />
        </Group>
      ))}
    </>
  );
})

export default Column;
