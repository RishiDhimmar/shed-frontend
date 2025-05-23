import React, { useEffect, useState } from "react";
import { Line } from "react-konva";
import dxfStore from "../../stores/DxfStore";
import uiStore from "../../stores/UIStore";
import { observer } from "mobx-react-lite";
import { Shed2DConfig } from "../../Constants";

const PolygonsDrawer = observer(({ polygons }) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // New function to center polygons
  const centerPolygons = (polygonsToCenter) => {
    if (!polygonsToCenter?.length) return;

    // Calculate bounding box of all polygons
    const bounds = polygonsToCenter.reduce(
      (acc, points) => {
        points.forEach((point) => {
          acc.minX = Math.min(acc.minX, point.x);
          acc.maxX = Math.max(acc.maxX, point.x);
          acc.minY = Math.min(acc.minY, point.y);
          acc.maxY = Math.max(acc.maxY, point.y);
        });
        return acc;
      },
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;

    // Calculate scale to fit content within canvas (50% scaling for padding)
    const scale =
      Math.min(
        dimensions.width / contentWidth,
        dimensions.height / contentHeight
      ) * 0.5;

    // Calculate center of the bounding box
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    // Set stage transform to center and scale polygons
    const transform = {
      x: dimensions.width / 4 - centerX * scale + 50, // Offset by 50px as in original
      y: dimensions.height / 2 - centerY * scale,
      scale,
    };
    uiStore.setStageTransform(transform);
    return transform;
  };

  // Automatically center polygons when they or visibility change
  useEffect(() => {
    if (uiStore.visibility.polygons) {
      const polygonsToCenter =
        uiStore.polygons.length > 0 ? polygons : dxfStore.candidatePolygons;
      if (polygonsToCenter.length > 0) {
        centerPolygons(polygonsToCenter);
      }
    }
  }, [uiStore.polygons.length, uiStore.visibility.polygons]);

  return (
    <>
      {uiStore.polygons.length > 0 && uiStore.visibility.polygons
        ? polygons.map((points, i) => (
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
                dxfStore.setExternalWallPolygon(
                  points.flatMap((p) => [p.x, p.y])
                )
              }
            />
          ))
        : uiStore.visibility.polygons &&
          dxfStore.candidatePolygons.map((points, i) => (
            <Line
              key={`poly-${i}`}
              points={points.flatMap((p) => [p.x, p.y])}
              stroke="black"
              strokeWidth={5}
              hitStrokeWidth={5}
              fillEnabled={false}
              closed
            />
          ))}
    </>
  );
});

export default PolygonsDrawer;
