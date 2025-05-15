// import { Stage, Layer } from "react-konva";
// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useMemo,
//   useCallback,
// } from "react";
// import Konva from "konva";
// import uiStore from "../../stores/UIStore";
// import { observer } from "mobx-react-lite";
// import BasePlate from "../canvas2d/BasePlate";
// import Column from "../canvas2d/Column";
// import Foundation from "../canvas2d/Foundation";
// import MullionColumn from "../canvas2d/MullionColumn";
// import CircleDrawer from "../canvas2d/Circle";
// import LineDrawer from "../canvas2d/LineDrawer";
// import PolygonsDrawer from "../canvas2d/PolygonsDrawer";
// import Walls from "../canvas2d/Walls";
// import TextDrawer from "../canvas2d/TextDrawer";
// import EllipseDrawer from "../canvas2d/EllipseDrawer";
// import { BsBorderCenter } from "react-icons/bs";
// import { Tooltip } from "react-tooltip";
// import dxfStore from "../../stores/DxfStore";
// import { convertToPointObjects } from "../../utils/PolygonUtils";
// import { Canvas } from "@react-three/fiber";
// import { Box, OrbitControls } from "@react-three/drei";
// import { IoCubeOutline } from "react-icons/io5";
// import Experience from "../3d/Experience";

// interface Point {
//   x: number;
//   y: number;
// }

// interface CircleData {
//   type: string;
//   center: Point;
//   radius: number;
// }

// interface TransformState {
//   x: number;
//   y: number;
//   scale: number;
// }

// // Helper functions
// const debounce = (fn: () => void, delay: number) => {
//   let timeout: NodeJS.Timeout;
//   return () => {
//     clearTimeout(timeout);
//     timeout = setTimeout(fn, delay);
//   };
// };

// const CanvasZoomPan: React.FC = observer(() => {
//   const stageRef = useRef<Konva.Stage>(null);
//   const zoomTweenRef = useRef<Konva.Tween>(null);
//   const [stageTransform, setStageTransform] = useState<TransformState>({
//     x: 0,
//     y: 0,
//     scale: 1,
//   });
//   const [dimensions, setDimensions] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight,
//   });
//   const [is3D, setIs3D] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     const debouncedResize = debounce(handleResize, 100);
//     window.addEventListener("resize", debouncedResize);
//     return () => window.removeEventListener("resize", debouncedResize);
//   }, []);

//   const { circles, lines, polygons, texts, ellipses } = useMemo(
//     () => ({
//       circles: (uiStore.data.curves || []).filter(
//         (c) => c.type === "CIRCLE"
//       ) as CircleData[],
//       lines: uiStore.data.lines || [],
//       polygons: uiStore.data.polygons || [],
//       texts: uiStore.data.texts || [],
//       ellipses: (uiStore.data.curves || []).filter((c) => c.type === "ELLIPSE"),
//     }),
//     [uiStore.data]
//   );

//   const bounds = useMemo(() => {
//     if (circles.length === 0) return null;
//     return circles.reduce(
//       (acc, circle) => ({
//         minX: Math.min(acc.minX, circle.center.x - circle.radius),
//         maxX: Math.max(acc.maxX, circle.center.x + circle.radius),
//         minY: Math.min(acc.minY, circle.center.y - circle.radius),
//         maxY: Math.max(acc.maxY, circle.center.y + circle.radius),
//       }),
//       {
//         minX: Infinity,
//         maxX: -Infinity,
//         minY: Infinity,
//         maxY: -Infinity,
//       }
//     );
//   }, [circles]);

//   useEffect(() => {
//     if (!bounds) return;

//     const contentWidth = bounds.maxX - bounds.minX;
//     const contentHeight = bounds.maxY - bounds.minY;

//     const scale =
//       Math.min(
//         dimensions.width / contentWidth,
//         dimensions.height / contentHeight
//       ) * 0.9;

//     setStageTransform({
//       scale,
//       x: (dimensions.width - contentWidth * scale) / 2 - bounds.minX * scale,
//       y: (dimensions.height - contentHeight * scale) / 2 - bounds.minY * scale,
//     });
//   }, [bounds, dimensions]);

//   const animateStage = useCallback((targetPos: Point, targetScale: number) => {
//     if (zoomTweenRef.current) {
//       zoomTweenRef.current.destroy();
//     }

//     zoomTweenRef.current = new Konva.Tween({
//       node: stageRef.current,
//       duration: 0.3,
//       easing: Konva.Easings.EaseInOut,
//       x: targetPos.x,
//       y: targetPos.y,
//       scaleX: targetScale,
//       scaleY: targetScale,
//       onUpdate: () => {
//         setStageTransform({
//           x: stageRef.current!.x(),
//           y: stageRef.current!.y(),
//           scale: stageRef.current!.scaleX(),
//         });
//       },
//     }).play();
//   }, []);

//   const handleWheel = useCallback(
//     (e: Konva.KonvaEventObject<WheelEvent>) => {
//       e.evt.preventDefault();
//       const stage = stageRef.current;
//       if (!stage) return;

//       const oldScale = stage.scaleX();
//       const pointer = stage.getPointerPosition();
//       if (!pointer) return;

//       const delta = e.evt.deltaY > 0 ? 0.5 : 1.5;
//       const newScale = Math.max(0.0001, oldScale * delta);

//       const mousePoint = {
//         x: (pointer.x - stage.x()) / oldScale,
//         y: (pointer.y - stage.y()) / oldScale,
//       };

//       animateStage(
//         {
//           x: pointer.x - mousePoint.x * newScale,
//           y: pointer.y - mousePoint.y * newScale,
//         },
//         newScale
//       );
//     },
//     [animateStage]
//   );

//   const handleCenterPolygon = useCallback(() => {
//     const polygon = convertToPointObjects(dxfStore.externalWallPolygon);
//     if (!polygon || polygon.length === 0) return;

//     const polygonBounds = polygon.reduce(
//       (acc, point) => ({
//         minX: Math.min(acc.minX, point.x),
//         maxX: Math.max(acc.maxX, point.x),
//         minY: Math.min(acc.minY, point.y),
//         maxY: Math.max(acc.maxY, point.y),
//       }),
//       {
//         minX: Infinity,
//         maxX: -Infinity,
//         minY: Infinity,
//         maxY: -Infinity,
//       }
//     );

//     const contentWidth = polygonBounds.maxX - polygonBounds.minX;
//     const contentHeight = polygonBounds.maxY - polygonBounds.minY;

//     const scale =
//       Math.min(
//         dimensions.width / contentWidth,
//         dimensions.height / contentHeight
//       ) * 0.5;

//     const centerX = (polygonBounds.minX + polygonBounds.maxX) / 2;
//     const centerY = (polygonBounds.minY + polygonBounds.maxY) / 2;

//     const targetPos = {
//       x: dimensions.width / 4 - centerX * scale + 50,
//       y: dimensions.height / 2 - centerY * scale,
//     };

//     animateStage(targetPos, scale);
//   }, [dimensions, animateStage]);

//   return (
//     <div
//       className="canvas-container"
//       style={{ width: "100vw", height: "100vh", position: "relative" }}
//     >
//       {/* Center polygon button */}
//       <button
//         className="absolute top-2.5 left-2.5 px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
//         onClick={handleCenterPolygon}
//         data-tooltip-id="center-polygon-tooltip"
//         data-tooltip-content="Center on Polygon"
//         data-tooltip-place="top"
//       >
//         <BsBorderCenter className="text-2xl font-bold" strokeWidth={0.4} />
//       </button>

//       {/* 3D view button */}
//       <button
//         className="absolute top-2.5 left-[4.5rem] px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
//         onClick={() => setIs3D((prev) => !prev)}
//         data-tooltip-id="center-polygon-tooltip"
//         data-tooltip-content="3D View"
//         data-tooltip-place="top"
//       >
//         <IoCubeOutline className="text-2xl font-bold" strokeWidth={0.4} />
//       </button>

//       {/* Tooltip */}
//       <Tooltip id="center-polygon-tooltip" />

//       {/* Conditional rendering for 2D or 3D view */}
//       {is3D ? (
//         <div style={{ width: "100%", height: "100vh", display: "flex" }}>
//           <Canvas
//             style={{ width: "60%", height: "100%" }}
//             camera={{ position: [0, 0, 1000], fov: 20, near: 1, far: 10000 }}
//           >
//             <Experience />
//           </Canvas>
//         </div>
//       ) : (
//         <Stage
//           ref={stageRef}
//           width={dimensions.width}
//           height={dimensions.height}
//           x={stageTransform.x}
//           y={stageTransform.y}
//           scaleX={stageTransform.scale}
//           scaleY={stageTransform.scale}
//           draggable
//           onWheel={handleWheel}
//         >
//           <Layer>
//             <Walls />
//             <PolygonsDrawer polygons={polygons} />
//             <BasePlate />
//             <Column />
//             <Foundation />
//             <MullionColumn />
//           </Layer>
//           <Layer listening={false}>
//             <CircleDrawer circles={circles} />
//             <LineDrawer lines={lines} />
//             <TextDrawer texts={texts} />
//             <EllipseDrawer ellipses={ellipses} />
//           </Layer>
//         </Stage>
//       )}
//     </div>
//   );
// });

// export default CanvasZoomPan;

import { Stage, Layer, FastLayer } from "react-konva";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { Tooltip } from "react-tooltip";
import dxfStore from "../../stores/DxfStore";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import { Canvas } from "@react-three/fiber";
import { IoCubeOutline } from "react-icons/io5";
import Experience from "../3d/Experience";

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

const throttle = (fn: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
};

const CanvasZoomPan: React.FC = observer(() => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageTransform, setStageTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [is3D, setIs3D] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const debouncedResize = throttle(handleResize, 100);
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  const getVisibleShapes = (shapes: any[], stage: Konva.Stage) => {
    const stageBounds = {
      x: -stage.x() / stage.scaleX(),
      y: -stage.y() / stage.scaleY(),
      width: stage.width() / stage.scaleX(),
      height: stage.height() / stage.scaleY(),
    };

    return shapes.filter((shape) => {
      if (shape.type === "CIRCLE") {
        const { center, radius } = shape;
        const effectiveRadius = radius / stage.scaleX(); // Adjust for scale
        return (
          center.x + effectiveRadius >= stageBounds.x &&
          center.x - effectiveRadius <= stageBounds.x + stageBounds.width &&
          center.y + effectiveRadius >= stageBounds.y &&
          center.y - effectiveRadius <= stageBounds.y + stageBounds.height
        );
      }
      return true; // Add logic for lines, polygons, texts, ellipses
    });
  };

  const { circles, lines, polygons, texts, ellipses } = useMemo(() => {
    const stage = stageRef.current;
    if (!stage) return { circles: [], lines: [], polygons: [], texts: [], ellipses: [] };

    return {
      circles: getVisibleShapes(
        uiStore.data.curves?.filter((c) => c.type === "CIRCLE") || [],
        stage
      ),
      lines: getVisibleShapes(uiStore.data.lines || [], stage),
      polygons: getVisibleShapes(uiStore.data.polygons || [], stage),
      texts: getVisibleShapes(uiStore.data.texts || [], stage),
      ellipses: getVisibleShapes(
        uiStore.data.curves?.filter((c) => c.type === "ELLIPSE") || [],
        stage
      ),
    };
  }, [uiStore.data, stageTransform]);

  const bounds = useMemo(() => {
    const circles = uiStore.data.curves?.filter((c) => c.type === "CIRCLE") || [];
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
  }, [uiStore.data.curves]);

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

  const handleWheel = useCallback(
    throttle((e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Smooth zoom step
      const zoomSpeed = 0.1;
      const scaleBy = e.evt.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
      const newScale = oldScale * scaleBy; // No clamping for infinite zoom

      // Prevent numerical overflow
      if (isNaN(newScale) || !isFinite(newScale) || newScale < Number.EPSILON) {
        return;
      }

      const mousePoint = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePoint.x * newScale,
        y: pointer.y - mousePoint.y * newScale,
      };

      // Normalize position to avoid precision issues at extreme scales
      if (Math.abs(newPos.x) > 1e10 || Math.abs(newPos.y) > 1e10) {
        stage.position({ x: 0, y: 0 });
        stage.scale({ x: 1, y: 1 });
        setStageTransform({ x: 0, y: 0, scale: 1 });
        return;
      }

      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      stage.batchDraw();

      // Debounce state update to reduce re-renders
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = setTimeout(() => {
        setStageTransform({
          x: newPos.x,
          y: newPos.y,
          scale: newScale,
        });
      }, 100);
    }, 16), // ~60fps
    []
  );

  const handleDragMove = useCallback(
    throttle(() => {
      const stage = stageRef.current;
      if (!stage) return;
      stage.batchDraw();
    }, 16),
    []
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.on("dragmove", handleDragMove);
    return () => stage.off("dragmove", handleDragMove);
  }, [handleDragMove]);

  const handleCenterPolygon = useCallback(() => {
    const polygon = convertToPointObjects(dxfStore.externalWallPolygon);
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

    const newPos = {
      x: dimensions.width / 4 - centerX * scale + 50,
      y: dimensions.height / 2 - centerY * scale,
    };

    const stage = stageRef.current;
    if (!stage) return;

    stage.scale({ x: scale, y: scale });
    stage.position(newPos);
    stage.batchDraw();

    setStageTransform({
      x: newPos.x,
      y: newPos.y,
      scale,
    });
  }, [dimensions]);

  return (
    <div
      className="canvas-container"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      <button
        className="absolute top-2.5 left-2.5 px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
        onClick={handleCenterPolygon}
        data-tooltip-id="center-polygon-tooltip"
        data-tooltip-content="Center on Polygon"
        data-tooltip-place="top"
      >
        <BsBorderCenter className="text-2xl font-bold" strokeWidth={0.4} />
      </button>

      <button
        className="absolute top-2.5 left-[4.5rem] px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
        onClick={() => setIs3D((prev) => !prev)}
        data-tooltip-id="center-polygon-tooltip"
        data-tooltip-content="3D View"
        data-tooltip-place="top"
      >
        <IoCubeOutline className="text-2xl font-bold" strokeWidth={0.4} />
      </button>

      <Tooltip id="center-polygon-tooltip" />

      {is3D && (
        <div style={{ width: "100%", height: "100vh", display: "flex" }}>
          <Canvas
            style={{ width: "60%", height: "100%" }}
            camera={{ position: [0, 0, 1000], fov: 20, near: 1, far: 10000 }}
          >
            <Experience />
          </Canvas>
        </div>
      )}

      {!is3D && (
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
          <FastLayer listening={false}>
            <CircleDrawer circles={circles} />
            <LineDrawer lines={lines} />
            <TextDrawer texts={texts} />
            <EllipseDrawer ellipses={ellipses} />
          </FastLayer>
        </Stage>
      )}
    </div>
  );
});

export default CanvasZoomPan;