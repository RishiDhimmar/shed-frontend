import React from "react";
import uiStore from "../../stores/UIStore";
import { Line, Text, Group } from "react-konva";
import foundationStore from "../../stores/FoundationStore";
import { observer } from "mobx-react-lite";

const Foundation = observer(() => {
  if (!uiStore.visibility.foundation) return null;

  return (
    <>
      {foundationStore.polygons.map((foundation, i) => (
        <Group key={`foundation-${i}`} name={`foundation-${i}`}>
          <Line
            points={foundation.innerFoundationPoints.flatMap((p) => [p.x, p.y])}
            stroke="#FF00FF"
            strokeWidth={5}
            fill={uiStore.currentComponent === "foundation" ? "white" : ""}
            opacity={uiStore.currentComponent === "foundation" ? 0.5 : 1}
            closed
          />
          <Line
            points={foundation.outerFoundationPoints.flatMap((p) => [p.x, p.y])}
            stroke="#FF00FF"
            strokeWidth={5}
            fill={uiStore.currentComponent === "foundation" ? "#FF00FF" : ""}
            opacity={uiStore.currentComponent === "foundation" ? 0.5 : 1}
            closed
          />
          {[0, 1, 2, 3].map((j) => (
            <Line
              key={`foundation-line-${i}-${j}`}
              points={[
                foundation.innerFoundationPoints[j].x,
                foundation.innerFoundationPoints[j].y,
                foundation.outerFoundationPoints[j].x,
                foundation.outerFoundationPoints[j].y,
              ]}
              stroke="#FF00FF"
              strokeWidth={5}
            />
          ))}
          <Text
            x={foundation.innerFoundationPoints[0].x - 500}
            y={foundation.innerFoundationPoints[0].y - 500}
            text={foundation.label}
            fontSize={500}
            fill="#FF00FF"
            draggable
          />
        </Group>
      ))}
    </>
  );
})

export default Foundation;
