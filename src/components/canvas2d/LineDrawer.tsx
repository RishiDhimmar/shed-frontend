import { observer } from "mobx-react-lite";
import React from "react";
import { Line } from "react-konva";
import uiStore from "../../stores/UIStore";

const LineDrawer = observer(({ lines }) => {
  return (
    <>
      {uiStore.visibility.lines && lines.map((line, i) => (
        <Line
          key={`line-${i}`}
          points={[line.start.x, line.start.y, line.end.x, line.end.y]}
          stroke="black"
          strokeWidth={5}
          listening={false}
        />
      ))}
    </>
  );
});

export default LineDrawer;
