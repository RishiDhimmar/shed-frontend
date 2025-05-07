// import { Stage, Layer, Circle, Rect, Line, Text } from "react-konva";
// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useMemo,
//   useCallback,
// } from "react";
// import Konva from "konva";
// import uiStore from "../../stores/UIStore";
// import dxfStore from "../../stores/DxfStore";
// import baseplateStore from "../../stores/BasePlateStore";
// import columnStore from "../../stores/ColumnStore";
// import foundationStore from "../../stores/FoundationStore";
// import { observer } from "mobx-react-lite";
// import mullionColumnStore from "../../stores/MullianColumnStore";
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
// import Dimension from "../canvas2d/Dimentions";

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

// const getCenterPoint = (p1: Point, p2: Point): Point => ({
//   x: (p1.x + p2.x) / 2,
//   y: (p1.y + p2.y) / 2,
// });

// const getDistance = (p1: Point, p2: Point): number => {
//   return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
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

//   // Resize handler with debounce
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

//   // Data memoization
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

//   // Calculate bounds for auto-scaling
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

//   // Auto-scaling and centering
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

//   // Smooth zoom animation
//   const animateStage = useCallback((targetPos: Point, targetScale: number) => {
//     if (zoomTweenRef.current) {
//       zoomTweenRef.current.destroy();
//     }

//     zoomTweenRef.current = new Konva.Tween({
//       node: stageRef.current,
//       duration: 0.1,
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

//   // Wheel zoom handler
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

//   return (
//     <div
//       className="canvas-container"
//       style={{ width: "100vw", height: "100vh" }}
//     >
//       <Stage
//         ref={stageRef}
//         width={dimensions.width}
//         height={dimensions.height}
//         x={stageTransform.x}
//         y={stageTransform.y}
//         scaleX={stageTransform.scale}
//         scaleY={stageTransform.scale}
//         draggable
//         onWheel={handleWheel}
//       >
//         <Layer listening={false}>
//           {/* Static elements now draw directly on top of the black CSS background */}
//           <CircleDrawer circles={circles} />
//           <LineDrawer lines={lines} />
//           <TextDrawer texts={texts} />
//           <EllipseDrawer ellipses={ellipses} />
//         </Layer>
//         <Layer>
//           {/* ... your interactive overlays */}
//           <PolygonsDrawer polygons={polygons} />
//           <Walls />
//           <BasePlate />
//           <Column />
//           <Foundation />
//           <MullionColumn />
//         </Layer>
//         <Layer>
//           {baseplateStore.cornerBasePlates.map((plate) => (
//             <Dimension
//               key={plate.id}
//               p1={{x : plate.points[0].x, y : plate.points[0].y}}
//               p2={{x : plate.points[1].x, y : plate.points[1].y}}

//           ))}

//         </Layer>
//       </Stage>
//     </div>
//   );
// });

// export default CanvasZoomPan;
import { Stage, Layer, Circle, Rect, Line, Text } from "react-konva";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Konva from "konva";
import uiStore from "../../stores/UIStore";
import dxfStore from "../../stores/DxfStore";
import baseplateStore from "../../stores/BasePlateStore";
import columnStore from "../../stores/ColumnStore";
import foundationStore from "../../stores/FoundationStore";
import { observer } from "mobx-react-lite";
import mullionColumnStore from "../../stores/MullianColumnStore";
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
import Dimension from "../canvas2d/Dimentions";

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

const getCenterPoint = (p1: Point, p2: Point): Point => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

const getDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
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

  // Resize handler with debounce
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

  // Data memoization
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

  // Calculate bounds for auto-scaling
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

  // Auto-scaling and centering
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

  // Smooth zoom animation
  const animateStage = useCallback((targetPos: Point, targetScale: number) => {
    if (zoomTweenRef.current) {
      zoomTweenRef.current.destroy();
    }

    zoomTweenRef.current = new Konva.Tween({
      node: stageRef.current,
      duration: 0.1,
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

  // Wheel zoom handler
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

  return (
    <div
      className="canvas-container"
      style={{ width: "100vw", height: "100vh" }}
    >
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
        <Layer listening={false}>
          {/* Static elements */}
          <CircleDrawer circles={circles} />
          <LineDrawer lines={lines} />
          <TextDrawer texts={texts} />
          <EllipseDrawer ellipses={ellipses} />
        </Layer>
        <Layer>
          {/* Your interactive overlays */}
          <PolygonsDrawer polygons={polygons} />
          <Walls />
          <BasePlate />
          <Column />
          <Foundation />
         
          <MullionColumn />
        </Layer>
        <Layer>
          
        </Layer>
      </Stage>
    </div>
  );
});

export default CanvasZoomPan;
