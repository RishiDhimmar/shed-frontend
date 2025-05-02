import React from "react";
import uiStore from "../../stores/UIStore";
import { Line } from "react-konva";
import dxfStore from "../../stores/DxfStore";

function Walls() {
  return (
    <>
      {uiStore.visibility.shade && dxfStore.externalWallPolygon && (
        <Line
          points={dxfStore.externalWallPolygon}
          stroke="#FF7F00"
          strokeWidth={5}
          closed
          listening={false}
        />
      )}
      {uiStore.visibility.shade && dxfStore.internalWallPolygon && (
        <>
          <Line
            points={dxfStore.internalWallPolygon?.filter(
              (_, index) => index % 3 !== 2
            )}
            stroke="#FF7F00"
            strokeWidth={5}
            closed
          />
        </>
      )}
    </>
  );
}

export default Walls;
