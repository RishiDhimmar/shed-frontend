// import { Stage, Layer, FastLayer } from "react-konva";
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

// const throttle = (fn: Function, delay: number) => {
//   let lastCall = 0;
//   return (...args: any[]) => {
//     const now = Date.now();
//     if (now - lastCall >= delay) {
//       lastCall = now;
//       return fn(...args);
//     }
//   };
// };

// const CanvasZoomPan: React.FC = observer(() => {
//   const stageRef = useRef<Konva.Stage>(null);
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
//   const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const handleResize = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     const debouncedResize = throttle(handleResize, 100);
//     window.addEventListener("resize", debouncedResize);
//     return () => window.removeEventListener("resize", debouncedResize);
//   }, []);

//   const getVisibleShapes = (shapes: any[], stage: Konva.Stage) => {
//     const stageBounds = {
//       x: -stage.x() / stage.scaleX(),
//       y: -stage.y() / stage.scaleY(),
//       width: stage.width() / stage.scaleX(),
//       height: stage.height() / stage.scaleY(),
//     };

//     return shapes.filter((shape) => {
//       if (shape.type === "CIRCLE") {
//         const { center, radius } = shape;
//         const effectiveRadius = radius / stage.scaleX(); // Adjust for scale
//         return (
//           center.x + effectiveRadius >= stageBounds.x &&
//           center.x - effectiveRadius <= stageBounds.x + stageBounds.width &&
//           center.y + effectiveRadius >= stageBounds.y &&
//           center.y - effectiveRadius <= stageBounds.y + stageBounds.height
//         );
//       }
//       return true; // Add logic for lines, polygons, texts, ellipses
//     });
//   };

//   const { circles, lines, polygons, texts, ellipses } = useMemo(() => {
//     const stage = stageRef.current;
//     if (!stage)
//       return { circles: [], lines: [], polygons: [], texts: [], ellipses: [] };

//     return {
//       circles: getVisibleShapes(
//         uiStore.data.curves?.filter((c) => c.type === "CIRCLE") || [],
//         stage
//       ),
//       lines: getVisibleShapes(uiStore.data.lines || [], stage),
//       polygons: getVisibleShapes(uiStore.data.polygons || [], stage),
//       texts: getVisibleShapes(uiStore.data.texts || [], stage),
//       ellipses: getVisibleShapes(
//         uiStore.data.curves?.filter((c) => c.type === "ELLIPSE") || [],
//         stage
//       ),
//     };
//   }, [uiStore.data, stageTransform]);

//   const bounds = useMemo(() => {
//     const circles =
//       uiStore.data.curves?.filter((c) => c.type === "CIRCLE") || [];
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
//   }, [uiStore.data.curves]);

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
//   }, [bounds, dimensions, dxfStore.externalWallPolygon]);

//   const handleWheel = useCallback(
//     throttle((e: Konva.KonvaEventObject<WheelEvent>) => {
//       e.evt.preventDefault();
//       const stage = stageRef.current;
//       if (!stage) return;

//       const oldScale = stage.scaleX();
//       const pointer = stage.getPointerPosition();
//       if (!pointer) return;

//       // Smooth zoom step
//       const zoomSpeed = 0.1;
//       const scaleBy = e.evt.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
//       const newScale = oldScale * scaleBy; // No clamping for infinite zoom

//       // Prevent numerical overflow
//       if (isNaN(newScale) || !isFinite(newScale) || newScale < Number.EPSILON) {
//         return;
//       }

//       const mousePoint = {
//         x: (pointer.x - stage.x()) / oldScale,
//         y: (pointer.y - stage.y()) / oldScale,
//       };

//       const newPos = {
//         x: pointer.x - mousePoint.x * newScale,
//         y: pointer.y - mousePoint.y * newScale,
//       };

//       // Normalize position to avoid precision issues at extreme scales
//       if (Math.abs(newPos.x) > 1e10 || Math.abs(newPos.y) > 1e10) {
//         stage.position({ x: 0, y: 0 });
//         stage.scale({ x: 1, y: 1 });
//         setStageTransform({ x: 0, y: 0, scale: 1 });
//         return;
//       }

//       stage.scale({ x: newScale, y: newScale });
//       stage.position(newPos);
//       stage.batchDraw();

//       // Debounce state update to reduce re-renders
//       if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
//       zoomTimeoutRef.current = setTimeout(() => {
//         setStageTransform({
//           x: newPos.x,
//           y: newPos.y,
//           scale: newScale,
//         });
//       }, 100);
//     }, 16), // ~60fps
//     []
//   );

//   const handleDragMove = useCallback(
//     throttle(() => {
//       const stage = stageRef.current;
//       if (!stage) return;
//       stage.batchDraw();
//     }, 16),
//     []
//   );

//   useEffect(() => {
//     const stage = stageRef.current;
//     if (!stage) return;

//     stage.on("dragmove", handleDragMove);
//     return () => stage.off("dragmove", handleDragMove);
//   }, [handleDragMove]);

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

//     const newPos = {
//       x: dimensions.width / 4 - centerX * scale + 50,
//       y: dimensions.height / 2 - centerY * scale,
//     };

//     const stage = stageRef.current;
//     if (!stage) return;

//     stage.scale({ x: scale, y: scale });
//     stage.position(newPos);
//     stage.batchDraw();

//     setStageTransform({
//       x: newPos.x,
//       y: newPos.y,
//       scale,
//     });
//   }, [dimensions]);

//   function handlePlacingBSP(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
//     throw new Error("Function not implemented.");
//   }

//   return (
//     <div className="canvas-container h-[calc(100vh-40px)] overflow-hidden relative w-100vw">
//       <button
//         className="absolute top-2.5 left-2.5 px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
//         onClick={handleCenterPolygon}
//         data-tooltip-id="center-polygon-tooltip"
//         data-tooltip-content="Center on Polygon"
//         data-tooltip-place="top"
//       >
//         <BsBorderCenter className="text-2xl font-bold" strokeWidth={0.4} />
//       </button>

//       <button
//         className="absolute top-2.5 left-[4.5rem] px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
//         onClick={() => setIs3D((prev) => !prev)}
//         data-tooltip-id="center-polygon-tooltip"
//         data-tooltip-content="3D View"
//         data-tooltip-place="top"
//       >
//         <IoCubeOutline className="text-2xl font-bold" strokeWidth={0.4} />
//       </button>
//       <button
//         className="absolute bottom-2.5 right-2.5 px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
//         onClick={handlePlacingBSP}
//         data-tooltip-id="bsp-placing-tooltip"
//         data-tooltip-content="Place Baseplates"
//         data-tooltip-place="top"
//       >
//       Place Baseplates
//       </button>

//       <Tooltip id="center-polygon-tooltip" />

//       {is3D && (
//         <div className="h-[calc(100vh-40px)] w-100vw">
//           <Canvas
//             style={{ width: "100%", height: "100%" }}
//             camera={{ position: [0, 0, 1000], fov: 50, near: 1, far: 10000 }}
//           >
//             <Experience />
//           </Canvas>
//         </div>
//       )}

//       {!is3D && (
//         <Stage
//           ref={stageRef}
//           width={dimensions.width}
//           height={dimensions.height}
//           x={stageTransform.x}
//           y={stageTransform.y}
//           scaleX={stageTransform.scale}
//           scaleY={stageTransform.scale}
//           onWheel={handleWheel}
//           draggable
//         >
//           <Layer>
//             <Walls />
//             <PolygonsDrawer polygons={polygons} />
//             <Column />
//             <Foundation />
//           </Layer>
//           <Layer listening={false}>
//             <CircleDrawer circles={circles} />
//             <LineDrawer lines={lines} />
//             <TextDrawer texts={texts} />
//             <EllipseDrawer ellipses={ellipses} />
//             <BasePlate />
//             <MullionColumn />
//           </Layer>
//         </Stage>
//       )}
//     </div>
//   );
// });

// export default CanvasZoomPan;


import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import CanvasControls from "./CanvasControls";
import Canvas2D from "./Canvas2D";
import Canvas3D from "./Canvas3D";

const CanvasZoomPan: React.FC = observer(() => {
  const [is3D, setIs3D] = useState(false);

  return (
    <div className="canvas-container h-[calc(100vh-40px)] w-full overflow-hidden relative">
      <CanvasControls setIs3D={setIs3D} />
      {is3D ? <Canvas3D /> : <Canvas2D />}
    </div>
  );
});

export default CanvasZoomPan;