// import React from "react";
// import { Arc, Circle, Group, Line, Text } from "react-konva";
// import { observer } from "mobx-react-lite";
// import uiStore from "../../stores/UIStore";
// import dxfStore from "../../stores/DxfStore";
// import mullionColumnStore from "../../stores/MullianColumnStore"; // Consider renaming to 'MullionColumnStore'
// import wallStore from "../../stores/WallStore";
// import { Shed2DConfig } from "../../Constants";
// import { convertToPointObjects, sortPolygon } from "../../utils/PolygonUtils";
// import { Html } from "react-konva-utils";
// import { FaPlus } from "react-icons/fa6";
// import Dimension from "./Dimentions";
// import { distanceBetPoints } from "./Polygon";
// import { FaEdit } from "react-icons/fa";

// const Walls = observer(() => {
//   const { visibility, currentComponent } = uiStore;
//   const externalWall = dxfStore.externalWallPolygon;
//   const internalWall = dxfStore.internalWallPolygon?.filter(
//     (_, index) => index % 3 !== 2
//   );
//   const isGroundBeam = currentComponent === "groundBeam";

//   const renderWallLine = (
//     points: number[],
//     stroke: string,
//     fill?: string,
//     opacity = 1
//   ) => (
//     <Line
//       points={points}
//       stroke={stroke}
//       strokeWidth={Shed2DConfig.strokeWidth.WALLS}
//       closed
//       fill={fill}
//       opacity={opacity}
//       listening={false}
//     />
//   );

//   return (
//     <>
//       {/* Shade - External Wall */}
//       {visibility.shade &&
//         externalWall &&
//         renderWallLine(externalWall, "#FF7F00")}

//       {/* Shade - Internal Wall */}
//       {visibility.shade &&
//         internalWall &&
//         renderWallLine(internalWall, "#FF7F00")}

//       {/* Ground Beam - External Wall */}
//       {visibility.groundBeam &&
//         externalWall &&
//         renderWallLine(
//           externalWall,
//           "cyan",
//           isGroundBeam ? "cyan" : undefined,
//           isGroundBeam ? 1 : 0
//         )}

//       {/* Ground Beam - Internal Wall */}
//       {visibility.groundBeam &&
//         internalWall &&
//         renderWallLine(
//           internalWall,
//           "#FF7F00",
//           isGroundBeam ? "white" : undefined,
//           isGroundBeam ? 1 : 0
//         )}

//       {/* Mullion Column Labels */}
//       {uiStore.currentComponent === "groundBeam" &&
//         mullionColumnStore.polygons.map((polygon, index) => {
//           const current = polygon.points[0];
//           const next =
//             mullionColumnStore.polygons[
//               (index + 1) % mullionColumnStore.polygons.length
//             ].points[0];
//           const label = polygon.label?.slice(1);

//           return (
//             <Text
//               key={index}
//               x={(current.x + next.x) / 2}
//               y={(current.y + next.y) / 2}
//               text={`G${label}`}
//               fontSize={150}
//               fill="cyan"
//               stroke={"black"}
//               strokeWidth={5}
//               listening={false}
//             />
//           );
//         })}
//       {wallStore.modifyMode && (
//         <>
//           {dxfStore.externalWallPoints.map((point, index) => (
//             <Circle
//               key={index}
//               x={point.x}
//               y={point.y}
//               radius={10}
//               stroke="#000000"
//               fill="#FF7F00"
//               strokeWidth={1}
//               draggable
//               cursor="pointer"
//               onDragMove={(e) => {
//                 const newX = e.target.x();
//                 const newY = e.target.y();

//                 // Update the point in-place if using MobX
//                 dxfStore.externalWallPoints[index].x = newX;
//                 dxfStore.externalWallPoints[index].y = newY;

//                 // Optional: update externalWallPolygon if it's derived
//                 dxfStore.externalWallPolygon =
//                   dxfStore.externalWallPoints.flatMap((p) => [p.x, p.y]);
//               }}
//             />
//           ))}
//           {dxfStore.externalWallPoints.map((pt, i, arr) => {
//             const prev = arr[(i - 1 + arr.length) % arr.length];
//             const next = arr[(i + 1) % arr.length];

//             // vectors from pt
//             const v1 = { x: prev.x - pt.x, y: prev.y - pt.y };
//             const v2 = { x: next.x - pt.x, y: next.y - pt.y };

//             // unsigned angle between them (0–180)
//             const dot = v1.x * v2.x + v1.y * v2.y;
//             const mag1 = Math.hypot(v1.x, v1.y);
//             const mag2 = Math.hypot(v2.x, v2.y);
//             const baseAngle =
//               mag1 && mag2
//                 ? (Math.acos(dot / (mag1 * mag2)) * 180) / Math.PI
//                 : 0;

//             // determine concave vs convex
//             const cross = v1.x * v2.y - v1.y * v2.x;
//             const isReflex = cross < 0;

//             // pick interior angle and start ray
//             const interiorDeg = isReflex ? baseAngle : 360 - baseAngle;
//             const ang2 = (Math.atan2(v1.y, v1.x) * 180) / Math.PI;
//             const ang1 = (Math.atan2(v2.y, v2.x) * 180) / Math.PI;
//             const startRotation = isReflex ? ang2 : ang1;

//             // midpoint for “+”
//             const midX = (pt.x + next.x) / 2;
//             const midY = (pt.y + next.y) / 2;

//             return (
//               <React.Fragment key={i}>
//                 {/* draggable handle */}
//                 <Circle
//                   x={pt.x}
//                   y={pt.y}
//                   radius={10}
//                   stroke="#000"
//                   fill="#FF7F00"
//                   strokeWidth={1}
//                   draggable
//                   cursor="pointer"
//                   onDragMove={(e) => {
//                     pt.x = e.target.x();
//                     pt.y = e.target.y();
//                     dxfStore.externalWallPolygon =
//                       dxfStore.externalWallPoints.flatMap((p) => [p.x, p.y]);
//                   }}
//                 />
//                 <Dimension
//                   p1={prev}
//                   p2={pt}
//                   offset={50}
//                   label={distanceBetPoints(prev, pt).toFixed(2)}
//                   isVertical={false}
//                   dragPosition={pt}
//                   color="#FF7F00"
//                   fontSize={10}
//                   textStrokeWidth={0.2}
//                 />
//                 <Group x={midX} y={midY }>
//                   <Html>
//                     <div
//                       onClick={() => {
//                         // current segment length
//                         const currLen = distanceBetPoints(pt, next);
//                         const input = prompt(
//                           `Set new length for segment ${i}–${
//                             (i + 1) % arr.length
//                           }:`,
//                           currLen.toFixed(2)
//                         );
//                         const newLen = parseFloat(input ?? "");
//                         if (isNaN(newLen) || newLen <= 0) return;

//                         // unit direction from pt → next
//                         const dx = next.x - pt.x;
//                         const dy = next.y - pt.y;
//                         const mag = Math.hypot(dx, dy);
//                         if (mag === 0) return;
//                         const ux = dx / mag;
//                         const uy = dy / mag;

//                         // compute midpoint (fixed)
//                         const centerX = (pt.x + next.x) / 2;
//                         const centerY = (pt.y + next.y) / 2;

//                         // half of the new length
//                         const half = newLen / 2;

//                         // new endpoint positions
//                         const newStart = {
//                           x: centerX - ux * half,
//                           y: centerY - uy * half,
//                         };
//                         const newEnd = {
//                           x: centerX + ux * half,
//                           y: centerY + uy * half,
//                         };

//                         // apply to both points
//                         dxfStore.externalWallPoints[i].x = newStart.x;
//                         dxfStore.externalWallPoints[i].y = newStart.y;
//                         const idxNext = (i + 1) % arr.length;
//                         dxfStore.externalWallPoints[idxNext].x = newEnd.x;
//                         dxfStore.externalWallPoints[idxNext].y = newEnd.y;

//                         // re-flatten for redraw
//                         dxfStore.externalWallPolygon =
//                           dxfStore.externalWallPoints.flatMap((p) => [
//                             p.x,
//                             p.y,
//                           ]);
//                       }}
//                       className="text-2xl bg-gray-200 w-8 h-8 flex items-center justify-center border border-gray-400 rounded cursor-pointer hover:bg-gray-300"
//                     >
//                       <FaEdit />
//                     </div>
//                   </Html>
//                 </Group>

//                 {/* + button at midpoint (omitted for brevity) */}
//                 <Group x={midX - 35} y={midY }>
//                   <Html>
//                     <div
//                       className="text-2xl bg-gray-200 w-8 h-8 flex items-center justify-center border border-gray-400 rounded cursor-pointer hover:bg-gray-300"
//                       onClick={() => {
//                         const newPoint = { x: midX, y: midY };
//                         dxfStore.externalWallPoints.splice(i + 1, 0, newPoint);
//                         dxfStore.externalWallPolygon =
//                           dxfStore.externalWallPoints.flatMap((p) => [
//                             p.x,
//                             p.y,
//                           ]);
//                       }}
//                     >
//                       <FaPlus />
//                     </div>
//                   </Html>
//                 </Group>
//                 {/* angle text */}

//                 {/* arc showing the interior angle */}
//                 <Arc
//                   x={pt.x}
//                   y={pt.y}
//                   innerRadius={0}
//                   outerRadius={50}
//                   angle={interiorDeg}
//                   rotation={ang1}
//                   stroke="black"
//                   strokeWidth={3}
//                   listening={false}
//                 />
//                 <Group x={pt.x - 40} y={pt.y - 40}>
//                   <Html>
//                     <div className="text-xs font-semibold bg-gray-100 rounded p-2">
//                       {interiorDeg.toFixed(2) + "°"}
//                     </div>
//                   </Html>
//                 </Group>
//               </React.Fragment>
//             );
//           })}
//         </>
//       )}
//     </>
//   );
// });

// export default Walls;

import React, { useState } from "react";
import { Arc, Circle, Group, Line, Text } from "react-konva";
import { observer } from "mobx-react-lite";
import uiStore from "../../stores/UIStore";
import dxfStore from "../../stores/DxfStore";
import mullionColumnStore from "../../stores/MullianColumnStore"; // Consider renaming to 'MullionColumnStore'
import wallStore from "../../stores/WallStore";
import { Shed2DConfig } from "../../Constants";
import { convertToPointObjects, sortPolygon } from "../../utils/PolygonUtils";
import { Html } from "react-konva-utils";
import { FaPlus } from "react-icons/fa6";
import Dimension from "./Dimentions";
import { distanceBetPoints } from "./Polygon";
import { FaEdit } from "react-icons/fa";

const Walls: React.FC = observer(() => {
  const { visibility, currentComponent } = uiStore;
  const externalWall = dxfStore.externalWallPolygon;
  const internalWall = dxfStore.internalWallPolygon?.filter(
    (_, index) => index % 3 !== 2,
  );
  const isGroundBeam = currentComponent === "groundBeam";
  const [editingIndex, setEditingIndex] = useState(null);
  const [newLength, setNewLength] = useState("");

  const renderWallLine = (
    points: number[],
    stroke: string,
    fill?: string,
    opacity = 1,
  ) => (
    <Line
      points={points}
      stroke={stroke}
      strokeWidth={Shed2DConfig.strokeWidth.WALLS}
      closed
      fill={fill}
      opacity={opacity}
      listening={false}
    />
  );

  const handleSubmit = (index) => {
    const len = parseFloat(newLength);
    if (isNaN(len) || len <= 0) {
      setEditingIndex(null);
      return;
    }
    const points = dxfStore.externalWallPoints;
    const pt1 = points[index];
    const pt2 = points[(index + 1) % points.length];
    const midX = (pt1.x + pt2.x) / 2;
    const midY = (pt1.y + pt2.y) / 2;
    const dx = pt2.x - pt1.x;
    const dy = pt2.y - pt1.y;
    const mag = Math.hypot(dx, dy);
    if (mag === 0) {
      setEditingIndex(null);
      return;
    }
    const ux = dx / mag;
    const uy = dy / mag;
    const half = len / 2;
    const newStart = {
      x: midX - ux * half,
      y: midY - uy * half,
    };
    const newEnd = {
      x: midX + ux * half,
      y: midY + uy * half,
    };
    points[index].x = newStart.x;
    points[index].y = newStart.y;
    const idxNext = (index + 1) % points.length;
    points[idxNext].x = newEnd.x;
    points[idxNext].y = newEnd.y;
    dxfStore.externalWallPolygon = points.flatMap((p) => [p.x, p.y]);
    setEditingIndex(null);
    setNewLength("");
  };

  return (
    <>
      {/* Shade - External Wall */}
      {visibility.shade &&
        externalWall &&
        renderWallLine(externalWall, "#FF7F00")}

      {/* Shade - Internal Wall */}
      {visibility.shade &&
        internalWall &&
        renderWallLine(internalWall, "#FF7F00")}

      {/* Ground Beam - External Wall */}
      {visibility.groundBeam &&
        externalWall &&
        renderWallLine(
          externalWall,
          "cyan",
          isGroundBeam ? "cyan" : undefined,
          isGroundBeam ? 1 : 0,
        )}

      {/* Ground Beam - Internal Wall */}
      {visibility.groundBeam &&
        internalWall &&
        renderWallLine(
          internalWall,
          "#FF7F00",
          isGroundBeam ? "white" : undefined,
          isGroundBeam ? 1 : 0,
        )}

      {/* Mullion Column Labels */}
      {uiStore.currentComponent === "groundBeam" &&
        mullionColumnStore.polygons.map((polygon, index) => {
          const current = polygon.points[0];
          const next =
            mullionColumnStore.polygons[
              (index + 1) % mullionColumnStore.polygons.length
            ].points[0];
          const label = polygon.label?.slice(1);

          return (
            <Text
              key={index}
              x={(current.x + next.x) / 2}
              y={(current.y + next.y) / 2}
              text={`G${label}`}
              fontSize={150}
              fill="cyan"
              stroke={"black"}
              strokeWidth={5}
              listening={false}
            />
          );
        })}
      {wallStore.modifyMode && (
        <>
          {dxfStore.externalWallPoints.map((point, index) => (
            <Circle
              key={index}
              x={point.x}
              y={point.y}
              radius={10}
              stroke="#000000"
              fill="#FF7F00"
              strokeWidth={1}
              draggable
              cursor="pointer"
              onDragMove={(e) => {
                const newX = e.target.x();
                const newY = e.target.y();
                dxfStore.externalWallPoints[index].x = newX;
                dxfStore.externalWallPoints[index].y = newY;
                dxfStore.externalWallPolygon =
                  dxfStore.externalWallPoints.flatMap((p) => [p.x, p.y]);
              }}
            />
          ))}
          {dxfStore.externalWallPoints.map((pt, i, arr) => {
            const prev = arr[(i - 1 + arr.length) % arr.length];
            const next = arr[(i + 1) % arr.length];
            const v1 = { x: prev.x - pt.x, y: prev.y - pt.y };
            const v2 = { x: next.x - pt.x, y: next.y - pt.y };
            const dot = v1.x * v2.x + v1.y * v2.y;
            const mag1 = Math.hypot(v1.x, v1.y);
            const mag2 = Math.hypot(v2.x, v2.y);
            const baseAngle =
              mag1 && mag2
                ? (Math.acos(dot / (mag1 * mag2)) * 180) / Math.PI
                : 0;
            const cross = v1.x * v2.y - v1.y * v2.x;
            const isReflex = cross < 0;
            const interiorDeg = isReflex ? baseAngle : 360 - baseAngle;
            const ang2 = (Math.atan2(v1.y, v1.x) * 180) / Math.PI;
            const ang1 = (Math.atan2(v2.y, v2.x) * 180) / Math.PI;
            const startRotation = isReflex ? ang2 : ang1;
            const midX = (pt.x + next.x) / 2;
            const midY = (pt.y + next.y) / 2;

            return (
              <React.Fragment key={i}>
                <Circle
                  x={pt.x}
                  y={pt.y}
                  radius={10}
                  stroke="#000"
                  fill="#FF7F00"
                  strokeWidth={1}
                  draggable
                  cursor="pointer"
                  onDragMove={(e) => {
                    pt.x = e.target.x();
                    pt.y = e.target.y();
                    dxfStore.externalWallPolygon =
                      dxfStore.externalWallPoints.flatMap((p) => [p.x, p.y]);
                  }}
                />
                <Dimension
                  p1={prev}
                  p2={pt}
                  offset={50}
                  label={distanceBetPoints(prev, pt).toFixed(2)}
                  isVertical={false}
                  dragPosition={pt}
                  color="#FF7F00"
                  fontSize={10}
                  textStrokeWidth={0.2}
                />
                <Group x={midX} y={midY}>
                  <Html>
                    <div
                      onClick={() => {
                        const currLen = distanceBetPoints(pt, next);
                        setNewLength(currLen.toFixed(2));
                        setEditingIndex(i);
                      }}
                      className="text-2xl bg-gray-200 w-8 h-8 flex items-center justify-center border border-gray-400 rounded cursor-pointer hover:bg-gray-300"
                    >
                      <FaEdit />
                    </div>
                  </Html>
                </Group>
                <Group x={midX - 35} y={midY}>
                  <Html>
                    <div
                      className="text-2xl z-[-1] bg-gray-200 w-8 h-8 flex items-center justify-center border border-gray-400 rounded cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        const newPoint = { x: midX, y: midY };
                        dxfStore.externalWallPoints.splice(i + 1, 0, newPoint);
                        dxfStore.externalWallPolygon =
                          dxfStore.externalWallPoints.flatMap((p) => [
                            p.x,
                            p.y,
                          ]);
                      }}
                    >
                      <FaPlus />
                    </div>
                  </Html>
                </Group>
                <Arc
                  x={pt.x}
                  y={pt.y}
                  innerRadius={0}
                  outerRadius={50}
                  angle={interiorDeg}
                  rotation={ang1}
                  stroke="black"
                  strokeWidth={3}
                  listening={false}
                />
                <Group x={pt.x - 40} y={pt.y - 40}>
                  <Html>
                    <div className="text-xs font-semibold bg-gray-100 rounded p-2">
                      {interiorDeg.toFixed(2) + "°"}
                    </div>
                  </Html>
                </Group>
              </React.Fragment>
            );
          })}
          {editingIndex !== null && (
            <Group>
              {(() => {
                const points = dxfStore.externalWallPoints;
                const idx = editingIndex;
                const pt1 = points[idx];
                const pt2 = points[(idx + 1) % points.length];
                const midX = (pt1.x + pt2.x) / 2;
                const midY = (pt1.y + pt2.y) / 2;
                return (
                  <Group x={midX} y={midY}>
                    <Html>
                      <input
                        type="number"
                        value={newLength}
                        onChange={(e) => setNewLength(e.target.value)}
                        onBlur={() => handleSubmit(editingIndex)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSubmit(editingIndex);
                          }
                        }}
                        placeholder="New length"
                        className="w-24 p-1 border border-gray-400 rounded"
                        style={{ position: "absolute", left: -50, top: -20 }}
                      />
                    </Html>
                  </Group>
                );
              })()}
            </Group>
          )}
        </>
      )}
    </>
  );
});

export default Walls;
