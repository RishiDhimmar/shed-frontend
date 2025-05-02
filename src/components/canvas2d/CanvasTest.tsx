// import React, { useMemo, useRef, useState, useEffect } from "react";
// import wallStore from "../../stores/WallStore";
// import uiStore from "../../stores/UIStore";
// import { observer } from "mobx-react-lite";
// import * as data from "../threeenv/Helpers/data.json";
// import * as data2 from "../threeenv/Helpers/data2.json";
// import * as data3 from "../threeenv/Helpers/data3.json";
// import * as data4 from "../threeenv/Helpers/data4.json";
// import * as data5 from "../threeenv/Helpers/data5.json";
// import * as data6 from "../threeenv/Helpers/data6.json";
// import baseplateStore from "../../stores/BasePlateStore";
// import columnStore from "../../stores/ColumnStore";
// import foundationStore from "../../stores/FoundationStore";
// import mullionColumnStore from "../../stores/MullianColumnStore";
// import { CONFIG, TEXT_HEIGHT_WORLD, BALLOON_RADIUS_WORLD, OFFSET_WORLD, DIMENSION_OFFSET_WORLD, MIN_FONT_SIZE } from './Constants';
// import { sortPolygon, filterInnerRectangularPolygons, isPointInPolygon, calculateBoundingBoxArea, doLinesIntersect } from "../../utils/PolygonUtils";
// import { getEdgeCenter, getEdgeNormal, pointToSegmentDistance, distanceBetPoints, projectPointToSegment, calculateWallThickness, isNearExternalWall } from './geometry';
// import { traceAllPolygonsWithRays, getBounds, filterPolygonsByDimension, findClosestPointOnPolygon } from './Polygon';
// import { sortPolygonsClockwise } from "../../utils/sortPolygonsClockwise";

// const dataMap = { data, data2, data3, data4, data5, data6 };

// const CanvasTest = observer(() => {
//   const canvasRef = useRef(null);
//   const count = useRef(0);
//   const [internalPolygons, setInternalPolygons] = useState([]);
//   const [selectedPolygon, setSelectedPolygon] = useState([]);
//   const [secondSelectedPolygon, setSecondSelectedPolygon] = useState(null);
//   const [intersectingPolygons, setIntersectingPolygons] = useState([]);
//   const [selectedKey, setSelectedKey] = useState(null);
//   const [hoveredKey, setHoveredKey] = useState(null);
//   const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [scale, setScale] = useState(1);
//   const isDragging = useRef(false);
//   const lastMousePos = useRef({ x: 0, y: 0 });
//   const [debugRays, setDebugRays] = useState([]);
//   const [showRays, setShowRays] = useState(false);

//   const polygons = useMemo(() => {
//     try {
//       const extracted = uiStore.polygons;
//       return extracted.filter((poly) => poly && poly.length >= 3);
//     } catch (error) {
//       console.error("Failed to extract polygons from DXF:", error);
//       return [];
//     }
//   }, [uiStore.polygons]);

//   useEffect(() => {
//     count.current = 0;
//     setSelectedKey(null);
//     setSelectedPolygon([]);
//     setSecondSelectedPolygon(null);
//     setIntersectingPolygons([]);
//     setInternalPolygons([]);
//     setDebugRays([]);
//     setHoveredKey(null);
//     setShowRays(false);
//     wallStore.externalWallPoints = [];
//     wallStore.internalWallPoints = [];
//     baseplateStore.polygons = [];
//   }, [uiStore.polygons]);

//   const polygonKeys = useMemo(
//     () =>
//       polygons.map((polygon) =>
//         polygon.map((p) => `${p.x.toFixed(4)}:${p.y.toFixed(4)}`).join("-")
//       ),
//     [polygons]
//   );

//   const findBounds = useMemo(() => {
//     let minX = Infinity,
//       minY = Infinity,
//       maxX = -Infinity,
//       maxY = -Infinity;

//     if (polygons.length === 0) {
//       return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
//     }

//     polygons.forEach((polygon) => {
//       polygon.forEach((point) => {
//         minX = Math.min(minX, point.x);
//         minY = Math.min(minY, point.y);
//         maxX = Math.max(maxX, point.x);
//         maxY = Math.max(maxY, point.y);
//       });
//     });

//     return { minX, minY, maxX, maxY };
//   }, [polygons]);

//   useMemo(() => {
//     count.current = 0;
//   }, [uiStore.polygons]);

//   useEffect(() => {
//     if (polygons.length > 0) {
//       const { minX, minY, maxX, maxY } = findBounds;
//       const width = maxX - minX || 1;
//       const height = maxY - minY || 1;
//       const padding = CONFIG.CANVAS_PADDING;

//       const scaleX = (canvasSize.width - padding * 2) / width;
//       const scaleY = (canvasSize.height - padding * 2) / height;
//       const newScale = Math.min(scaleX, scaleY);

//       const newOffsetX = canvasSize.width / 2 - (minX + width / 2) * newScale;
//       const newOffsetY = canvasSize.height / 2 - (minY + height / 2) * newScale;

//       setScale(newScale);
//       setOffset({ x: newOffsetX, y: newOffsetY });
//     }
//   }, [polygons, findBounds, canvasSize]);

//   const handleSelection = (polygonKey, index) => {
//     if (count.current === 0) {
//       const selected = polygons[index];
//       const temp = selected.map((p) => [p.x, p.y, 0]);
//       wallStore.externalWallPoints = temp;
//       setSelectedKey(polygonKey);
//       setSelectedPolygon(selected.map((p) => [p.x, p.y]));

//       const computedInternalPolygons = polygons.filter((poly, i) => {
//         if (i === index) return false;
//         return poly.every((pt) => isPointInPolygon(pt, selected));
//       });

//       if (computedInternalPolygons.length > 0) {
//         const largest = computedInternalPolygons.reduce((max, poly) => {
//           const area = calculateBoundingBoxArea(poly);
//           const maxArea = max ? calculateBoundingBoxArea(max) : 0;
//           return area > maxArea ? poly : max;
//         }, null);

//         const temp = largest ? largest.map((p) => [p.x, p.y, 0]) : [];
//         wallStore.setWallPoints(wallStore.externalWallPoints, temp);
//       } else {
//         wallStore.setWallPoints(wallStore.externalWallPoints, []);
//       }

//       setInternalPolygons(computedInternalPolygons);
//       count.current = 1;
//     } else if (count.current === 1) {
//       const selected = polygons[index];
//       setSelectedKey(polygonKey);
//       const temp = sortPolygon(selected);
//       setSecondSelectedPolygon(temp.map((p) => [p.x, p.y, 0]));

//       const internalRectangularPolygons = filterInnerRectangularPolygons(
//         internalPolygons
//       ).map((polygon) => sortPolygon(polygon));

//       const polyForRays = selected.map((p) => ({ x: p.x, y: p.y }));

//       const { rays, allIntersectingPolygons } = traceAllPolygonsWithRays(
//         polyForRays,
//         internalRectangularPolygons
//       );

//       const filteredPolygons = allIntersectingPolygons.filter((poly, i) => {
//         for (let j = 0; j < allIntersectingPolygons.length; j++) {
//           if (i === j) continue;
//           const otherPoly = allIntersectingPolygons[j];
//           const isContained = poly.every((pt) =>
//             isPointInPolygon(pt, otherPoly)
//           );
//           if (isContained) {
//             const polyArea = calculateBoundingBoxArea(poly);
//             const otherPolyArea = calculateBoundingBoxArea(otherPoly);
//             if (polyArea < otherPolyArea) {
//               return false;
//             }
//           }
//         }
//         return true;
//       });

//       setDebugRays(rays);
//       setIntersectingPolygons(filteredPolygons);
//       const tempPoly = sortPolygonsClockwise(filteredPolygons);

//       baseplateStore.polygons = tempPoly;

//       console.log(filteredPolygons, sortPolygonsClockwise(filteredPolygons));

//       count.current = 2;
//     }
//   };

//   const worldToScreen = (point) => {
//     return {
//       x: point.x * scale + offset.x,
//       y: point.y * scale + offset.y,
//     };
//   };

//   const screenToWorld = (point) => {
//     return {
//       x: (point.x - offset.x) / scale,
//       y: (point.y - offset.y) / scale,
//     };
//   };

//   const drawPolygon = (ctx, polygon, color, lineWidth = 2) => {
//     if (!polygon || polygon.length < 3) return;

//     ctx.beginPath();
//     const firstPoint = Array.isArray(polygon[0])
//       ? worldToScreen({ x: polygon[0][0], y: polygon[0][1] })
//       : worldToScreen(polygon[0]);

//     ctx.moveTo(firstPoint.x, firstPoint.y);

//     for (let i = 1; i < polygon.length; i++) {
//       const point = Array.isArray(polygon[i])
//         ? worldToScreen({ x: polygon[i][0], y: polygon[i][1] })
//         : worldToScreen(polygon[i]);
//       ctx.lineTo(point.x, point.y);
//     }

//     ctx.closePath();
//     ctx.strokeStyle = color;
//     ctx.lineWidth = lineWidth;
//     ctx.stroke();
//   };

//   const isMouseOverPolygon = (mousePos, polygon) => {
//     const THRESHOLD = 5;
//     if (!polygon || polygon.length < 3) return false;

//     for (let i = 0; i < polygon.length; i++) {
//       const p1 = worldToScreen(polygon[i]);
//       const p2 = worldToScreen(polygon[(i + 1) % polygon.length]);

//       const distance = pointToSegmentDistance(mousePos, p1, p2);

//       if (distance < THRESHOLD) {
//         return true;
//       }
//     }

//     return false;
//   };

//   const drawRay = (ctx, ray) => {
//     const start = worldToScreen(ray.start);
//     const end = worldToScreen(ray.end);

//     ctx.beginPath();
//     ctx.moveTo(start.x, start.y);
//     ctx.lineTo(end.x, end.y);
//     ctx.strokeStyle = ray.hit
//       ? "rgba(255, 0, 0, 0.7)"
//       : "rgba(0, 255, 255, 0.7)";
//     ctx.lineWidth = 1;
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.arc(start.x, start.y, 3, 0, Math.PI * 2);
//     ctx.fillStyle = "cyan";
//     ctx.fill();

//     if (ray.hit) {
//       const hitPoint = worldToScreen(ray.hit);
//       ctx.beginPath();
//       ctx.arc(hitPoint.x, hitPoint.y, 4, 0, Math.PI * 2);
//       ctx.fillStyle = "red";
//       ctx.fill();
//     }
//   };

//   const drawDimensionLine = (
//     ctx,
//     start,
//     end,
//     text,
//     offsetX = 0,
//     offsetY = 0
//   ) => {
//     const offsetStart = {
//       x: start.x + offsetX * DIMENSION_OFFSET_WORLD,
//       y: start.y + offsetY * DIMENSION_OFFSET_WORLD,
//     };
//     const offsetEnd = {
//       x: end.x + offsetX * DIMENSION_OFFSET_WORLD,
//       y: end.y + offsetY * DIMENSION_OFFSET_WORLD,
//     };

//     const startScreen = worldToScreen(offsetStart);
//     const endScreen = worldToScreen(offsetEnd);

//     ctx.beginPath();
//     ctx.moveTo(startScreen.x, startScreen.y);
//     ctx.lineTo(endScreen.x, endScreen.y);
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 1;
//     ctx.stroke();

//     const midWorld = {
//       x: (offsetStart.x + offsetEnd.x) / 2,
//       y: (offsetStart.y + offsetEnd.y) / 2,
//     };
//     const dx = offsetEnd.x - offsetStart.x;
//     const dy = offsetEnd.y - offsetStart.y;
//     const len = Math.sqrt(dx * dx + dy * dy);
//     if (len === 0) return;

//     const perpX = -dy / len;
//     const perpY = dx / len;

//     const balloonCenterWorld = {
//       x: midWorld.x + OFFSET_WORLD * perpX,
//       y: midWorld.y + OFFSET_WORLD * perpY,
//     };
//     const balloonCenterScreen = worldToScreen(balloonCenterWorld);

//     const midScreen = worldToScreen(midWorld);
//     ctx.beginPath();
//     ctx.moveTo(midScreen.x, midScreen.y);
//     ctx.lineTo(balloonCenterScreen.x, balloonCenterScreen.y);
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 1;
//     ctx.stroke();

//     const balloonRadiusScreen = BALLOON_RADIUS_WORLD * scale;
//     ctx.beginPath();
//     ctx.arc(
//       balloonCenterScreen.x,
//       balloonCenterScreen.y,
//       balloonRadiusScreen,
//       0,
//       2 * Math.PI
//     );
//     ctx.fillStyle = "white";
//     ctx.fill();
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 1;
//     ctx.stroke();

//     const fontSize = Math.max(MIN_FONT_SIZE, TEXT_HEIGHT_WORLD * scale);
//     ctx.font = `${fontSize}px Arial`;
//     ctx.fillStyle = "black";
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillText(text, balloonCenterScreen.x, balloonCenterScreen.y);
//   };

//   // New function to draw labels at the centroid of polygons
//   const drawPolygonLabel = (ctx, polygon, label) => {
//     if (!polygon || polygon.length < 3) return;

//     // Calculate centroid
//     let centroidX = 0, centroidY = 0;
//     polygon.forEach((point) => {
//       const x = Array.isArray(point) ? point[0] : point.x;
//       const y = Array.isArray(point) ? point[1] : point.y;
//       centroidX += x;
//       centroidY += y;
//     });
//     centroidX /= polygon.length;
//     centroidY /= polygon.length;

//     // Convert centroid to screen coordinates
//     const screenCentroid = worldToScreen({ x: centroidX, y: centroidY });

//     // Draw label
//     const fontSize = Math.max(MIN_FONT_SIZE, TEXT_HEIGHT_WORLD * scale * 1.5); // Slightly larger for visibility
//     ctx.font = `${fontSize}px Arial`;
//     ctx.fillStyle = "black";
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillText(label, screenCentroid.x, screenCentroid.y);
//   };

//   const structures = useMemo(() => {
//     console.log("Recomputing ... ");
//     if (
//       !wallStore.externalWallPoints.length ||
//       !wallStore.internalWallPoints.length ||
//       !baseplateStore.polygons.length
//     ) {
//       return {
//         columns: [],
//         innerFoundation: [],
//         outerFoundation: [],
//         mullionColumns: [],
//       };
//     }

//     const outerWall = wallStore.externalWallPoints.map(([x, y]) => ({ x, y }));
//     const innerWall = wallStore.internalWallPoints.map(([x, y]) => ({ x, y }));
//     const THRESHOLD = columnStore.internalOffset;
//     const INNER_FOUNDATION_OFFSET = 0.75;
//     const OUTER_FOUNDATION_WIDTH = foundationStore.values.corner.pccWidth;
//     const OUTER_FOUNDATION_HEIGHT = foundationStore.values.corner.pccLength;

//     const wallThickness = calculateWallThickness(outerWall, innerWall);

//     const columns = baseplateStore.polygons.map((baseplate) => {
//       const bPoints = baseplate.map((p) => ({ x: p.x, y: p.y }));
//       const bounds = getBounds(bPoints);
//       const expansion = THRESHOLD;

//       let minX = bounds.minX - expansion;
//       let maxX = bounds.maxX + expansion;
//       let minY = bounds.minY - expansion;
//       let maxY = bounds.maxY + expansion;

//       const edges = [
//         {
//           start: { x: minX, y: minY },
//           end: { x: maxX, y: minY },
//           dir: { x: 0, y: -1 },
//           name: "bottom",
//         },
//         {
//           start: { x: maxX, y: minY },
//           end: { x: maxX, y: maxY },
//           dir: { x: 1, y: 0 },
//           name: "right",
//         },
//         {
//           start: { x: maxX, y: maxY },
//           end: { x: minX, y: maxY },
//           dir: { x: 0, y: 1 },
//           name: "top",
//         },
//         {
//           start: { x: minX, y: maxY },
//           end: { x: minX, y: minY },
//           dir: { x: -1, y: 0 },
//           name: "left",
//         },
//       ];

//       const originalBounds = {
//         minX: bounds.minX,
//         maxX: bounds.maxX,
//         minY: bounds.minY,
//         maxY: bounds.maxY,
//       };
//       const newBounds = { minX, maxX, minY, maxY };
//       const intersections = [];
//       let hasIntersection = false;

//       edges.forEach((edge) => {
//         const midPoint = {
//           x: (edge.start.x + edge.end.x) / 2,
//           y: (edge.start.y + edge.end.y) / 2,
//         };
//         const closestInner = findClosestPointOnPolygon(midPoint, innerWall);

//         if (closestInner.distance < THRESHOLD) {
//           const rayStart = closestInner.point;
//           const rayEnd = {
//             x: rayStart.x + edge.dir.x * 1000,
//             y: rayStart.y + edge.dir.y * 1000,
//           };

//           let minDist = Infinity;
//           let intersectionPoint = null;

//           for (let i = 0; i < outerWall.length; i++) {
//             const v = outerWall[i];
//             const w = outerWall[(i + 1) % outerWall.length];
//             const hit = doLinesIntersect(rayStart, rayEnd, v, w, 0.0001);
//             if (hit) {
//               const dist = distanceBetPoints(rayStart, hit);
//               if (dist < minDist) {
//                 minDist = dist;
//                 intersectionPoint = hit;
//               }
//             }
//           }

//           if (intersectionPoint) {
//             hasIntersection = true;
//             intersections.push({ edge: edge.name, point: intersectionPoint });
//             console.log(
//               `Intersection found on ${edge.name}:`,
//               intersectionPoint
//             );
//             if (edge.name === "bottom") {
//               newBounds.minY = Math.min(newBounds.minY, intersectionPoint.y);
//             } else if (edge.name === "right") {
//               newBounds.maxX = Math.max(newBounds.maxX, intersectionPoint.x);
//             } else if (edge.name === "top") {
//               newBounds.maxY = Math.max(newBounds.maxY, intersectionPoint.y);
//             } else if (edge.name === "left") {
//               newBounds.minX = Math.min(newBounds.minX, intersectionPoint.x);
//             }
//           }
//         }
//       });

//       const isExtended =
//         hasIntersection &&
//         (newBounds.minX !== minX ||
//           newBounds.maxX !== maxX ||
//           newBounds.minY !== minY ||
//           newBounds.maxY !== maxY);

//       console.log(
//         "isExtended:",
//         isExtended,
//         "newBounds:",
//         newBounds,
//         "originalBounds:",
//         originalBounds
//       );

//       const isNearEdge = isNearExternalWall(originalBounds, outerWall);

//       return {
//         points: [
//           { x: newBounds.minX, y: newBounds.minY },
//           { x: newBounds.maxX, y: newBounds.minY },
//           { x: newBounds.maxX, y: newBounds.maxY },
//           { x: newBounds.minX, y: newBounds.maxY },
//         ],
//         isExtended,
//         isNearEdge,
//         intersections,
//       };
//     });

//     const innerFoundation = columns.map((column) => {
//       const bounds = getBounds(column.points);
//       return [
//         {
//           x: bounds.minX - INNER_FOUNDATION_OFFSET,
//           y: bounds.minY - INNER_FOUNDATION_OFFSET,
//         },
//         {
//           x: bounds.maxX + INNER_FOUNDATION_OFFSET,
//           y: bounds.minY - INNER_FOUNDATION_OFFSET,
//         },
//         {
//           x: bounds.maxX + INNER_FOUNDATION_OFFSET,
//           y: bounds.maxY + INNER_FOUNDATION_OFFSET,
//         },
//         {
//           x: bounds.minX - INNER_FOUNDATION_OFFSET,
//           y: bounds.maxY + INNER_FOUNDATION_OFFSET,
//         },
//       ];
//     });

//     const outerFoundation = innerFoundation.map((inner) => {
//       const bounds = getBounds(inner);
//       const centerX = (bounds.minX + bounds.maxX) / 2;
//       const centerY = (bounds.minY + bounds.maxY) / 2;
//       const halfWidth = OUTER_FOUNDATION_WIDTH / 2;
//       const halfHeight = OUTER_FOUNDATION_HEIGHT / 2;
//       return [
//         { x: centerX - halfWidth, y: centerY - halfHeight },
//         { x: centerX + halfWidth, y: centerY - halfHeight },
//         { x: centerX + halfWidth, y: centerY + halfHeight },
//         { x: centerX - halfWidth, y: centerY + halfHeight },
//       ];
//     });

//     const mullionColumns = columns
//       .map((column) => {
//         if (!column.isExtended || !column.intersections.length) return null;

//         const bounds = getBounds(column.points);
//         const columnCenter = {
//           x: (bounds.minX + bounds.maxX) / 2,
//           y: (bounds.minY + bounds.maxY) / 2,
//         };

//         const extendedEdges = column.intersections.map((i) => i.edge);
//         const isCornerCase =
//           extendedEdges.length >= 2 &&
//           ((extendedEdges.includes("bottom") &&
//             extendedEdges.includes("right")) ||
//             (extendedEdges.includes("top") &&
//               extendedEdges.includes("right")) ||
//             (extendedEdges.includes("top") && extendedEdges.includes("left")) ||
//             (extendedEdges.includes("bottom") &&
//               extendedEdges.includes("left")));

//         let mullionCenter;

//         if (isCornerCase) {
//           let closestCorner = null;
//           let minDist = Infinity;
//           for (let i = 0; i < outerWall.length; i++) {
//             const vertex = outerWall[i];
//             const dist = distanceBetPoints(columnCenter, vertex);
//             if (dist < minDist) {
//               minDist = dist;
//               closestCorner = vertex;
//             }
//           }

//           const closestInner = findClosestPointOnPolygon(
//             closestCorner,
//             innerWall
//           );

//           mullionCenter = {
//             x: (closestCorner.x + closestInner.point.x) / 2,
//             y: (closestCorner.y + closestInner.point.y) / 2,
//           };
//         } else {
//           const intersectionPoint = column.intersections[0].point;
//           const closestInner = findClosestPointOnPolygon(
//             intersectionPoint,
//             innerWall
//           );
//           mullionCenter = {
//             x:
//               intersectionPoint.x +
//               (closestInner.point.x - intersectionPoint.x) * 0.5,
//             y:
//               intersectionPoint.y +
//               (closestInner.point.y - intersectionPoint.y) * 0.5,
//           };
//         }

//         const halfThickness = wallStore.wallThickness / 2;
//         return [
//           {
//             x: mullionCenter.x - halfThickness,
//             y: mullionCenter.y - halfThickness,
//           },
//           {
//             x: mullionCenter.x + halfThickness,
//             y: mullionCenter.y - halfThickness,
//           },
//           {
//             x: mullionCenter.x + halfThickness,
//             y: mullionCenter.y + halfThickness,
//           },
//           {
//             x: mullionCenter.x - halfThickness,
//             y: mullionCenter.y + halfThickness,
//           },
//         ];
//       })
//       .filter(Boolean);
//     mullionColumnStore.setPolygons(mullionColumns);

//     return {
//       columns: columns.map((c) => c.points),
//       innerFoundation,
//       outerFoundation,
//       mullionColumns,
//     };
//   }, [
//     wallStore.externalWallPoints,
//     wallStore.internalWallPoints,
//     baseplateStore.polygons,
//     columnStore.internalOffset,
//     foundationStore.values.corner.pccWidth,
//     foundationStore.values.corner.pccLength,
//   ]);

//   const draw = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) {
//       console.error("Failed to get canvas context");
//       return;
//     }

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     if (baseplateStore.polygons.length > 0) {
//       if (
//         uiStore.visibility.groundBeam &&
//         wallStore.internalWallPoints.length > 0
//       ) {
//         drawPolygon(ctx, wallStore.internalWallPoints, "cyan", 2);
//       }
//       if (
//         uiStore.visibility.groundBeam &&
//         wallStore.externalWallPoints.length > 0
//       ) {
//         drawPolygon(ctx, wallStore.externalWallPoints, "cyan", 2);
//       }
//       if (uiStore.visibility.shade && wallStore.externalWallPoints.length > 0) {
//         drawPolygon(ctx, wallStore.externalWallPoints, "orange", 2);
//       }

//       if (uiStore.visibility.shade && wallStore.internalWallPoints.length > 0) {
//         drawPolygon(ctx, wallStore.internalWallPoints, "orange", 2);
//       }

//       if (uiStore.visibility.baseplate) {
//         baseplateStore.polygons.forEach((polygon, index) => {
//           if (polygon && polygon.length >= 3) {
//             drawPolygon(ctx, polygon, "lightgreen", 3);
//             // Draw label (e.g., B1, B2, ...)
//             drawPolygonLabel(ctx, polygon, `B${index + 1}`);
//           }
//         });
//       }

//       if (uiStore.visibility.column) {
//         structures.columns.forEach((column, index) => {
//           drawPolygon(ctx, column, "blue", 2);
//           // Draw label (e.g., C1, C2, ...)
//           drawPolygonLabel(ctx, column, `C${index + 1}`);
//         });
//         columnStore.setPolygons(structures.columns);
//       }

//       if (uiStore.visibility.foundation) {
//         structures.innerFoundation.forEach((inner, index) => {
//           drawPolygon(ctx, inner, "magenta", 2);
//           // Draw label (e.g., F1, F2, ...)
//           drawPolygonLabel(ctx, inner, `F${index + 1}`);
//         });
//         foundationStore.setInnerPolygons(structures.innerFoundation);

//         structures.outerFoundation.forEach((outer, index) => {
//           drawPolygon(ctx, outer, "magenta", 2);
//           // Draw label (e.g., F1, F2, ...) for outer foundation
//           drawPolygonLabel(ctx, outer, `F${index + 1}`);
//         });
//         foundationStore.setOuterPolygons(structures.outerFoundation);
//       }

//       if (uiStore.visibility.mullionColumn) {
//         structures.mullionColumns.forEach((mullion) => {
//           drawPolygon(ctx, mullion, "red", 2);
//         });
//       }

//       if (showRays && debugRays.length > 0) {
//         debugRays.forEach((ray) => drawRay(ctx, ray));
//       }

//       if (uiStore.isDimensionsVisible) {
//         if (uiStore.currentComponent === "baseplate") {
//           baseplateStore.polygons.forEach((polygon) => {
//             const bounds = getBounds(polygon);
//             const width = Math.round((bounds.maxX - bounds.minX) * 100);
//             const height = Math.round((bounds.maxY - bounds.minY) * 100);
//             drawDimensionLine(
//               ctx,
//               { x: bounds.minX, y: bounds.minY },
//               { x: bounds.maxX, y: bounds.minY },
//               `${width} mm`,
//               0,
//               -10
//             );
//             drawDimensionLine(
//               ctx,
//               { x: bounds.minX, y: bounds.minY },
//               { x: bounds.minX, y: bounds.maxY },
//               `${height} mm`,
//               -1,
//               0
//             );
//           });
//         }
//         if (uiStore.currentComponent === "column") {
//           structures.columns.forEach((column) => {
//             const bounds = getBounds(column);
//             const width = Math.round((bounds.maxX - bounds.minX) * 100);
//             const height = Math.round((bounds.maxY - bounds.minY) * 100);
//             drawDimensionLine(
//               ctx,
//               { x: bounds.minX, y: bounds.minY },
//               { x: bounds.maxX, y: bounds.minY },
//               `${width} mm`,
//               0,
//               -10
//             );
//             drawDimensionLine(
//               ctx,
//               { x: bounds.minX, y: bounds.minY },
//               { x: bounds.minX, y: bounds.maxY },
//               `${height} mm`,
//               -1,
//               0
//             );
//           });
//         }
//         if (uiStore.currentComponent === "foundation") {
//           [
//             ...structures.innerFoundation,
//             ...structures.outerFoundation,
//           ].forEach((foundation) => {
//             const bounds = getBounds(foundation);
//             const width = Math.round((bounds.maxX - bounds.minX) * 100);
//             const height = Math.round((bounds.maxY - bounds.minY) * 100);
//             drawDimensionLine(
//               ctx,
//               { x: bounds.minX, y: bounds.minY },
//               { x: bounds.maxX, y: bounds.minY },
//               `${width} mm`,
//               0,
//               -1
//             );
//             drawDimensionLine(
//               ctx,
//               { x: bounds.minX, y: bounds.minY },
//               { x: bounds.minX, y: bounds.maxY },
//               `${height} mm`,
//               -1,
//               0
//             );
//           });
//         }
//         if (uiStore.currentComponent === "shade") {
//           [wallStore.externalWallPoints, wallStore.internalWallPoints].forEach(
//             (wall) => {
//               if (wall && wall.length > 0) {
//                 for (let i = 0; i < wall.length; i++) {
//                   const p1 = { x: wall[i][0], y: wall[i][1] };
//                   const p2 = {
//                     x: wall[(i + 1) % wall.length][0],
//                     y: wall[(i + 1) % wall.length][1],
//                   };
//                   const distance = Math.round(distanceBetPoints(p1, p2) * 100);
//                   const dx = p2.x - p1.x;
//                   const dy = p2.y - p1.y;
//                   const len = Math.sqrt(dx * dx + dy * dy);
//                   if (len === 0) continue;
//                   const perpX = -dy / len;
//                   const perpY = dx / len;
//                   drawDimensionLine(
//                     ctx,
//                     p1,
//                     p2,
//                     `${distance} mm`,
//                     perpX,
//                     perpY
//                   );
//                 }
//               }
//             }
//           );
//         }
//       }
//     } else {
//       polygons.forEach((polygon, index) => {
//         if (!polygon || polygon.length < 3) return;
//         const k = polygonKeys[index];
//         const isSelected = k === selectedKey;
//         const color = isSelected ? "blue" : k === hoveredKey ? "orange" : "red";
//         drawPolygon(ctx, polygon, color);
//       });

//       if (wallStore.externalWallPoints.length > 0) {
//         drawPolygon(ctx, wallStore.externalWallPoints, "orange", 2);
//       }
//       if (wallStore.internalWallPoints.length > 0) {
//         drawPolygon(ctx, wallStore.internalWallPoints, "orange", 2);
//       }
//       if (secondSelectedPolygon) {
//         drawPolygon(ctx, secondSelectedPolygon, "lightgreen", 2);
//       }
//       intersectingPolygons.forEach((polygon, index) => {
//         if (polygon && polygon.length >= 3) {
//           drawPolygon(ctx, polygon, "lightgreen", 3);
//           // Draw label for intersecting polygons (assuming they are baseplates)
//           drawPolygonLabel(ctx, polygon, `B${index + 1}`);
//         }
//       });

//       structures.columns.forEach((column, index) => {
//         drawPolygon(ctx, column, "blue", 2);
//         // Draw label for columns
//         drawPolygonLabel(ctx, column, `C${index + 1}`);
//       });

//       structures.innerFoundation.forEach((inner, index) => {
//         drawPolygon(ctx, inner, "magenta", 2);
//         // Draw label for inner foundation
//         drawPolygonLabel(ctx, inner, `F${index + 1}`);
//       });

//       structures.outerFoundation.forEach((outer, index) => {
//         drawPolygon(ctx, outer, "magenta", 2);
//         // Draw label for outer foundation
//         drawPolygonLabel(ctx, outer, `F${index + 1}`);
//       });

//       if (showRays && debugRays.length > 0) {
//         debugRays.forEach((ray) => drawRay(ctx, ray));
//       }

//       if (uiStore.isDimensionsVisible) {
//         if (uiStore.visibility.shade) {
//           [wallStore.externalWallPoints, wallStore.internalWallPoints].forEach(
//             (wall) => {
//               if (wall && wall.length > 0) {
//                 for (let i = 0; i < wall.length; i++) {
//                   const p1 = { x: wall[i][0], y: wall[i][1] };
//                   const p2 = {
//                     x: wall[(i + 1) % wall.length][0],
//                     y: wall[(i + 1) % wall.length][1],
//                   };
//                   const distance = Math.round(distanceBetPoints(p1, p2) * 100);
//                   const dx = p2.x - p1.x;
//                   const dy = p2.y - p1.y;
//                   const len = Math.sqrt(dx * dx + dy * dy);
//                   if (len === 0) continue;
//                   const perpX = -dy / len;
//                   const perpY = dx / len;
//                   drawDimensionLine(
//                     ctx,
//                     p1,
//                     p2,
//                     `${distance} mm`,
//                     perpX,
//                     perpY
//                   );
//                 }
//               }
//             }
//           );
//         }
//       }
//     }
//   };

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const handleMouseMove = (e) => {
//       const rect = canvas.getBoundingClientRect();
//       const mousePos = {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       };

//       if (isDragging.current) {
//         const dx = mousePos.x - lastMousePos.current.x;
//         const dy = mousePos.y - lastMousePos.current.y;

//         setOffset((prev) => ({
//           x: prev.x + dx,
//           y: prev.y + dy,
//         }));

//         lastMousePos.current = mousePos;
//       } else {
//         let foundHover = false;

//         for (let i = 0; i < polygons.length; i++) {
//           if (isMouseOverPolygon(mousePos, polygons[i])) {
//             setHoveredKey(polygonKeys[i]);
//             foundHover = true;
//             canvas.style.cursor = "pointer";
//             break;
//           }
//         }

//         if (!foundHover) {
//           setHoveredKey(null);
//           canvas.style.cursor = "default";
//         }
//       }
//     };

//     const handleMouseDown = (e) => {
//       if (e.button === 1 || e.button === 2) {
//         isDragging.current = true;
//         canvas.style.cursor = "grabbing";

//         const rect = canvas.getBoundingClientRect();
//         lastMousePos.current = {
//           x: e.clientX - rect.left,
//           y: e.clientY - rect.top,
//         };
//       } else {
//         const rect = canvas.getBoundingClientRect();
//         const mousePos = {
//           x: e.clientX - rect.left,
//           y: e.clientY - rect.top,
//         };

//         for (let i = 0; i < polygons.length; i++) {
//           if (isMouseOverPolygon(mousePos, polygons[i])) {
//             handleSelection(polygonKeys[i], i);
//             break;
//           }
//         }
//       }
//     };

//     const handleMouseUp = () => {
//       isDragging.current = false;
//       canvas.style.cursor = "default";
//     };

//     const handleWheel = (e) => {
//       e.preventDefault();

//       const rect = canvas.getBoundingClientRect();
//       const mousePos = {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       };

//       const worldPoint = screenToWorld(mousePos);
//       const delta = e.deltaY > 0 ? -CONFIG.ZOOM_STEP : CONFIG.ZOOM_STEP;
//       const newScale = scale * (1 + delta);

//       const newScreenPoint = {
//         x: worldPoint.x * newScale + offset.x,
//         y: worldPoint.y * newScale + offset.y,
//       };

//       const offsetX = mousePos.x - newScreenPoint.x;
//       const offsetY = mousePos.y - newScreenPoint.y;

//       setScale(newScale);
//       setOffset((prev) => ({
//         x: prev.x + offsetX,
//         y: prev.y + offsetY,
//       }));
//     };

//     const handleContextMenu = (e) => {
//       e.preventDefault();
//     };

//     canvas.addEventListener("mousemove", handleMouseMove);
//     canvas.addEventListener("mousedown", handleMouseDown);
//     canvas.addEventListener("mouseup", handleMouseUp);
//     canvas.addEventListener("mouseleave", handleMouseUp);
//     canvas.addEventListener("wheel", handleWheel, { passive: false });
//     canvas.addEventListener("contextmenu", handleContextMenu);

//     return () => {
//       canvas.removeEventListener("mousemove", handleMouseMove);
//       canvas.removeEventListener("mousedown", handleMouseDown);
//       canvas.removeEventListener("mouseup", handleMouseUp);
//       canvas.removeEventListener("mouseleave", handleMouseUp);
//       canvas.removeEventListener("wheel", handleWheel);
//       canvas.removeEventListener("contextmenu", handleContextMenu);
//     };
//   }, [polygons, polygonKeys, scale, offset]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const handleResize = () => {
//       const container = canvas.parentElement;
//       if (!container) return;

//       const width = container.clientWidth;
//       const height = container.clientHeight;
//       const dpr = window.devicePixelRatio || 1;

//       canvas.width = width * dpr;
//       canvas.height = height * dpr;

//       canvas.style.width = `${width}px`;
//       canvas.style.height = `${height}px`;

//       const ctx = canvas.getContext("2d");
//       ctx?.scale(dpr, dpr);

//       setCanvasSize({ width, height });
//     };

//     const container = canvas.parentElement;
//     if (!container) return;

//     const resizeObserver = new ResizeObserver(handleResize);
//     resizeObserver.observe(container);

//     handleResize();

//     return () => resizeObserver.disconnect();
//   }, []);

//   useEffect(() => {
//     draw();
//   }, [
//     polygons,
//     canvasRef,
//     selectedKey,
//     hoveredKey,
//     selectedPolygon,
//     secondSelectedPolygon,
//     intersectingPolygons,
//     scale,
//     offset,
//     debugRays,
//     showRays,
//     structures,
//     uiStore.visibility.shade,
//     uiStore.visibility.baseplate,
//     uiStore.visibility.column,
//     uiStore.visibility.foundation,
//     uiStore.visibility.mullionColumn,
//     uiStore.isDimensionsVisible,
//   ]);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "Escape") {
//         count.current = 0;
//         setSelectedKey(null);
//         setSelectedPolygon([]);
//         setSecondSelectedPolygon(null);
//         setIntersectingPolygons([]);
//         setDebugRays([]);
//         wallStore.externalWallPoints = [];
//         wallStore.internalWallPoints = [];
//       } else if (e.key === "+" || e.key === "=") {
//         const newScale = scale * 1.1;
//         setScale(newScale);

//         const centerX = canvasSize.width / 2;
//         const centerY = canvasSize.height / 2;
//         const worldCenter = screenToWorld({ x: centerX, y: centerY });
//         const newScreenCenter = {
//           x: worldCenter.x * newScale + offset.x,
//           y: worldCenter.y * newScale + offset.y,
//         };

//         setOffset({
//           x: offset.x + (centerX - newScreenCenter.x),
//           y: offset.y + (centerY - newScreenCenter.y),
//         });
//       } else if (e.key === "-") {
//         const newScale = scale * 0.9;
//         setScale(newScale);

//         const centerX = canvasSize.width / 2;
//         const centerY = canvasSize.height / 2;
//         const worldCenter = screenToWorld({ x: centerX, y: centerY });
//         const newScreenCenter = {
//           x: worldCenter.x * newScale + offset.x,
//           y: worldCenter.y * newScale + offset.y,
//         };

//         setOffset({
//           x: offset.x + (centerX - newScreenCenter.x),
//           y: offset.y + (centerY - newScreenCenter.y),
//         });
//       } else if (e.key === "r") {
//         if (polygons.length > 0) {
//           const { minX, minY, maxX, maxY } = findBounds;
//           const width = maxX - minX || 1;
//           const height = maxY - minY || 1;
//           const padding = CONFIG.CANVAS_PADDING;

//           const scaleX = (canvasSize.width - padding * 2) / width;
//           const scaleY = (canvasSize.height - padding * 2) / height;
//           const newScale = Math.min(scaleX, scaleY);

//           const newOffsetX =
//             canvasSize.width / 2 - (minX + width / 2) * newScale;
//           const newOffsetY =
//             canvasSize.height / 2 - (minY + height / 2) * newScale;

//           setScale(newScale);
//           setOffset({ x: newOffsetX, y: newOffsetY });
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [scale, offset, canvasSize, findBounds, polygons]);

//   return (
//     <div style={{ width: "100%", height: "100%", position: "relative" }}>
//       <canvas
//         ref={canvasRef}
//         width={canvasSize.width}
//         height={canvasSize.height}
//         style={{ display: "block" }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           bottom: "10px",
//           left: "10px",
//           background: "rgba(0,0,0,0.5)",
//           color: "white",
//           padding: "5px",
//           borderRadius: "3px",
//           fontSize: "12px",
//         }}
//       >
//         Zoom: {Math.round(scale * 100)}% | Pan: Middle/Right-click drag | Zoom:
//         Mouse wheel or +/- keys | Reset: R key | Clear: Escape key
//       </div>
//       <button
//         onClick={() => setShowRays(!showRays)}
//         style={{
//           position: "absolute",
//           top: "10px",
//           left: "10px",
//           padding: "5px 10px",
//           background: showRays ? "#4CAF50" : "#f44336",
//           color: "white",
//           border: "none",
//           borderRadius: "4px",
//           cursor: "pointer",
//         }}
//       >
//         {showRays ? "Hide Rays" : "Show Rays"}
//       </button>
//     </div>
//   );
// });

// export default CanvasTest;
// Prevent negative scale which would flip the canvas

import { useState, useRef, useEffect } from "react";

export default function CanvasComponent() {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [polygons, setPolygons] = useState([
    { points: [100, 100, 200, 100, 150, 200], color: "#FF5733" },
    { points: [300, 150, 400, 100, 450, 200, 350, 250], color: "#33A1FF" },
    { points: [500, 300, 550, 200, 600, 300], color: "#33FF57" },
  ]);

  // Draw the canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save the current state
    ctx.save();

    // Apply transformations
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);

    // Draw polygons
    polygons.forEach((polygon) => {
      ctx.beginPath();

      const points = polygon.points;
      ctx.moveTo(points[0], points[1]);

      for (let i = 2; i < points.length; i += 2) {
        ctx.lineTo(points[i], points[i + 1]);
      }

      ctx.closePath();
      ctx.fillStyle = polygon.color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1 / scale;
      ctx.stroke();
    });

    // Restore the state
    ctx.restore();
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        drawCanvas();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Store the shapes center for reference
  const shapesCenter = useRef({ x: 0, y: 0, calculated: false });

  // Calculate the center of all shapes once
  const calculateShapesCenter = () => {
    if (shapesCenter.current.calculated) return shapesCenter.current;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    polygons.forEach((polygon) => {
      for (let i = 0; i < polygon.points.length; i += 2) {
        minX = Math.min(minX, polygon.points[i]);
        maxX = Math.max(maxX, polygon.points[i]);
        minY = Math.min(minY, polygon.points[i + 1]);
        maxY = Math.max(maxY, polygon.points[i + 1]);
      }
    });

    shapesCenter.current = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY,
      calculated: true,
    };

    return shapesCenter.current;
  };

  // Redraw when state changes
  useEffect(() => {
    drawCanvas();

    // Apply gentle pull toward center at very small scales
    if (scale < 0.01) {
      const rect = canvasRef.current.getBoundingClientRect();
      const center = calculateShapesCenter();

      // Calculate ideal center position
      const idealX = rect.width / 2 - center.x * scale;
      const idealY = rect.height / 2 - center.y * scale;

      // Calculate how far we are from ideal position
      const distX = idealX - position.x;
      const distY = idealY - position.y;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // If we're significantly off-center
      if (distance > 20) {
        // Pull factor increases as scale decreases
        const pullFactor = Math.max(0, 1 - scale / 0.01); // 0 at 0.01 scale, 1 at 0 scale

        // Apply gentle pull (stronger as scale gets smaller)
        setTimeout(() => {
          setPosition((prev) => ({
            x: prev.x + distX * pullFactor * 0.05,
            y: prev.y + distY * pullFactor * 0.05,
          }));
        }, 16); // Approximately one frame at 60fps
      }
    }
  }, [scale, position, polygons]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Improved wheel handler for infinite zoom
  const handleWheel = (e) => {
    e.preventDefault();

    // Calculate where the mouse is pointing on the canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom factor - logarithmic scaling for smooth experience
    const zoomFactor = 1.1;
    const direction = e.deltaY < 0 ? 1 : -1;
    const factor = Math.pow(zoomFactor, direction);

    // Calculate new scale - works for both very small and very large values
    const newScale = scale * factor;

    // Prevent too small scales that might cause precision issues
    if (newScale > 1e-10 && newScale < 1e10) {
      // Always calculate the point under mouse in canvas coordinates (before zoom)
      const pointX = (mouseX - position.x) / scale;
      const pointY = (mouseY - position.y) / scale;

      // Calculate new position to keep the point under mouse
      const newPosition = {
        x: mouseX - pointX * newScale,
        y: mouseY - pointY * newScale,
      };

      // Apply the new scale and position
      setScale(newScale);
      setPosition(newPosition);

      // Gradually reveal shapes if they're getting too far away at small scales
      if (newScale < 0.01) {
        // Calculate the center of all polygons
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        polygons.forEach((polygon) => {
          for (let i = 0; i < polygon.points.length; i += 2) {
            minX = Math.min(minX, polygon.points[i]);
            maxX = Math.max(maxX, polygon.points[i]);
            minY = Math.min(minY, polygon.points[i + 1]);
            maxY = Math.max(maxY, polygon.points[i + 1]);
          }
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Position where shapes would be centered
        const idealX = rect.width / 2 - centerX * newScale;
        const idealY = rect.height / 2 - centerY * newScale;

        // Calculate distance to ideal center
        const distX = idealX - newPosition.x;
        const distY = idealY - newPosition.y;

        // Apply a pull-force toward center that increases as scale decreases
        // This creates a gradual attraction instead of a sudden jump
        const pullFactor = Math.max(0, 1 - newScale / 0.01); // 0 at 0.01 scale, 1 at 0 scale

        // Add the attraction force
        setTimeout(() => {
          setPosition((prev) => ({
            x: prev.x + distX * pullFactor * 0.1,
            y: prev.y + distY * pullFactor * 0.1,
          }));
        }, 10);
      }
    }
  };

  // Reset view with shapes centering
  const resetView = () => {
    const rect = canvasRef.current.getBoundingClientRect();

    // Calculate the center and boundaries of all polygons
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    polygons.forEach((polygon) => {
      for (let i = 0; i < polygon.points.length; i += 2) {
        minX = Math.min(minX, polygon.points[i]);
        maxX = Math.max(maxX, polygon.points[i]);
        minY = Math.min(minY, polygon.points[i + 1]);
        maxY = Math.max(maxY, polygon.points[i + 1]);
      }
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate scale to fit all shapes with padding
    const padding = 40; // pixels of padding
    const scaleX = (rect.width - padding * 2) / width;
    const scaleY = (rect.height - padding * 2) / height;
    const newScale = Math.min(scaleX, scaleY, 1); // Use original scale (1) if shapes are small

    // Center the shapes in the view
    const newPosition = {
      x: rect.width / 2 - centerX * newScale,
      y: rect.height / 2 - centerY * newScale,
    };

    setScale(newScale);
    setPosition(newPosition);
  };

  // Improved zoom controls with better scaling factors
  const zoomIn = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate point under center in canvas coordinates
    const pointX = (centerX - position.x) / scale;
    const pointY = (centerY - position.y) / scale;

    // Use fixed factor for consistent zooming
    const newScale = scale * 1.5;

    if (newScale < 1e10) {
      // Calculate new position to keep the center point
      const newPosition = {
        x: centerX - pointX * newScale,
        y: centerY - pointY * newScale,
      };

      setScale(newScale);
      setPosition(newPosition);
    }
  };

  const zoomOut = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Use fixed factor for consistent zooming
    const newScale = scale / 1.5;

    if (newScale > 1e-10) {
      // Always calculate normal zoom position first
      const pointX = (centerX - position.x) / scale;
      const pointY = (centerY - position.y) / scale;

      // Calculate new position to keep the center point
      const newPosition = {
        x: centerX - pointX * newScale,
        y: centerY - pointY * newScale,
      };

      setScale(newScale);
      setPosition(newPosition);

      // Apply gradual centering for small scales
      if (newScale < 0.01) {
        // Calculate the center of all polygons
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        polygons.forEach((polygon) => {
          for (let i = 0; i < polygon.points.length; i += 2) {
            minX = Math.min(minX, polygon.points[i]);
            maxX = Math.max(maxX, polygon.points[i]);
            minY = Math.min(minY, polygon.points[i + 1]);
            maxY = Math.max(maxY, polygon.points[i + 1]);
          }
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Position where shapes would be centered
        const idealX = rect.width / 2 - centerX * newScale;
        const idealY = rect.height / 2 - centerY * newScale;

        // Calculate distance to ideal center
        const distX = idealX - newPosition.x;
        const distY = idealY - newPosition.y;

        // Apply a pull-force toward center that increases as scale decreases
        const pullFactor = Math.max(0, 1 - newScale / 0.01); // 0 at 0.01 scale, 1 at 0 scale

        // Add the attraction force
        setTimeout(() => {
          setPosition((prev) => ({
            x: prev.x + distX * pullFactor * 0.3,
            y: prev.y + distY * pullFactor * 0.3,
          }));
        }, 10);
      }
    }
  };

  // Format scale display with appropriate units
  const formatScale = (scaleValue) => {
    if (scaleValue >= 0.01 && scaleValue < 100) {
      // Show as percentage for "normal" ranges
      return `${(scaleValue * 100).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}%`;
    } else if (scaleValue < 0.01) {
      // Show scientific notation for very small values
      return scaleValue.toExponential(2);
    } else {
      // Show multiplicative factor for large values
      return `${scaleValue.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}x`;
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-grow relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        />
      </div>
    </div>
  );
}
