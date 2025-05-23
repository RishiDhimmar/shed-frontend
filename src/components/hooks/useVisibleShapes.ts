import { useMemo, RefObject } from "react";
import Konva from "konva";
import uiStore from "../../stores/UIStore";
import { CircleData } from "../../types/canvas";

export const useVisibleShapes = (stageRef: RefObject<Konva.Stage>) => {
  const getVisibleShapes = (shapes: any[], stage: Konva.Stage) => {
    const stageBounds = {
      x: -stage.x() / stage.scaleX(),
      y: -stage.y() / stage.scaleY(),
      width: stage.width() / stage.scaleX(),
      height: stage.height() / stage.scaleY(),
    };

    return shapes.filter((shape) => {
      if (shape.type === "CIRCLE") {
        const { center, radius } = shape as CircleData;
        const effectiveRadius = radius / stage.scaleX();
        return (
          center.x + effectiveRadius >= stageBounds.x &&
          center.x - effectiveRadius <= stageBounds.x + stageBounds.width &&
          center.y + effectiveRadius >= stageBounds.y &&
          center.y - effectiveRadius <= stageBounds.y + stageBounds.height
        );
      }
      return true;
    });
  };

  return useMemo(() => {
    const stage = stageRef.current;
    if (!stage) {
      return { circles: [], lines: [], polygons: [], texts: [], ellipses: [] };
    }

    const curves = uiStore.data.curves || [];
    return {
      circles: getVisibleShapes(curves.filter((c) => c.type === "CIRCLE"), stage),
      lines: getVisibleShapes(uiStore.data.lines || [], stage),
      polygons: getVisibleShapes(uiStore.data.polygons || [], stage),
      texts: getVisibleShapes(uiStore.data.texts || [], stage),
      ellipses: getVisibleShapes(curves.filter((c) => c.type === "ELLIPSE"), stage),
    };
  }, [uiStore.data, stageRef.current?.x(), stageRef.current?.y(), stageRef.current?.scaleX()]);
};