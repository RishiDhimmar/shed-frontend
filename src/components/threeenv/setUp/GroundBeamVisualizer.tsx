import uiStore from "../../../stores/UIStore";
import wallStore from "../../../stores/WallStore";
import DimensionLine from "../Helpers/DimensionLine";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import { observer } from "mobx-react-lite";

const GroundBeamVisualizer = observer(() => {
  if (
    wallStore.externalWallPoints.length === 0 ||
    wallStore.internalWallPoints.length === 0
  )
    return null;

  return (
    <>
      <LineVisualizer points={wallStore.externalWallPoints} color="#00ffff" />

      {uiStore.currentComponent === "groundBeam" && (
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
            textColor="#00ffff"
            lineColor="#00ffff"
            textOffset={0.5}
            textSize={0.6}
          />
          <DimensionLine
            startPoint={
              wallStore.internalWallPoints[1] as [number, number, number]
            }
            endPoint={
              wallStore.internalWallPoints[2] as [number, number, number]
            }
            length={wallStore.innerWidth}
            lineDirection="+x"
            lineOffset={3}
            textDirection="+x"
            textColor="#00ffff"
            lineColor="#00ffff"
            textOffset={1}
            textSize={0.6}
          />
          <LineVisualizer
            points={wallStore.internalWallPoints}
            color="#00ffff"
          />
          <DimensionLine
            startPoint={
              wallStore.internalWallPoints[0] as [number, number, number]
            }
            endPoint={
              wallStore.internalWallPoints[1] as [number, number, number]
            }
            length={wallStore.innerWidth}
            lineDirection="-y"
            lineOffset={3}
            textDirection="-y"
            textColor="#00ffff"
            lineColor="#00ffff"
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
            length={wallStore.innerWidth}
            lineDirection="+x"
            lineOffset={5}
            textDirection="+x"
            textColor="#00ffff"
            lineColor="#00ffff"
            textOffset={1}
            textSize={0.6}
          />
        </>
      )}
    </>
  );
});

export default GroundBeamVisualizer;
