import React from "react";
import { Line } from "react-konva";
import dxfStore from "../../stores/DxfStore";
import uiStore from "../../stores/UIStore";
import { observer } from "mobx-react-lite";

const PolygonsDrawer = observer(({ polygons }) => {
  return (
    <>
      {uiStore.visibility.polygons &&
        polygons.map((points, i) => (
          <Line
            key={`poly-${i}`}
            points={points.flatMap((p) => [p.x, p.y])}
            stroke="black"
            strokeWidth={5}
            hitStrokeWidth={5}
            fillEnabled={false}
            closed
            onMouseEnter={(e) => e.target.stroke("red")}
            onMouseLeave={(e) => e.target.stroke("black")}
            onClick={() =>
              dxfStore.setExternalWallPolygon(points.flatMap((p) => [p.x, p.y]))
            }
          />
        ))}
    </>
  );
});

export default PolygonsDrawer;
