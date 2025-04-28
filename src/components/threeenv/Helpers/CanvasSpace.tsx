// import React, { useMemo, useRef, useState, useEffect } from "react";
// import wallStore from "../../../stores/WallStore";
// import uiStore from "../../../stores/UIStore";
// import { observer } from "mobx-react-lite";
// import * as data from "./data.json";
// import * as data2 from "./data2.json";
// import * as data3 from "./data3.json";
// import * as data4 from "./data4.json";
// import * as data5 from "./data5.json";
// import * as data6 from "./data6.json";
// import {
//   sortPolygon,
//   filterInnerRectangularPolygons,
//   isPointInPolygon,
//   calculateBoundingBoxArea,
//   doLinesIntersect,
// } from "../../../utils/PolygonUtils";
// import { extractPolygonsFromDXF } from "../../../utils/DXFUtils";
// import baseplateStore from "../../../stores/BasePlateStore";
// import columnStore from "../../../stores/ColumnStore";
// import foundationStore from "../../../stores/FoundationStore";

// const CONFIG = {
//   EPSILON: 0.01,
//   SCALE: 1 / 100,
//   RAY_LENGTH: 1000,
//   CANVAS_PADDING: 20,
//   MAX_SCALE: 5,
//   MIN_SCALE: 0.1,
//   ZOOM_STEP: 0.1,
//   EDGE_THRESHOLD: 0.5, // Reduced threshold for stricter edge detection
// };

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

//   const filterPolygonsByDimension = (polygons, referencePolygon, tolerance) => {
//     if (polygons.length === 0 || !referencePolygon) return [];

//     const referenceBounds = getBounds(referencePolygon);
//     const referenceWidth = referenceBounds.maxX - referenceBounds.minX;
//     const referenceHeight = referenceBounds.maxY - referenceBounds.minY;

//     return polygons.filter((polygon) => {
//       const bounds = getBounds(polygon);
//       const width = bounds.maxX - bounds.minX;
//       const height = bounds.maxY - bounds.minY;
//       const widthDiff = Math.abs(width - referenceWidth);
//       const heightDiff = Math.abs(height - referenceHeight);
//       return widthDiff <= tolerance && heightDiff <= tolerance;
//     });
//   };

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
//       baseplateStore.polygons = filteredPolygons;

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

//   const pointToSegmentDistance = (p, v, w) => {
//     const l2 = (w.x - v.x) * (w.x - v.x) + (w.y - v.y) * (w.y - v.y);
//     if (l2 < CONFIG.EPSILON)
//       return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);

//     let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
//     t = Math.max(0, Math.min(1, t));

//     const projection = {
//       x: v.x + t * (w.x - v.x),
//       y: v.y + t * (w.y - v.y),
//     };

//     return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
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

//   const distanceBetPoints = (p1, p2) => {
//     return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
//   };

//   const traceInnerPolygonsWithRays = (startPoly, otherPolys) => {
//     const rays = [];

//     for (let i = 0; i < startPoly.length; i++) {
//       const p1 = startPoly[i];
//       const p2 = startPoly[(i + 1) % startPoly.length];
//       const center = getEdgeCenter(p1, p2);
//       const normal = getEdgeNormal(p1, p2, startPoly);

//       const rayEnd = {
//         x: center.x + normal.x * CONFIG.RAY_LENGTH,
//         y: center.y + normal.y * CONFIG.RAY_LENGTH,
//       };

//       let hits = [];

//       for (const poly of otherPolys) {
//         if (poly === startPoly) continue;

//         for (let j = 0; j < poly.length; j++) {
//           const a = poly[j];
//           const b = poly[(j + 1) % poly.length];
//           const hit = doLinesIntersect(center, rayEnd, a, b, CONFIG.EPSILON);

//           if (hit && distanceBetPoints(hit, center) > 1) {
//             hits.push({ point: hit, polygon: poly });
//           }
//         }
//       }

//       hits = hits.sort((a, b) => {
//         if (!a.point || !b.point) return 0;
//         const distA = (a.point.x - center.x) ** 2 + (a.point.y - center.y) ** 2;
//         const distB = (b.point.x - center.x) ** 2 + (b.point.y - center.y) ** 2;
//         return distA - distB;
//       });

//       const closestHit = hits.length > 0 ? hits[0].point : null;
//       const hitPolygon = hits.length > 0 ? hits[0].polygon : null;

//       rays.push({
//         start: center,
//         end: rayEnd,
//         hit: closestHit,
//         hitPolygon,
//       });
//     }

//     return rays;
//   };

//   const findIntersectingPolygons = (rays) => {
//     const uniquePolygons = new Set();

//     for (const ray of rays) {
//       if (ray.hitPolygon) {
//         uniquePolygons.add(ray.hitPolygon);
//       }
//     }

//     return Array.from(uniquePolygons).filter(Boolean);
//   };

//   const traceAllPolygonsWithRays = (startPoly, otherPolys) => {
//     const allRays = [];
//     const allIntersectingPolygons = new Set();
//     const processedPolygons = new Set();
//     const queue = [{ poly: startPoly, depth: 0 }];
//     const DIMENSION_TOLERANCE = 40;

//     const getPolygonKey = (poly) =>
//       poly.map((p) => `${p.x.toFixed(4)}:${p.y.toFixed(4)}`).join("-");

//     allIntersectingPolygons.add(startPoly);

//     while (queue.length > 0) {
//       const { poly } = queue.shift();
//       const polyKey = getPolygonKey(poly);

//       if (processedPolygons.has(polyKey)) continue;
//       processedPolygons.add(polyKey);

//       const rays = traceInnerPolygonsWithRays(poly, otherPolys);
//       allRays.push(...rays);

//       const intersectingPolys = findIntersectingPolygons(rays);

//       const filteredIntersectingPolys = filterPolygonsByDimension(
//         intersectingPolys,
//         startPoly,
//         DIMENSION_TOLERANCE
//       );

//       let newPolygonsDiscovered = false;

//       filteredIntersectingPolys.forEach((intersectingPoly) => {
//         const intersectingKey = getPolygonKey(intersectingPoly);
//         if (!processedPolygons.has(intersectingKey)) {
//           queue.push({ poly: intersectingPoly, depth: 0 });
//           newPolygonsDiscovered = true;
//         }
//         allIntersectingPolygons.add(intersectingPoly);
//       });

//       if (!newPolygonsDiscovered && queue.length === 0) {
//         break;
//       }
//     }

//     return {
//       rays: allRays,
//       allIntersectingPolygons: Array.from(allIntersectingPolygons),
//     };
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

//   const getBounds = (polygon) => {
//     if (!polygon || polygon.length < 1)
//       return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
//     let minX = Infinity,
//       minY = Infinity,
//       maxX = -Infinity,
//       maxY = -Infinity;
//     polygon.forEach((point) => {
//       let x, y;
//       if (Array.isArray(point)) {
//         [x, y] = point.slice(0, 2);
//       } else {
//         x = point.x;
//         y = point.y;
//       }
//       minX = Math.min(minX, x);
//       minY = Math.min(minY, y);
//       maxX = Math.max(maxX, x);
//       maxY = Math.max(maxY, y);
//     });
//     return { minX, minY, maxX, maxY };
//   };

//   const findClosestPointOnPolygon = (point, polygon) => {
//     let closestPoint = null;
//     let minDistance = Infinity;

//     for (let i = 0; i < polygon.length; i++) {
//       const v = polygon[i];
//       const w = polygon[(i + 1) % polygon.length];
//       const projection = projectPointToSegment(point, v, w);
//       const distance = distanceBetPoints(point, projection);

//       if (distance < minDistance) {
//         minDistance = distance;
//         closestPoint = projection;
//       }
//     }

//     return { point: closestPoint, distance: minDistance };
//   };

//   const projectPointToSegment = (p, v, w) => {
//     const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
//     if (l2 < CONFIG.EPSILON) return v;

//     let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
//     t = Math.max(0, Math.min(1, t));

//     return {
//       x: v.x + t * (w.x - v.x),
//       y: v.y + t * (w.y - v.y),
//     };
//   };

//   const calculateWallThickness = (externalWall, internalWall) => {
//     if (!externalWall.length || !internalWall.length) return 0;

//     let minDistance = Infinity;

//     for (const extPoint of externalWall) {
//       const closest = findClosestPointOnPolygon(extPoint, internalWall);
//       if (closest.distance < minDistance) {
//         minDistance = closest.distance;
//       }
//     }

//     return minDistance > 0 ? minDistance : 0.75; // Fallback to default if zero
//   };

//   const getWallMidpoint = (externalWall, internalWall, columnEdge) => {
//     const extMid = getEdgeCenter(columnEdge.start, columnEdge.end);
//     const closestInt = findClosestPointOnPolygon(extMid, internalWall);
//     return {
//       x: (extMid.x + closestInt.point.x) / 2,
//       y: (extMid.y + closestInt.point.y) / 2,
//     };
//   };

//   const isNearExternalWall = (columnBounds, externalWall) => {
//     const vertices = [
//       { x: columnBounds.minX, y: columnBounds.minY },
//       { x: columnBounds.maxX, y: columnBounds.minY },
//       { x: columnBounds.maxX, y: columnBounds.maxY },
//       { x: columnBounds.minX, y: columnBounds.maxY },
//     ];

//     return vertices.some((vertex) => {
//       const closest = findClosestPointOnPolygon(vertex, externalWall);
//       return closest.distance <= CONFIG.EDGE_THRESHOLD;
//     });
//   };

//   const structures = useMemo(() => {
//     console.log("Recomputing ... ")
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
//         }, // Bottom
//         {
//           start: { x: maxX, y: minY },
//           end: { x: maxX, y: maxY },
//           dir: { x: 1, y: 0 },
//         }, // Right
//         {
//           start: { x: maxX, y: maxY },
//           end: { x: minX, y: maxY },
//           dir: { x: 0, y: 1 },
//         }, // Top
//         {
//           start: { x: minX, y: maxY },
//           end: { x: minX, y: minY },
//           dir: { x: -1, y: 0 },
//         }, // Left
//       ];

//       const originalBounds = {
//         minX: bounds.minX,
//         maxX: bounds.maxX,
//         minY: bounds.minY,
//         maxY: bounds.maxY,
//       };
//       const newBounds = { minX, maxX, minY, maxY };

//       edges.forEach((edge) => {
//         const midPoint = {
//           x: (edge.start.x + edge.end.x) / 2,
//           y: (edge.start.y + edge.end.y) / 2,
//         };
//         const closestInner = findClosestPointOnPolygon(midPoint, innerWall);

//         if (closestInner.distance < THRESHOLD) {
//           const rayStart = closestInner.point;
//           const rayEnd = {
//             x: rayStart.x + edge.dir.x * 10,
//             y: rayStart.y + edge.dir.y * 10,
//           };

//           let intersection = null;
//           let minDist = Infinity;

//           for (let i = 0; i < outerWall.length; i++) {
//             const v = outerWall[i];
//             const w = outerWall[(i + 1) % outerWall.length];
//             const hit = doLinesIntersect(
//               rayStart,
//               rayEnd,
//               v,
//               w,
//               CONFIG.EPSILON
//             );
//             if (hit) {
//               const dist = distanceBetPoints(rayStart, hit);
//               if (dist < minDist) {
//                 minDist = dist;
//                 intersection = hit;
//               }
//             }
//           }

//           if (intersection) {
//             if (edge.dir.x === 0 && edge.dir.y === -1) {
//               // Bottom
//               newBounds.minY = Math.min(newBounds.minY, intersection.y);
//             } else if (edge.dir.x === 1 && edge.dir.y === 0) {
//               // Right
//               newBounds.maxX = Math.max(newBounds.maxX, intersection.x);
//             } else if (edge.dir.x === 0 && edge.dir.y === 1) {
//               // Top
//               newBounds.maxY = Math.max(newBounds.maxY, intersection.y);
//             } else if (edge.dir.x === -1 && edge.dir.y === 0) {
//               // Left
//               newBounds.minX = Math.min(newBounds.minX, intersection.x);
//             }
//           }
//         }
//       });

//       // Check if column is extended
//       const isExtended =
//         newBounds.minX !== originalBounds.minX ||
//         newBounds.maxX !== originalBounds.maxX ||
//         newBounds.minY !== originalBounds.minY ||
//         newBounds.maxY !== originalBounds.maxY;

//       // console.log("isExtended", newBounds, originalBounds);

//       // Check if column is near the external wall using all vertices
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
//         // Only add mullion if the column is near the edge and extended
//         if (!column.isExtended) return null;

//         const bounds = getBounds(column.points);
//         const columnCenter = {
//           x: (bounds.minX + bounds.maxX) / 2,
//           y: (bounds.minY + bounds.maxY) / 2,
//         };

//         // Find the most extended edge (assume vertical extension for mullions)
//         const verticalEdges = [
//           {
//             start: { x: bounds.minX, y: bounds.minY },
//             end: { x: bounds.minX, y: bounds.maxY },
//           },
//           {
//             start: { x: bounds.maxX, y: bounds.minY },
//             end: { x: bounds.maxX, y: bounds.maxY },
//           },
//         ];
//         const extendedEdge =
//           verticalEdges.find(
//             (edge) =>
//               edge.start.y !== edge.end.y &&
//               (edge.start.y < bounds.minY || edge.end.y > bounds.maxY)
//           ) || verticalEdges[0];

//         const wallMidpoint = getWallMidpoint(
//           outerWall,
//           innerWall,
//           extendedEdge
//         );
//         const mullionCenter = {
//           x: (wallMidpoint.x + columnCenter.x) / 2,
//           y: (wallMidpoint.y + columnCenter.y) / 2,
//         };

//         const halfThickness = wallThickness / 2;
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
//       if (wallStore.externalWallPoints.length > 0) {
//         drawPolygon(ctx, wallStore.externalWallPoints, "orange", 2);
//       }

//       if (wallStore.internalWallPoints.length > 0) {
//         drawPolygon(ctx, wallStore.internalWallPoints, "orange", 2);
//       }

//       baseplateStore.polygons.forEach((polygon, index) => {
//         if (polygon && polygon.length >= 3) {
//           drawPolygon(ctx, polygon, "lightgreen", 3);
//         }
//       });

//       structures.columns.forEach((column) => {
//         drawPolygon(ctx, column, "blue", 2);
//       });
//       columnStore.setPolygons(structures.columns);

//       structures.innerFoundation.forEach((inner) => {
//         drawPolygon(ctx, inner, "magenta", 2);
//       });
//       foundationStore.setInnerPolygons(structures.innerFoundation);

//       structures.outerFoundation.forEach((outer) => {
//         drawPolygon(ctx, outer, "magenta", 2);
//       });
//       foundationStore.setOuterPolygons(structures.outerFoundation);

//       // structures.mullionColumns.forEach((mullion) => {
//       //   drawPolygon(ctx, mullion, "red", 2);
//       // });

//       if (showRays && debugRays.length > 0) {
//         debugRays.forEach((ray) => drawRay(ctx, ray));
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
//         }
//       });

//       structures.columns.forEach((column) => {
//         drawPolygon(ctx, column, "blue", 2);
//       });

//       structures.innerFoundation.forEach((inner) => {
//         drawPolygon(ctx, inner, "magenta", 2);
//       });

//       structures.outerFoundation.forEach((outer) => {
//         drawPolygon(ctx, outer, "magenta", 2);
//       });

//       // structures.mullionColumns.forEach((mullion) => {
//       //   drawPolygon(ctx, mullion, "red", 2);
//       // });

//       if (showRays && debugRays.length > 0) {
//         debugRays.forEach((ray) => drawRay(ctx, ray));
//       }
//     }
//   };

//   function getEdgeCenter(p1, p2) {
//     return {
//       x: (p1.x + p2.x) / 2,
//       y: (p1.y + p2.y) / 2,
//     };
//   }

//   function getEdgeNormal(p1, p2, polygon) {
//     const dx = p2.x - p1.x;
//     const dy = p2.y - p1.y;
//     const length = Math.hypot(dx, dy) || CONFIG.EPSILON;
//     let normal = {
//       x: -dy / length,
//       y: dx / length,
//     };

//     let centroid = { x: 0, y: 0 };
//     polygon.forEach((p) => {
//       centroid.x += p.x;
//       centroid.y += p.y;
//     });
//     centroid.x /= polygon.length;
//     centroid.y /= polygon.length;

//     const center = getEdgeCenter(p1, p2);
//     const toCenter = {
//       x: center.x - centroid.x,
//       y: center.y - centroid.y,
//     };

//     const dot = normal.x * toCenter.x + normal.y * toCenter.y;
//     if (dot < 0) {
//       normal = {
//         x: -normal.x,
//         y: -normal.y,
//       };
//     }

//     return normal;
//   }

//   function getNormalAtPoint(polygon, point) {
//     let closestSegment = null;
//     let minDistance = Infinity;

//     for (let i = 0; i < polygon.length; i++) {
//       const v = polygon[i];
//       const w = polygon[(i + 1) % polygon.length];
//       const projection = projectPointToSegment(point, v, w);
//       const distance = distanceBetPoints(point, projection);

//       if (distance < minDistance) {
//         minDistance = distance;
//         closestSegment = { v, w };
//       }
//     }

//     if (!closestSegment) return { x: 0, y: 0 };

//     return getEdgeNormal(closestSegment.v, closestSegment.w, polygon);
//   }

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

import React, { useMemo, useRef, useState, useEffect } from "react";
import wallStore from "../../../stores/WallStore";
import uiStore from "../../../stores/UIStore";
import { observer } from "mobx-react-lite";
import * as data from "./data.json";
import * as data2 from "./data2.json";
import * as data3 from "./data3.json";
import * as data4 from "./data4.json";
import * as data5 from "./data5.json";
import * as data6 from "./data6.json";
import {
  sortPolygon,
  filterInnerRectangularPolygons,
  isPointInPolygon,
  calculateBoundingBoxArea,
  doLinesIntersect,
} from "../../../utils/PolygonUtils";
import { extractPolygonsFromDXF } from "../../../utils/DXFUtils";
import baseplateStore from "../../../stores/BasePlateStore";
import columnStore from "../../../stores/ColumnStore";
import foundationStore from "../../../stores/FoundationStore";
import mullionColumnStore from "../../../stores/MullianColumnStore";

const CONFIG = {
  EPSILON: 0.01,
  SCALE: 1 / 100,
  RAY_LENGTH: 1000,
  CANVAS_PADDING: 20,
  MAX_SCALE: 5,
  MIN_SCALE: 0.1,
  ZOOM_STEP: 0.1,
  EDGE_THRESHOLD: 0.5, // Reduced threshold for stricter edge detection
};

const dataMap = { data, data2, data3, data4, data5, data6 };

const CanvasTest = observer(() => {
  const canvasRef = useRef(null);
  const count = useRef(0);
  const [internalPolygons, setInternalPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState([]);
  const [secondSelectedPolygon, setSecondSelectedPolygon] = useState(null);
  const [intersectingPolygons, setIntersectingPolygons] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [debugRays, setDebugRays] = useState([]);
  const [showRays, setShowRays] = useState(false);

  const polygons = useMemo(() => {
    try {
      const extracted = uiStore.polygons;
      return extracted.filter((poly) => poly && poly.length >= 3);
    } catch (error) {
      console.error("Failed to extract polygons from DXF:", error);
      return [];
    }
  }, [uiStore.polygons]);

  useEffect(() => {
    count.current = 0;
    setSelectedKey(null);
    setSelectedPolygon([]);
    setSecondSelectedPolygon(null);
    setIntersectingPolygons([]);
    setInternalPolygons([]);
    setDebugRays([]);
    setHoveredKey(null);
    setShowRays(false);
    wallStore.externalWallPoints = [];
    wallStore.internalWallPoints = [];
    baseplateStore.polygons = [];
  }, [uiStore.polygons]);

  const polygonKeys = useMemo(
    () =>
      polygons.map((polygon) =>
        polygon.map((p) => `${p.x.toFixed(4)}:${p.y.toFixed(4)}`).join("-")
      ),
    [polygons]
  );

  const findBounds = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    if (polygons.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    polygons.forEach((polygon) => {
      polygon.forEach((point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    return { minX, minY, maxX, maxY };
  }, [polygons]);

  useMemo(() => {
    count.current = 0;
  }, [uiStore.polygons]);

  useEffect(() => {
    if (polygons.length > 0) {
      const { minX, minY, maxX, maxY } = findBounds;
      const width = maxX - minX || 1;
      const height = maxY - minY || 1;
      const padding = CONFIG.CANVAS_PADDING;

      const scaleX = (canvasSize.width - padding * 2) / width;
      const scaleY = (canvasSize.height - padding * 2) / height;
      const newScale = Math.min(scaleX, scaleY);

      const newOffsetX = canvasSize.width / 2 - (minX + width / 2) * newScale;
      const newOffsetY = canvasSize.height / 2 - (minY + height / 2) * newScale;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    }
  }, [polygons, findBounds, canvasSize]);

  const filterPolygonsByDimension = (polygons, referencePolygon, tolerance) => {
    if (polygons.length === 0 || !referencePolygon) return [];

    const referenceBounds = getBounds(referencePolygon);
    const referenceWidth = referenceBounds.maxX - referenceBounds.minX;
    const referenceHeight = referenceBounds.maxY - referenceBounds.minY;

    return polygons.filter((polygon) => {
      const bounds = getBounds(polygon);
      const width = bounds.maxX - bounds.minX;
      const height = bounds.maxY - bounds.minY;
      const widthDiff = Math.abs(width - referenceWidth);
      const heightDiff = Math.abs(height - referenceHeight);
      return widthDiff <= tolerance && heightDiff <= tolerance;
    });
  };

  const handleSelection = (polygonKey, index) => {
    if (count.current === 0) {
      const selected = polygons[index];
      const temp = selected.map((p) => [p.x, p.y, 0]);
      wallStore.externalWallPoints = temp;
      setSelectedKey(polygonKey);
      setSelectedPolygon(selected.map((p) => [p.x, p.y]));

      const computedInternalPolygons = polygons.filter((poly, i) => {
        if (i === index) return false;
        return poly.every((pt) => isPointInPolygon(pt, selected));
      });

      if (computedInternalPolygons.length > 0) {
        const largest = computedInternalPolygons.reduce((max, poly) => {
          const area = calculateBoundingBoxArea(poly);
          const maxArea = max ? calculateBoundingBoxArea(max) : 0;
          return area > maxArea ? poly : max;
        }, null);

        const temp = largest ? largest.map((p) => [p.x, p.y, 0]) : [];
        wallStore.setWallPoints(wallStore.externalWallPoints, temp);
      } else {
        wallStore.setWallPoints(wallStore.externalWallPoints, []);
      }

      setInternalPolygons(computedInternalPolygons);
      count.current = 1;
    } else if (count.current === 1) {
      const selected = polygons[index];
      setSelectedKey(polygonKey);
      const temp = sortPolygon(selected);
      setSecondSelectedPolygon(temp.map((p) => [p.x, p.y, 0]));

      const internalRectangularPolygons = filterInnerRectangularPolygons(
        internalPolygons
      ).map((polygon) => sortPolygon(polygon));

      const polyForRays = selected.map((p) => ({ x: p.x, y: p.y }));

      const { rays, allIntersectingPolygons } = traceAllPolygonsWithRays(
        polyForRays,
        internalRectangularPolygons
      );

      const filteredPolygons = allIntersectingPolygons.filter((poly, i) => {
        for (let j = 0; j < allIntersectingPolygons.length; j++) {
          if (i === j) continue;
          const otherPoly = allIntersectingPolygons[j];
          const isContained = poly.every((pt) =>
            isPointInPolygon(pt, otherPoly)
          );
          if (isContained) {
            const polyArea = calculateBoundingBoxArea(poly);
            const otherPolyArea = calculateBoundingBoxArea(otherPoly);
            if (polyArea < otherPolyArea) {
              return false;
            }
          }
        }
        return true;
      });

      setDebugRays(rays);
      setIntersectingPolygons(filteredPolygons);
      baseplateStore.polygons = filteredPolygons;

      count.current = 2;
    }
  };

  const worldToScreen = (point) => {
    return {
      x: point.x * scale + offset.x,
      y: point.y * scale + offset.y,
    };
  };

  const screenToWorld = (point) => {
    return {
      x: (point.x - offset.x) / scale,
      y: (point.y - offset.y) / scale,
    };
  };

  const drawPolygon = (ctx, polygon, color, lineWidth = 2) => {
    if (!polygon || polygon.length < 3) return;

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

  const pointToSegmentDistance = (p, v, w) => {
    const l2 = (w.x - v.x) * (w.x - v.x) + (w.y - v.y) * (w.y - v.y);
    if (l2 < CONFIG.EPSILON)
      return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projection = {
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y),
    };

    return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
  };

  const isMouseOverPolygon = (mousePos, polygon) => {
    const THRESHOLD = 5;
    if (!polygon || polygon.length < 3) return false;

    for (let i = 0; i < polygon.length; i++) {
      const p1 = worldToScreen(polygon[i]);
      const p2 = worldToScreen(polygon[(i + 1) % polygon.length]);

      const distance = pointToSegmentDistance(mousePos, p1, p2);

      if (distance < THRESHOLD) {
        return true;
      }
    }

    return false;
  };

  const distanceBetPoints = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const traceInnerPolygonsWithRays = (startPoly, otherPolys) => {
    const rays = [];

    for (let i = 0; i < startPoly.length; i++) {
      const p1 = startPoly[i];
      const p2 = startPoly[(i + 1) % startPoly.length];
      const center = getEdgeCenter(p1, p2);
      const normal = getEdgeNormal(p1, p2, startPoly);

      const rayEnd = {
        x: center.x + normal.x * CONFIG.RAY_LENGTH,
        y: center.y + normal.y * CONFIG.RAY_LENGTH,
      };

      let hits = [];

      for (const poly of otherPolys) {
        if (poly === startPoly) continue;

        for (let j = 0; j < poly.length; j++) {
          const a = poly[j];
          const b = poly[(j + 1) % poly.length];
          const hit = doLinesIntersect(center, rayEnd, a, b, CONFIG.EPSILON);

          if (hit && distanceBetPoints(hit, center) > 1) {
            hits.push({ point: hit, polygon: poly });
          }
        }
      }

      hits = hits.sort((a, b) => {
        if (!a.point || !b.point) return 0;
        const distA = (a.point.x - center.x) ** 2 + (a.point.y - center.y) ** 2;
        const distB = (b.point.x - center.x) ** 2 + (b.point.y - center.y) ** 2;
        return distA - distB;
      });

      const closestHit = hits.length > 0 ? hits[0].point : null;
      const hitPolygon = hits.length > 0 ? hits[0].polygon : null;

      rays.push({
        start: center,
        end: rayEnd,
        hit: closestHit,
        hitPolygon,
      });
    }

    return rays;
  };

  const findIntersectingPolygons = (rays) => {
    const uniquePolygons = new Set();

    for (const ray of rays) {
      if (ray.hitPolygon) {
        uniquePolygons.add(ray.hitPolygon);
      }
    }

    return Array.from(uniquePolygons).filter(Boolean);
  };

  const traceAllPolygonsWithRays = (startPoly, otherPolys) => {
    const allRays = [];
    const allIntersectingPolygons = new Set();
    const processedPolygons = new Set();
    const queue = [{ poly: startPoly, depth: 0 }];
    const DIMENSION_TOLERANCE = 40;

    const getPolygonKey = (poly) =>
      poly.map((p) => `${p.x.toFixed(4)}:${p.y.toFixed(4)}`).join("-");

    allIntersectingPolygons.add(startPoly);

    while (queue.length > 0) {
      const { poly } = queue.shift();
      const polyKey = getPolygonKey(poly);

      if (processedPolygons.has(polyKey)) continue;
      processedPolygons.add(polyKey);

      const rays = traceInnerPolygonsWithRays(poly, otherPolys);
      allRays.push(...rays);

      const intersectingPolys = findIntersectingPolygons(rays);

      const filteredIntersectingPolys = filterPolygonsByDimension(
        intersectingPolys,
        startPoly,
        DIMENSION_TOLERANCE
      );

      let newPolygonsDiscovered = false;

      filteredIntersectingPolys.forEach((intersectingPoly) => {
        const intersectingKey = getPolygonKey(intersectingPoly);
        if (!processedPolygons.has(intersectingKey)) {
          queue.push({ poly: intersectingPoly, depth: 0 });
          newPolygonsDiscovered = true;
        }
        allIntersectingPolygons.add(intersectingPoly);
      });

      if (!newPolygonsDiscovered && queue.length === 0) {
        break;
      }
    }

    return {
      rays: allRays,
      allIntersectingPolygons: Array.from(allIntersectingPolygons),
    };
  };

  const drawRay = (ctx, ray) => {
    const start = worldToScreen(ray.start);
    const end = worldToScreen(ray.end);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = ray.hit
      ? "rgba(255, 0, 0, 0.7)"
      : "rgba(0, 255, 255, 0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(start.x, start.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "cyan";
    ctx.fill();

    if (ray.hit) {
      const hitPoint = worldToScreen(ray.hit);
      ctx.beginPath();
      ctx.arc(hitPoint.x, hitPoint.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  };

  const getBounds = (polygon) => {
    if (!polygon || polygon.length < 1)
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    polygon.forEach((point) => {
      let x, y;
      if (Array.isArray(point)) {
        [x, y] = point.slice(0, 2);
      } else {
        x = point.x;
        y = point.y;
      }
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    return { minX, minY, maxX, maxY };
  };

  const findClosestPointOnPolygon = (point, polygon) => {
    let closestPoint = null;
    let minDistance = Infinity;

    for (let i = 0; i < polygon.length; i++) {
      const v = polygon[i];
      const w = polygon[(i + 1) % polygon.length];
      const projection = projectPointToSegment(point, v, w);
      const distance = distanceBetPoints(point, projection);

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = projection;
      }
    }

    return { point: closestPoint, distance: minDistance };
  };

  const projectPointToSegment = (p, v, w) => {
    const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
    if (l2 < CONFIG.EPSILON) return v;

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    return {
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y),
    };
  };

  const calculateWallThickness = (externalWall, internalWall) => {
    if (!externalWall.length || !internalWall.length) return 0;

    let minDistance = Infinity;

    for (const extPoint of externalWall) {
      const closest = findClosestPointOnPolygon(extPoint, internalWall);
      if (closest.distance < minDistance) {
        minDistance = closest.distance;
      }
    }

    return minDistance > 0 ? minDistance : 0.75; // Fallback to default if zero
  };

  const getWallMidpoint = (externalWall, internalWall, columnEdge) => {
    const extMid = getEdgeCenter(columnEdge.start, columnEdge.end);
    const closestInt = findClosestPointOnPolygon(extMid, internalWall);
    return {
      x: (extMid.x + closestInt.point.x) / 2,
      y: (extMid.y + closestInt.point.y) / 2,
    };
  };

  const isNearExternalWall = (columnBounds, externalWall) => {
    const vertices = [
      { x: columnBounds.minX, y: columnBounds.minY },
      { x: columnBounds.maxX, y: columnBounds.minY },
      { x: columnBounds.maxX, y: columnBounds.maxY },
      { x: columnBounds.minX, y: columnBounds.maxY },
    ];

    return vertices.some((vertex) => {
      const closest = findClosestPointOnPolygon(vertex, externalWall);
      return closest.distance <= CONFIG.EDGE_THRESHOLD;
    });
  };

  const structures = useMemo(() => {
    console.log("Recomputing ... ");
    if (
      !wallStore.externalWallPoints.length ||
      !wallStore.internalWallPoints.length ||
      !baseplateStore.polygons.length
    ) {
      return {
        columns: [],
        innerFoundation: [],
        outerFoundation: [],
        mullionColumns: [],
      };
    }

    const outerWall = wallStore.externalWallPoints.map(([x, y]) => ({ x, y }));
    const innerWall = wallStore.internalWallPoints.map(([x, y]) => ({ x, y }));
    const THRESHOLD = columnStore.internalOffset;
    const INNER_FOUNDATION_OFFSET = 0.75;
    const OUTER_FOUNDATION_WIDTH = foundationStore.values.corner.pccWidth;
    const OUTER_FOUNDATION_HEIGHT = foundationStore.values.corner.pccLength;

    const wallThickness = calculateWallThickness(outerWall, innerWall);

    const columns = baseplateStore.polygons.map((baseplate) => {
      const bPoints = baseplate.map((p) => ({ x: p.x, y: p.y }));
      const bounds = getBounds(bPoints);
      const expansion = THRESHOLD;

      let minX = bounds.minX - expansion;
      let maxX = bounds.maxX + expansion;
      let minY = bounds.minY - expansion;
      let maxY = bounds.maxY + expansion;

      const edges = [
        {
          start: { x: minX, y: minY },
          end: { x: maxX, y: minY },
          dir: { x: 0, y: -1 },
          name: "bottom",
        }, // Bottom
        {
          start: { x: maxX, y: minY },
          end: { x: maxX, y: maxY },
          dir: { x: 1, y: 0 },
          name: "right",
        }, // Right
        {
          start: { x: maxX, y: maxY },
          end: { x: minX, y: maxY },
          dir: { x: 0, y: 1 },
          name: "top",
        }, // Top
        {
          start: { x: minX, y: maxY },
          end: { x: minX, y: minY },
          dir: { x: -1, y: 0 },
          name: "left",
        }, // Left
      ];

      const originalBounds = {
        minX: bounds.minX,
        maxX: bounds.maxX,
        minY: bounds.minY,
        maxY: bounds.maxY,
      };
      const newBounds = { minX, maxX, minY, maxY };
      const intersections = []; // Store all intersections with edge info
      let hasIntersection = false;

      edges.forEach((edge) => {
        const midPoint = {
          x: (edge.start.x + edge.end.x) / 2,
          y: (edge.start.y + edge.end.y) / 2,
        };
        const closestInner = findClosestPointOnPolygon(midPoint, innerWall);

        if (closestInner.distance < THRESHOLD) {
          const rayStart = closestInner.point;
          const rayEnd = {
            x: rayStart.x + edge.dir.x * 1000,
            y: rayStart.y + edge.dir.y * 1000,
          };

          let minDist = Infinity;
          let intersectionPoint = null;

          for (let i = 0; i < outerWall.length; i++) {
            const v = outerWall[i];
            const w = outerWall[(i + 1) % outerWall.length];
            const hit = doLinesIntersect(rayStart, rayEnd, v, w, 0.0001);
            if (hit) {
              const dist = distanceBetPoints(rayStart, hit);
              if (dist < minDist) {
                minDist = dist;
                intersectionPoint = hit;
              }
            }
          }

          if (intersectionPoint) {
            hasIntersection = true;
            intersections.push({ edge: edge.name, point: intersectionPoint });
            console.log(
              `Intersection found on ${edge.name}:`,
              intersectionPoint
            );
            if (edge.name === "bottom") {
              newBounds.minY = Math.min(newBounds.minY, intersectionPoint.y);
            } else if (edge.name === "right") {
              newBounds.maxX = Math.max(newBounds.maxX, intersectionPoint.x);
            } else if (edge.name === "top") {
              newBounds.maxY = Math.max(newBounds.maxY, intersectionPoint.y);
            } else if (edge.name === "left") {
              newBounds.minX = Math.min(newBounds.minX, intersectionPoint.x);
            }
          }
        }
      });

      // Check if column is extended
      const isExtended =
        hasIntersection &&
        (newBounds.minX !== minX ||
          newBounds.maxX !== maxX ||
          newBounds.minY !== minY ||
          newBounds.maxY !== maxY);

      console.log(
        "isExtended:",
        isExtended,
        "newBounds:",
        newBounds,
        "originalBounds:",
        originalBounds
      );

      // Check if column is near the external wall
      const isNearEdge = isNearExternalWall(originalBounds, outerWall);

      return {
        points: [
          { x: newBounds.minX, y: newBounds.minY },
          { x: newBounds.maxX, y: newBounds.minY },
          { x: newBounds.maxX, y: newBounds.maxY },
          { x: newBounds.minX, y: newBounds.maxY },
        ],
        isExtended,
        isNearEdge,
        intersections, // Store all intersections
      };
    });

    const innerFoundation = columns.map((column) => {
      const bounds = getBounds(column.points);
      return [
        {
          x: bounds.minX - INNER_FOUNDATION_OFFSET,
          y: bounds.minY - INNER_FOUNDATION_OFFSET,
        },
        {
          x: bounds.maxX + INNER_FOUNDATION_OFFSET,
          y: bounds.minY - INNER_FOUNDATION_OFFSET,
        },
        {
          x: bounds.maxX + INNER_FOUNDATION_OFFSET,
          y: bounds.maxY + INNER_FOUNDATION_OFFSET,
        },
        {
          x: bounds.minX - INNER_FOUNDATION_OFFSET,
          y: bounds.maxY + INNER_FOUNDATION_OFFSET,
        },
      ];
    });

    const outerFoundation = innerFoundation.map((inner) => {
      const bounds = getBounds(inner);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      const halfWidth = OUTER_FOUNDATION_WIDTH / 2;
      const halfHeight = OUTER_FOUNDATION_HEIGHT / 2;
      return [
        { x: centerX - halfWidth, y: centerY - halfHeight },
        { x: centerX + halfWidth, y: centerY - halfHeight },
        { x: centerX + halfWidth, y: centerY + halfHeight },
        { x: centerX - halfWidth, y: centerY + halfHeight },
      ];
    });

    const mullionColumns = columns
      .map((column) => {
        // Only add mullion if the column is extended and has intersections
        if (!column.isExtended || !column.intersections.length) return null;

        const bounds = getBounds(column.points);
        const columnCenter = {
          x: (bounds.minX + bounds.maxX) / 2,
          y: (bounds.minY + bounds.maxY) / 2,
        };

        // Check if the column is near a corner (two perpendicular edges extended)
        const extendedEdges = column.intersections.map((i) => i.edge);
        const isCornerCase =
          extendedEdges.length >= 2 &&
          ((extendedEdges.includes("bottom") &&
            extendedEdges.includes("right")) ||
            (extendedEdges.includes("top") &&
              extendedEdges.includes("right")) ||
            (extendedEdges.includes("top") && extendedEdges.includes("left")) ||
            (extendedEdges.includes("bottom") &&
              extendedEdges.includes("left")));

        let mullionCenter;

        if (isCornerCase) {
          // Find the closest corner vertex on the outer wall
          let closestCorner = null;
          let minDist = Infinity;
          for (let i = 0; i < outerWall.length; i++) {
            const vertex = outerWall[i];
            const dist = distanceBetPoints(columnCenter, vertex);
            if (dist < minDist) {
              minDist = dist;
              closestCorner = vertex;
            }
          }

          // Find the corresponding point on the inner wall
          const closestInner = findClosestPointOnPolygon(
            closestCorner,
            innerWall
          );

          // Calculate the corner center (midpoint between outer and inner wall corner)
          mullionCenter = {
            x: (closestCorner.x + closestInner.point.x) / 2,
            y: (closestCorner.y + closestInner.point.y) / 2,
          };
        } else {
          // Non-corner case: use the first intersection point
          const intersectionPoint = column.intersections[0].point;
          const closestInner = findClosestPointOnPolygon(
            intersectionPoint,
            innerWall
          );
          mullionCenter = {
            x:
              intersectionPoint.x +
              (closestInner.point.x - intersectionPoint.x) * 0.5,
            y:
              intersectionPoint.y +
              (closestInner.point.y - intersectionPoint.y) * 0.5,
          };
        }

        const halfThickness = wallStore.wallThickness / 2;
        return [
          {
            x: mullionCenter.x - halfThickness,
            y: mullionCenter.y - halfThickness,
          },
          {
            x: mullionCenter.x + halfThickness,
            y: mullionCenter.y - halfThickness,
          },
          {
            x: mullionCenter.x + halfThickness,
            y: mullionCenter.y + halfThickness,
          },
          {
            x: mullionCenter.x - halfThickness,
            y: mullionCenter.y + halfThickness,
          },
        ];
      })
      .filter(Boolean);
    mullionColumnStore.setPolygons(mullionColumns);

    return {
      columns: columns.map((c) => c.points),
      innerFoundation,
      outerFoundation,
      mullionColumns,
    };
  }, [
    wallStore.externalWallPoints,
    wallStore.internalWallPoints,
    baseplateStore.polygons,
    columnStore.internalOffset,
    foundationStore.values.corner.pccWidth,
    foundationStore.values.corner.pccLength,
  ]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseplateStore.polygons.length > 0) {
      if (
        uiStore.visibility.groundBeam &&
        wallStore.internalWallPoints.length > 0
      ) {
        drawPolygon(ctx, wallStore.internalWallPoints, "cyan", 2);
      }
      if (
        uiStore.visibility.groundBeam &&
        wallStore.externalWallPoints.length > 0
      ) {
        drawPolygon(ctx, wallStore.externalWallPoints, "cyan", 2);
      }
      if (uiStore.visibility.shade && wallStore.externalWallPoints.length > 0) {
        drawPolygon(ctx, wallStore.externalWallPoints, "orange", 2);
      }

      if (uiStore.visibility.shade && wallStore.internalWallPoints.length > 0) {
        drawPolygon(ctx, wallStore.internalWallPoints, "orange", 2);
      }

      uiStore.visibility.baseplate &&
        baseplateStore.polygons.forEach((polygon, index) => {
          if (polygon && polygon.length >= 3) {
            drawPolygon(ctx, polygon, "lightgreen", 3);
          }
        });

      uiStore.visibility.column &&
        structures.columns.forEach((column) => {
          drawPolygon(ctx, column, "blue", 2);
        });
      columnStore.setPolygons(structures.columns);

      uiStore.visibility.foundation &&
        structures.innerFoundation.forEach((inner) => {
          drawPolygon(ctx, inner, "magenta", 2);
        });
      foundationStore.setInnerPolygons(structures.innerFoundation);

      uiStore.visibility.foundation &&
        structures.outerFoundation.forEach((outer) => {
          drawPolygon(ctx, outer, "magenta", 2);
        });
      foundationStore.setOuterPolygons(structures.outerFoundation);

      uiStore.visibility.mullionColumn &&
        structures.mullionColumns.forEach((mullion) => {
          drawPolygon(ctx, mullion, "red", 2);
        });

      if (showRays && debugRays.length > 0) {
        debugRays.forEach((ray) => drawRay(ctx, ray));
      }
    } else {
      polygons.forEach((polygon, index) => {
        if (!polygon || polygon.length < 3) return;
        const k = polygonKeys[index];
        const isSelected = k === selectedKey;
        const color = isSelected ? "blue" : k === hoveredKey ? "orange" : "red";
        drawPolygon(ctx, polygon, color);
      });

      if (wallStore.externalWallPoints.length > 0) {
        drawPolygon(ctx, wallStore.externalWallPoints, "orange", 2);
      }
      if (wallStore.internalWallPoints.length > 0) {
        drawPolygon(ctx, wallStore.internalWallPoints, "orange", 2);
      }
      if (secondSelectedPolygon) {
        drawPolygon(ctx, secondSelectedPolygon, "lightgreen", 2);
      }
      intersectingPolygons.forEach((polygon, index) => {
        if (polygon && polygon.length >= 3) {
          drawPolygon(ctx, polygon, "lightgreen", 3);
        }
      });

      structures.columns.forEach((column) => {
        drawPolygon(ctx, column, "blue", 2);
      });

      structures.innerFoundation.forEach((inner) => {
        drawPolygon(ctx, inner, "magenta", 2);
      });

      structures.outerFoundation.forEach((outer) => {
        drawPolygon(ctx, outer, "magenta", 2);
      });

      // structures.mullionColumns.forEach((mullion) => {
      //   drawPolygon(ctx, mullion, "red", 2);
      // });

      if (showRays && debugRays.length > 0) {
        debugRays.forEach((ray) => drawRay(ctx, ray));
      }
    }
  };

  function getEdgeCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  function getEdgeNormal(p1, p2, polygon) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy) || CONFIG.EPSILON;
    let normal = {
      x: -dy / length,
      y: dx / length,
    };

    let centroid = { x: 0, y: 0 };
    polygon.forEach((p) => {
      centroid.x += p.x;
      centroid.y += p.y;
    });
    centroid.x /= polygon.length;
    centroid.y /= polygon.length;

    const center = getEdgeCenter(p1, p2);
    const toCenter = {
      x: center.x - centroid.x,
      y: center.y - centroid.y,
    };

    const dot = normal.x * toCenter.x + normal.y * toCenter.y;
    if (dot < 0) {
      normal = {
        x: -normal.x,
        y: -normal.y,
      };
    }

    return normal;
  }

  function getNormalAtPoint(polygon, point) {
    let closestSegment = null;
    let minDistance = Infinity;

    for (let i = 0; i < polygon.length; i++) {
      const v = polygon[i];
      const w = polygon[(i + 1) % polygon.length];
      const projection = projectPointToSegment(point, v, w);
      const distance = distanceBetPoints(point, projection);

      if (distance < minDistance) {
        minDistance = distance;
        closestSegment = { v, w };
      }
    }

    if (!closestSegment) return { x: 0, y: 0 };

    return getEdgeNormal(closestSegment.v, closestSegment.w, polygon);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      if (isDragging.current) {
        const dx = mousePos.x - lastMousePos.current.x;
        const dy = mousePos.y - lastMousePos.current.y;

        setOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));

        lastMousePos.current = mousePos;
      } else {
        let foundHover = false;

        for (let i = 0; i < polygons.length; i++) {
          if (isMouseOverPolygon(mousePos, polygons[i])) {
            setHoveredKey(polygonKeys[i]);
            foundHover = true;
            canvas.style.cursor = "pointer";
            break;
          }
        }

        if (!foundHover) {
          setHoveredKey(null);
          canvas.style.cursor = "default";
        }
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 1 || e.button === 2) {
        isDragging.current = true;
        canvas.style.cursor = "grabbing";

        const rect = canvas.getBoundingClientRect();
        lastMousePos.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      } else {
        const rect = canvas.getBoundingClientRect();
        const mousePos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };

        for (let i = 0; i < polygons.length; i++) {
          if (isMouseOverPolygon(mousePos, polygons[i])) {
            handleSelection(polygonKeys[i], i);
            break;
          }
        }
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvas.style.cursor = "default";
    };

    const handleWheel = (e) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const worldPoint = screenToWorld(mousePos);
      const delta = e.deltaY > 0 ? -CONFIG.ZOOM_STEP : CONFIG.ZOOM_STEP;
      const newScale = scale * (1 + delta);

      const newScreenPoint = {
        x: worldPoint.x * newScale + offset.x,
        y: worldPoint.y * newScale + offset.y,
      };

      const offsetX = mousePos.x - newScreenPoint.x;
      const offsetY = mousePos.y - newScreenPoint.y;

      setScale(newScale);
      setOffset((prev) => ({
        x: prev.x + offsetX,
        y: prev.y + offsetY,
      }));
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [polygons, polygonKeys, scale, offset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);

      setCanvasSize({ width, height });
    };

    const container = canvas.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    handleResize();

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    draw();
  }, [
    polygons,
    selectedKey,
    hoveredKey,
    selectedPolygon,
    secondSelectedPolygon,
    intersectingPolygons,
    scale,
    offset,
    debugRays,
    showRays,
    structures,
    uiStore.visibility.shade,
    uiStore.visibility.baseplate,
    uiStore.visibility.column,
    uiStore.visibility.foundation,
    uiStore.visibility.mullionColumn,
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        count.current = 0;
        setSelectedKey(null);
        setSelectedPolygon([]);
        setSecondSelectedPolygon(null);
        setIntersectingPolygons([]);
        setDebugRays([]);
        wallStore.externalWallPoints = [];
        wallStore.internalWallPoints = [];
      } else if (e.key === "+" || e.key === "=") {
        const newScale = scale * 1.1;
        setScale(newScale);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const worldCenter = screenToWorld({ x: centerX, y: centerY });
        const newScreenCenter = {
          x: worldCenter.x * newScale + offset.x,
          y: worldCenter.y * newScale + offset.y,
        };

        setOffset({
          x: offset.x + (centerX - newScreenCenter.x),
          y: offset.y + (centerY - newScreenCenter.y),
        });
      } else if (e.key === "-") {
        const newScale = scale * 0.9;
        setScale(newScale);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const worldCenter = screenToWorld({ x: centerX, y: centerY });
        const newScreenCenter = {
          x: worldCenter.x * newScale + offset.x,
          y: worldCenter.y * newScale + offset.y,
        };

        setOffset({
          x: offset.x + (centerX - newScreenCenter.x),
          y: offset.y + (centerY - newScreenCenter.y),
        });
      } else if (e.key === "r") {
        if (polygons.length > 0) {
          const { minX, minY, maxX, maxY } = findBounds;
          const width = maxX - minX || 1;
          const height = maxY - minY || 1;
          const padding = CONFIG.CANVAS_PADDING;

          const scaleX = (canvasSize.width - padding * 2) / width;
          const scaleY = (canvasSize.height - padding * 2) / height;
          const newScale = Math.min(scaleX, scaleY);

          const newOffsetX =
            canvasSize.width / 2 - (minX + width / 2) * newScale;
          const newOffsetY =
            canvasSize.height / 2 - (minY + height / 2) * newScale;

          setScale(newScale);
          setOffset({ x: newOffsetX, y: newOffsetY });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scale, offset, canvasSize, findBounds, polygons]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.5)",
          color: "white",
          padding: "5px",
          borderRadius: "3px",
          fontSize: "12px",
        }}
      >
        Zoom: {Math.round(scale * 100)}% | Pan: Middle/Right-click drag | Zoom:
        Mouse wheel or +/- keys | Reset: R key | Clear: Escape key
      </div>
      <button
        onClick={() => setShowRays(!showRays)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          padding: "5px 10px",
          background: showRays ? "#4CAF50" : "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {showRays ? "Hide Rays" : "Show Rays"}
      </button>
    </div>
  );
});

export default CanvasTest;
