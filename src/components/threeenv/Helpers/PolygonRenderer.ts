import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";

export const PolygonRenderer = observer(
  ({
    canvasRef,
    polygons,
    polygonKeys,
    selectedKey,
    hoveredKey,
    worldToScreen,
    externalWallPoints,
    internalWallPoints,
    secondSelectedPolygon,
    intersectingPolygons,
  }) => {
    const canvas = canvasRef.current;
    const drawPolygon = (ctx, polygon, color, lineWidth = 2) => {
      if (!polygon || polygon.length === 0) return;

      ctx.beginPath();
      const firstPoint = Array.isArray(polygon[0])
        ? worldToScreen({ x: polygon[0][0], y: polygon[0][1] })
        : worldToScreen(polygon[0]);

      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < polygon.length; i++) {
        const point = Array.isArray(polygon[i])
          ? worldToScreen({ x: polygon[i][0], y: polygon[i][1] })
          : worldToScreen(polygon[i]);
        ctx.lineTo(point.x, point.y);
      }

      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all polygons
      polygons.forEach((polygon, index) => {
        const k = polygonKeys[index];
        const color =
          k === selectedKey ? "blue" : k === hoveredKey ? "orange" : "red";
        drawPolygon(ctx, polygon, color);
      });

      // Draw selected polygons
      if (externalWallPoints.length > 0)
        drawPolygon(ctx, externalWallPoints, "blue", 2);
      if (internalWallPoints.length > 0)
        drawPolygon(ctx, internalWallPoints, "green", 2);
      if (secondSelectedPolygon)
        drawPolygon(ctx, secondSelectedPolygon, "yellow", 2);

      // Draw intersecting polygons
      intersectingPolygons.forEach((polygon) => {
        drawPolygon(ctx, polygon, "purple", 3);
      });
    }, [
      polygons,
      polygonKeys,
      selectedKey,
      hoveredKey,
      externalWallPoints,
      internalWallPoints,
      secondSelectedPolygon,
      intersectingPolygons,
    ]);

    return <canvas ref={canvasRef} />;
  }
);
