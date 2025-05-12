
import React from "react";
import { Line, Text } from "react-konva";
import { observer } from "mobx-react-lite";
import uiStore from "../../stores/UIStore";
import dxfStore from "../../stores/DxfStore";
import mullionColumnStore from "../../stores/MullianColumnStore"; // Consider renaming to 'MullionColumnStore'
import wallStore from "../../stores/WallStore";

const Walls = observer(() => {
  const { visibility, currentComponent } = uiStore;
  const externalWall = dxfStore.externalWallPolygon;
  const internalWall = dxfStore.internalWallPolygon?.filter(
    (_, index) => index % 3 !== 2
  );
  const isGroundBeam = currentComponent === "groundBeam";

  const renderWallLine = (
    points: number[],
    stroke: string,
    fill?: string,
    opacity = 1
  ) => (
    <Line
      points={points}
      stroke={stroke}
      strokeWidth={5}
      closed
      fill={fill}
      opacity={opacity}
      listening={false}
    />
  );

  return (
    <>
      {/* Shade - External Wall */}
      {visibility.shade &&
        externalWall &&
        renderWallLine(externalWall, "#FF7F00")}

      {/* Shade - Internal Wall */}
      {visibility.shade &&
        internalWall &&
        renderWallLine(internalWall, "#FF7F00")}

      {/* Ground Beam - External Wall */}
      {visibility.groundBeam &&
        externalWall &&
        renderWallLine(
          externalWall,
          "cyan",
          isGroundBeam ? "cyan" : undefined,
          isGroundBeam ? 1 : 0
        )}

      {/* Ground Beam - Internal Wall */}
      {visibility.groundBeam &&
        internalWall &&
        renderWallLine(
          internalWall,
          "#FF7F00",
          isGroundBeam ? "white" : undefined,
          isGroundBeam ? 1 : 0
        )}

      {/* Mullion Column Labels */}
      {uiStore.currentComponent === "groundBeam" && mullionColumnStore.polygons.map((polygon, index) => {
        const current = polygon.points[0];
        const next =
          mullionColumnStore.polygons[
            (index + 1) % mullionColumnStore.polygons.length
          ].points[0];
        const label = polygon.label?.slice(1);

        console.log(current, next, label);

        return (
          <Text
            key={index}
            x={(current.x + next.x) / 2}
            y={(current.y + next.y) / 2}
            text={`G${label}`}
            fontSize={150}
            fill="cyan"
            stroke={"black"}
            strokeWidth={5}
            listening={false}

          />
        );
      })}
    </>
  );
});

export default Walls;
