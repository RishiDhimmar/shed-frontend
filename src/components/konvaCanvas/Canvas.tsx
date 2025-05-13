import { Stage, Layer } from "react-konva";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Konva from "konva";
import uiStore from "../../stores/UIStore";
import { observer } from "mobx-react-lite";
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
import { BsBorderCenter } from "react-icons/bs";
import { Tooltip } from "react-tooltip"; // 👈 Import Tooltip
import dxfStore from "../../stores/DxfStore";

interface Point {
  x: number;
  y: number;
}

interface CircleData {
  type: string;
  center: Point;
  radius: number;
}

interface TransformState {
  x: number;
  y: number;
  scale: number;
}

// Helper functions
const debounce = (fn: () => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
};

const CanvasZoomPan: React.FC = observer(() => {
  const stageRef = useRef<Konva.Stage>(null);
  const zoomTweenRef = useRef<Konva.Tween>(null);
  const [stageTransform, setStageTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: 1,
  });
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

    const debouncedResize = debounce(handleResize, 100);
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  const { circles, lines, polygons, texts, ellipses } = useMemo(
    () => ({
      circles: (uiStore.data.curves || []).filter(
        (c) => c.type === "CIRCLE"
      ) as CircleData[],
      lines: uiStore.data.lines || [],
      polygons: uiStore.data.polygons || [],
      texts: uiStore.data.texts || [],
      ellipses: (uiStore.data.curves || []).filter((c) => c.type === "ELLIPSE"),
    }),
    [uiStore.data]
  );

  const bounds = useMemo(() => {
    if (circles.length === 0) return null;
    return circles.reduce(
      (acc, circle) => ({
        minX: Math.min(acc.minX, circle.center.x - circle.radius),
        maxX: Math.max(acc.maxX, circle.center.x + circle.radius),
        minY: Math.min(acc.minY, circle.center.y - circle.radius),
        maxY: Math.max(acc.maxY, circle.center.y + circle.radius),
      }),
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
      }
    );
  }, [circles]);

  useEffect(() => {
    if (!bounds) return;

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;

    const scale =
      Math.min(
        dimensions.width / contentWidth,
        dimensions.height / contentHeight
      ) * 0.9;

    setStageTransform({
      scale,
      x: (dimensions.width - contentWidth * scale) / 2 - bounds.minX * scale,
      y: (dimensions.height - contentHeight * scale) / 2 - bounds.minY * scale,
    });
  }, [bounds, dimensions]);

  const animateStage = useCallback((targetPos: Point, targetScale: number) => {
    if (zoomTweenRef.current) {
      zoomTweenRef.current.destroy();
    }

    zoomTweenRef.current = new Konva.Tween({
      node: stageRef.current,
      duration: 0.3,
      easing: Konva.Easings.EaseInOut,
      x: targetPos.x,
      y: targetPos.y,
      scaleX: targetScale,
      scaleY: targetScale,
      onUpdate: () => {
        setStageTransform({
          x: stageRef.current!.x(),
          y: stageRef.current!.y(),
          scale: stageRef.current!.scaleX(),
        });
      },
    }).play();
  }, []);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const delta = e.evt.deltaY > 0 ? 0.5 : 1.5;
      const newScale = Math.max(0.0001, oldScale * delta);

      const mousePoint = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      animateStage(
        {
          x: pointer.x - mousePoint.x * newScale,
          y: pointer.y - mousePoint.y * newScale,
        },
        newScale
      );
    },
    [animateStage]
  );

  const handleCenterPolygon = useCallback(() => {
    const polygon = dxfStore.convertToPointObjects(
      dxfStore.externalWallPolygon
    );
    if (!polygon || polygon.length === 0) return;

    const polygonBounds = polygon.reduce(
      (acc, point) => ({
        minX: Math.min(acc.minX, point.x),
        maxX: Math.max(acc.maxX, point.x),
        minY: Math.min(acc.minY, point.y),
        maxY: Math.max(acc.maxY, point.y),
      }),
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
      }
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

    const targetPos = {
      x: dimensions.width / 4 - centerX * scale + 50,
      y: dimensions.height / 2 - centerY * scale,
    };

    animateStage(targetPos, scale);
  }, [dimensions, animateStage]);

  return (
    <div
      className="canvas-container"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      <button
        className="absolute top-2.5 left-2.5 px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-100 hover:bg-gray-400"
        onClick={handleCenterPolygon}
        data-tooltip-id="center-polygon-tooltip"
        data-tooltip-content="Center on Polygon"
        data-tooltip-place="top"
      >
        <BsBorderCenter className="text-2xl font-bold" strokeWidth={0.4} />
      </button>

      {/* Tooltip element */}
      <Tooltip id="center-polygon-tooltip" />

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={stageTransform.x}
        y={stageTransform.y}
        scaleX={stageTransform.scale}
        scaleY={stageTransform.scale}
        draggable
        onWheel={handleWheel}
      >
        <Layer>
          <Walls />
          <PolygonsDrawer polygons={polygons} />
          <BasePlate />
          <Column />
          <Foundation />
          <MullionColumn />
        </Layer>
        <Layer listening={false}>
          <CircleDrawer circles={circles} />
          <LineDrawer lines={lines} />
          <TextDrawer texts={texts} />
          <EllipseDrawer ellipses={ellipses} />
        </Layer>
      </Stage>
    </div>
  );
});

export default CanvasZoomPan;
