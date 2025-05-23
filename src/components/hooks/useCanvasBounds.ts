import { useState, useEffect, useCallback, useMemo } from "react";
import Konva from "konva";
import uiStore from "../../stores/UIStore";
import dxfStore from "../../stores/DxfStore";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import { Bounds, CircleData } from "../../types/canvas";

export const useCanvasBounds = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const bounds = useMemo(() => {
    const circles =
      uiStore.data.curves?.filter((c) => c.type === "CIRCLE") || [];
    if (circles.length === 0) return null;

    return circles.reduce<Bounds>(
      (acc, circle: CircleData) => ({
        minX: Math.min(acc.minX, circle.center.x - circle.radius),
        maxX: Math.max(acc.maxX, circle.center.x + circle.radius),
        minY: Math.min(acc.minY, circle.center.y - circle.radius),
        maxY: Math.max(acc.maxY, circle.center.y + circle.radius),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );
  }, [uiStore.data.curves]);

  const handleCenterPolygon = useCallback(() => {
    const polygon = convertToPointObjects(dxfStore.externalWallPolygon);
    if (!polygon?.length) return;

    const polygonBounds = polygon.reduce<Bounds>(
      (acc, point) => ({
        minX: Math.min(acc.minX, point.x),
        maxX: Math.max(acc.maxX, point.x),
        minY: Math.min(acc.minY, point.y),
        maxY: Math.max(acc.maxY, point.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const contentWidth = polygonBounds.maxX - polygonBounds.minX;
    const contentHeight = polygonBounds.maxY - polygonBounds.minY;
    const scale =
      Math.min(
        dimensions.width / contentWidth,
        dimensions.height / contentHeight
      ) * 0.5;

    const centerX = (polygonBounds.minX + polygonBounds.maxX) / 2;
    const centerY = (polygonBounds.minY + polygonBounds.maxY) / 2;
    uiStore.setStageTransform({
      x: dimensions.width / 4 - centerX * scale + 50,
      y: dimensions.height / 2 - centerY * scale,
      scale,
    });
    return {
      scale,
      x: dimensions.width / 4 - centerX * scale + 50,
      y: dimensions.height / 2 - centerY * scale,
    };
  }, [dimensions]);

  return { bounds, dimensions, handleCenterPolygon };
};
