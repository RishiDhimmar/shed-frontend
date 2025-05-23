import { useState, useEffect, useRef, useCallback } from "react";
import Konva from "konva";
import { throttle } from "../../utils/throttle";
import { TransformState } from "../../types/canvas";
import uiStore from "../../stores/UIStore";

export const useCanvasZoomPan = () => {
  const stageRef = useRef<Konva.Stage>(null);
  

  const handleWheel = useCallback(
    throttle((e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage || !stage.getPointerPosition()) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition()!;
      const zoomSpeed = 0.1;
      const scaleBy = e.evt.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
      const newScale = oldScale * scaleBy;

      if (isNaN(newScale) || !isFinite(newScale) || newScale < Number.EPSILON) return;

      const mousePoint = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePoint.x * newScale,
        y: pointer.y - mousePoint.y * newScale,
      };

      if (Math.abs(newPos.x) > 1e10 || Math.abs(newPos.y) > 1e10) {
        stage.position({ x: 0, y: 0 });
        stage.scale({ x: 1, y: 1 });
        uiStore.setStageTransform({ x: 0, y: 0, scale: 1 });
        return;
      }

      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      stage.batchDraw();
      uiStore.setStageTransform({ x: newPos.x, y: newPos.y, scale: newScale });
    }, 16),
    []
  );

  const handleDragMove = useCallback(
    throttle(() => {
      const stage = stageRef.current;
      if (stage) stage.batchDraw();
    }, 16),
    []
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      stage.on("dragmove", handleDragMove);
      return () => stage.off("dragmove", handleDragMove);
    }
  }, [handleDragMove]);

  return { stageRef, handleWheel, handleDragMove };
};