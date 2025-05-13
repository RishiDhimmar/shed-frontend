
import { observer } from "mobx-react-lite";
import wallStore from "../../../stores/WallStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";
import HatchingLines from "../Helpers/HatchingLines";

const ShedWallVisualizer = observer(() => {
  if (
    wallStore.externalWallPoints.length === 0 ||
    wallStore.internalWallPoints.length === 0
  )
    return null;
  if (
    wallStore.externalWallPoints.length === 0 ||
    wallStore.internalWallPoints.length === 0
  )
    return null;

  return (
    <>
      <LineVisualizer points={wallStore.externalWallPoints} color="#ff7f00" />
      <LineVisualizer points={wallStore.internalWallPoints} color="#ff7f00" />
      <HatchingLines
        outerPolygon={wallStore.externalWallPoints.map(([x, y]) => [x, y])}
        innerPolygon={wallStore.internalWallPoints.map(([x, y]) => [x, y])}
        spacing={0.2}
        angle={45}
        color="#ff7f00"
        lineWidth={0.7}
        depthOffset={0.01}
        type="shade"
      />

      {uiStore.currentComponent === "shade" && (
        <>
          <DimensionLine
            startPoint={
              wallStore.externalWallPoints[0] as [number, number, number]
            }
            endPoint={
              wallStore.externalWallPoints[1] as [number, number, number]
            }
            length={wallStore.width}
            lineDirection="-y"
            lineOffset={5}
            textDirection="-y"
            textColor="#ff7f00"
            lineColor="#ff7f00"
            textOffset={0.5}
            textSize={0.6}
          />
          <DimensionLine
            startPoint={
              wallStore.externalWallPoints[1] as [number, number, number]
            }
            endPoint={
              wallStore.externalWallPoints[2] as [number, number, number]
            }
            length={wallStore.height}
            lineDirection="+x"
            lineOffset={5}
            textDirection="-x"
            textColor="#ff7f00"
            lineColor="#ff7f00"
            textOffset={-0.6}
            textSize={0.6}
          />
        </>
      )}
    </>
  );
});

export default ShedWallVisualizer;
