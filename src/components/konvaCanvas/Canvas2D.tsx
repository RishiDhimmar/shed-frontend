import React from "react";
import { Stage, Layer } from "react-konva";
import BasePlate from "../canvas2d/BasePlate";
import Column from "../canvas2d/Column";
import Foundation from "../canvas2d/Foundation";
import MullionColumn from "../canvas2d/MullionColumn";
import CircleDrawer from "../canvas2d/Circle";
import LineDrawer from "../canvas2d/LineDrawer";
import PolygonsDrawer from "../canvas2d/PolygonsDrawer";
import Walls from "../canvas2d/Walls";
import TextDrawer from "../canvas2d/TextDrawer";
import EllipseDrawer from "../canvas2d/EllipseDrawer";
import { useCanvasZoomPan } from "../hooks/useCanvasZoomPan";
import { useVisibleShapes } from "../hooks/useVisibleShapes";
import uiStore from "../../stores/UIStore";
import { observer } from "mobx-react-lite";

const Canvas2D: React.FC = observer(() => {
  const { stageRef,  handleWheel, handleDragMove } = useCanvasZoomPan();
  const { circles, lines, polygons, texts, ellipses } = useVisibleShapes(stageRef);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      x={uiStore.stageTransform.x}
      y={uiStore.stageTransform.y}
      scaleX={uiStore.stageTransform.scale}
      scaleY={uiStore.stageTransform.scale}
      onWheel={handleWheel}
      draggable
      onDragMove={handleDragMove}
    >
      <Layer>
        <Walls />
        <PolygonsDrawer polygons={polygons} />
        <Column />
        <Foundation />
      </Layer>
      <Layer listening={false}>
        <CircleDrawer circles={circles} />
        <LineDrawer lines={lines} />
        <TextDrawer texts={texts} />
        <EllipseDrawer ellipses={ellipses} />
        <BasePlate />
        <MullionColumn />
      </Layer>
    </Stage>
  );
});

export default Canvas2D;