import React from "react";
import { Circle } from "react-konva";
import uiStore from "../../stores/UIStore";
import { observer } from "mobx-react-lite";
import { getColorByNumber } from "../../utils/getColorByNumber";

const CircleDrawer = observer(({ circles }) => {
  return (
    <>
      {uiStore.visibility.circles &&
        circles.map((circle, i) => (
          <>
            <Circle
              key={`circle-${i}`}
              x={circle.center.x}
              y={circle.center.y}
              radius={circle.radius}
              stroke={"black"}
              strokeWidth={5}
              listening={false}
            />
          </>
        ))}
    </>
  );
});
export default CircleDrawer;
