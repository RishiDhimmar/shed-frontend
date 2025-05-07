const EPSILON = 0.0001;
const SCALE = 0.01;
const FLIP_Y = true;

const equal = (a, b) =>
  Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;

const scalePoint = (pt) => ({
  x: pt.x * SCALE,
  y: FLIP_Y ? -pt.y * SCALE : pt.y * SCALE,
});

const pointKey = (p) =>
  `${Math.round(p.x / EPSILON) * EPSILON}:${
    Math.round(p.y / EPSILON) * EPSILON
  }`;

export const extractPolygonsFromDXF = (dxfData) => {
  if (!dxfData || !Array.isArray(dxfData.entities)) {
    console.error("Invalid or missing DXF entities");
    return [];
  }

  const segments = [];

  const applyTransform = (point, insert, basePoint = { x: 0, y: 0 }) => {
    let x = point.x - basePoint.x;
    let y = point.y - basePoint.y;
    const angle = ((insert.rotation || 0) * Math.PI) / 180;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const scaleX = insert.xScale ?? 1;
    const scaleY = insert.yScale ?? 1;
    const tx = insert.position?.x ?? 0;
    const ty = insert.position?.y ?? 0;

    const rotatedX = x * cosA - y * sinA;
    const rotatedY = x * sinA + y * cosA;
    const scaledX = rotatedX * scaleX;
    const scaledY = rotatedY * scaleY;

    return {
      x: scaledX + tx,
      y: scaledY + ty,
    };
  };

  const extractSegmentsFromVertices = (vertices, insert = null) => {
    if (!Array.isArray(vertices) || vertices.length < 2) {
      console.warn("Invalid or insufficient vertices:", vertices);
      return [];
    }
    const segs = [];
    for (let i = 0; i < vertices.length; i++) {
      let p1 = vertices[i];
      let p2 = vertices[(i + 1) % vertices.length];
      if (insert) {
        p1 = applyTransform(p1, insert, insert.basePoint);
        p2 = applyTransform(p2, insert, insert.basePoint);
      }
      const scaledP1 = scalePoint(p1);
      const scaledP2 = scalePoint(p2);
      segs.push({ start: scaledP1, end: scaledP2 });
    }
    return segs;
  };

  const extractEntities = (entities, insert = null) => {
    for (const entity of entities) {
      if (entity.type === "LWPOLYLINE" || entity.type === "POLYLINE") {
        segments.push(...extractSegmentsFromVertices(entity.vertices, insert));
      }
      if (entity.type === "INSERT" && dxfData.blocks?.[entity.name]) {
        const block = dxfData.blocks[entity.name];
        extractEntities(block.entities, {
          position: entity.position || { x: 0, y: 0 },
          rotation: entity.rotation || 0,
          xScale: entity.xScale || 1,
          yScale: entity.yScale || 1,
          basePoint: block.position || { x: 0, y: 0 },
        });
      }
    }
  };

  extractEntities(dxfData.entities);

  const edgeMap = new Map();
  for (const { start, end } of segments) {
    const k1 = pointKey(start);
    const k2 = pointKey(end);
    edgeMap.set(k1, [...(edgeMap.get(k1) || []), end]);
    edgeMap.set(k2, [...(edgeMap.get(k2) || []), start]);
  }

  const visited = new Set();
  const polygons = [];

  const tracePolygon = (start) => {
    const polygon = [start];
    let current = start;
    const maxIterations = edgeMap.size;
    let iteration = 0;

    while (iteration < maxIterations) {
      const currentKey = pointKey(current);
      const neighbors = edgeMap.get(currentKey) || [];
      const next = neighbors.find((p) => {
        const edgeId = `${currentKey}->${pointKey(p)}`;
        return !visited.has(edgeId);
      });

      if (!next) break;

      const edgeId = `${currentKey}->${pointKey(next)}`;
      const reverseEdgeId = `${pointKey(next)}->${currentKey}`;
      visited.add(edgeId);
      visited.add(reverseEdgeId);

      if (equal(next, start)) {
        polygon.push(start);
        return polygon;
      }

      polygon.push(next);
      current = next;
      iteration++;
    }

    return null;
  };

  for (const [keyStr] of edgeMap.entries()) {
    const [x, y] = keyStr.split(":").map(Number);
    const start = { x, y };
    const poly = tracePolygon(start);
    if (poly && poly.length > 3) {
      polygons.push(poly);
    }
  }

  const sortClockwise = (points) => {
    if (points.length < 3) return points;
    const center = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    center.x /= points.length;
    center.y /= points.length;

    return [...points].sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });
  };

  return polygons.map(sortClockwise);
};

// export const extractAllFromDXF = (dxfData) => {
//   if (!dxfData || typeof dxfData !== "object") {
//     console.error("Invalid or missing DXF data");
//     return {
//       polygons: [],
//       texts: [],
//       curves: [],
//       lines: [],
//       unknownEntities: [],
//       metadata: {},
//     };
//   }

//   // Initialize result containers
//   const segments = [];
//   const texts = [];
//   const curves = [];
//   const lines = [];
//   const unknownEntities = [];
//   const metadata = {
//     layers: dxfData.tables?.layer?.layers || {},
//     header: dxfData.header || {},
//     blocks: Object.keys(dxfData.blocks || {}),
//     styles: dxfData.tables?.style?.styles || {},
//     lineTypes: dxfData.tables?.ltype?.lineTypes || {},
//     appIds: dxfData.tables?.appid?.appIds || {},
//     units: dxfData.header?.$INSUNITS || 0,
//     version: dxfData.header?.$ACADVER || "Unknown",
//   };

//   // Matrix helper functions (unchanged)
//   function createTranslationMatrix(tx, ty, tz) {
//     return [
//       [1, 0, 0, tx],
//       [0, 1, 0, ty],
//       [0, 0, 1, tz],
//       [0, 0, 0, 1],
//     ];
//   }

//   function createScalingMatrix(sx, sy, sz) {
//     return [
//       [sx || 1, 0, 0, 0],
//       [0, sy || 1, 0, 0],
//       [0, 0, sz || 1, 0],
//       [0, 0, 0, 1],
//     ];
//   }

//   function createRotationMatrix(axis, angle) {
//     const c = Math.cos(angle);
//     const s = Math.sin(angle);
//     const t = 1 - c;
//     const ux = axis.x || 0;
//     const uy = axis.y || 0;
//     const uz = axis.z || 1;
//     return [
//       [c + ux * ux * t, ux * uy * t - uz * s, ux * uz * t + uy * s, 0],
//       [uy * ux * t + uz * s, c + uy * uy * t, uy * uz * t - ux * s, 0],
//       [uz * ux * t - uy * s, uz * uy * t + ux * s, c + uz * uz * t, 0],
//       [0, 0, 0, 1],
//     ];
//   }

//   function multiplyMatrices(A, B) {
//     const result = Array.from({ length: 4 }, () => Array(4).fill(0));
//     for (let i = 0; i < 4; i++) {
//       for (let j = 0; j < 4; j++) {
//         for (let k = 0; k < 4; k++) {
//           result[i][j] += A[i][k] * B[k][j];
//         }
//       }
//     }
//     return result;
//   }

//   function transformPoint(M, point) {
//     const x = point.x || 0;
//     const y = point.y || 0;
//     const z = point.z || 0;
//     const w = 1;
//     const newX = M[0][0] * x + M[0][1] * y + M[0][2] * z + M[0][3] * w;
//     const newY = M[1][0] * x + M[1][1] * y + M[1][2] * z + M[1][3] * w;
//     const newZ = M[2][0] * x + M[2][1] * y + M[2][2] * z + M[2][3] * w;
//     return { x: newX, y: -newY, z: newZ };
//   }

//   function getTransformMatrix(transform) {
//     const {
//       position = { x: 0, y: 0, z: 0 },
//       xScale = 1,
//       yScale = 1,
//       zScale = 1,
//       rotation = 0,
//       extrusion = { x: 0, y: 0, z: 1 },
//       basePoint = { x: 0, y: 0, z: 0 },
//     } = transform;

//     if (xScale === 0 || yScale === 0 || zScale === 0) {
//       console.warn(
//         "Zero scale detected in transformation, using default scale"
//       );
//       transform.xScale = 1;
//       transform.yScale = 1;
//       transform.zScale = 1;
//     }

//     const T_b = createTranslationMatrix(
//       -basePoint.x,
//       -basePoint.y,
//       -basePoint.z
//     );
//     const S = createScalingMatrix(xScale, yScale, zScale);
//     const R = createRotationMatrix(extrusion, (rotation * Math.PI) / 180);
//     const T_p = createTranslationMatrix(position.x, position.y, position.z);

//     let M1 = multiplyMatrices(S, T_b);
//     let M2 = multiplyMatrices(R, M1);
//     let M_local = multiplyMatrices(T_p, M2);
//     return M_local;
//   }

//   // Extract segments from vertices
//   const extractSegmentsFromVertices = (vertices, isClosed = false) => {
//     if (!Array.isArray(vertices) || vertices.length < 2) {
//       console.warn("Invalid or insufficient vertices:", vertices);
//       return [];
//     }
//     const segs = [];
//     const len = isClosed ? vertices.length : vertices.length - 1;
//     for (let i = 0; i < len; i++) {
//       const p1 = vertices[i];
//       const p2 = vertices[(i + 1) % vertices.length];
//       segs.push({ start: p1, end: p2 });
//     }
//     return segs;
//   };

//   // Extract all entities with accumulated transformation
//   const extractEntities = (entities, accumulatedMatrix, space = "model") => {
//     if (!Array.isArray(entities)) {
//       console.warn("Entities is not an array:", entities);
//       return;
//     }

//     for (const entity of entities) {
//       if (!entity || !entity.type) {
//         console.warn("Invalid entity:", entity);
//         unknownEntities.push({ raw: entity, space });
//         continue;
//       }

//       try {
//         switch (entity.type.toUpperCase()) {
//           case "LWPOLYLINE":
//           case "POLYLINE":
//             const isClosed = entity.closed || entity.shape || false;
//             const vertices =
//               entity.vertices || (entity.points ? entity.points : []);
//             if (!vertices.length) {
//               console.warn(`Empty vertices in ${entity.type}:`, entity);
//               unknownEntities.push({ type: entity.type, raw: entity, space });
//               break;
//             }
//             const transformedVertices = vertices.map((v) =>
//               transformPoint(accumulatedMatrix, {
//                 x: v.x || 0,
//                 y: v.y || 0,
//                 z: v.z || 0,
//               })
//             );
//             segments.push(
//               ...extractSegmentsFromVertices(transformedVertices, isClosed)
//             );
//             break;

//           case "LINE":
//             if (
//               !Array.isArray(entity.vertices) ||
//               entity.vertices.length !== 2
//             ) {
//               console.warn("Invalid LINE vertices:", entity);
//               unknownEntities.push({ type: "LINE", raw: entity, space });
//               break;
//             }
//             const start = transformPoint(accumulatedMatrix, {
//               x: entity.vertices[0].x || 0,
//               y: entity.vertices[0].y || 0,
//               z: entity.vertices[0].z || 0,
//             });
//             const end = transformPoint(accumulatedMatrix, {
//               x: entity.vertices[1].x || 0,
//               y: entity.vertices[1].y || 0,
//               z: entity.vertices[1].z || 0,
//             });
//             lines.push({
//               start,
//               end,
//               layer: entity.layer,
//               color: entity.colorIndex,
//               handle: entity.handle,
//               ownerHandle: entity.ownerHandle,
//               lineType: entity.lineType,
//               lineTypeScale: entity.lineTypeScale,
//               lineWeight: entity.lineweight,
//               xdata: entity.xdata,
//             });
//             break;

//           case "TEXT":
//           case "MTEXT":
//             const position = transformPoint(accumulatedMatrix, {
//               x: entity.position?.x || entity.x || 0,
//               y: entity.position?.y || entity.y || 0,
//               z: entity.position?.z || entity.z || 0,
//             });
//             console.log(entity);
//             texts.push({
//               type: entity.type,
//               text: entity.text || entity.value || "",
//               position,
//               height: entity.height || 1,
//               rotation: entity.rotation || 0,
//               style: entity.style || "STANDARD",
//               layer: entity.layer,
//               color: entity.color,
//               alignment: entity.alignment,
//               widthFactor: entity.widthFactor,
//               xdata: entity.xdata,
//             });
//             break;

//           case "ARC":
//             const arcCenter = transformPoint(accumulatedMatrix, {
//               x: entity.center?.x || 0,
//               y: entity.center?.y || 0,
//               z: entity.center?.z || 0,
//             });
//             curves.push({
//               type: "ARC",
//               center: arcCenter,
//               radius: entity.radius || 1,
//               startAngle: (entity.startAngle || 0) * (Math.PI / 180),
//               endAngle: (entity.endAngle || 360) * (Math.PI / 180),
//               layer: entity.layer,
//               color: entity.color,
//               lineType: entity.lineType,
//               xdata: entity.xdata,
//             });
//             break;

//           case "CIRCLE":
//             const circleCenter = transformPoint(accumulatedMatrix, {
//               x: entity.center?.x || 0,
//               y: entity.center?.y || 0,
//               z: entity.center?.z || 0,
//             });
//             curves.push({
//               type: "CIRCLE",
//               center: circleCenter,
//               radius: entity.radius || 1,
//               layer: entity.layer,
//               color: entity.colorIndex,
//               lineType: entity.lineType,
//               xdata: entity.xdata,
//             });
//             break;

//           case "ELLIPSE":
//             const ellipseCenter = transformPoint(accumulatedMatrix, {
//               x: entity.center?.x || 0,
//               y: entity.center?.y || 0,
//               z: entity.center?.z || 0,
//             });
//             curves.push({
//               type: "ELLIPSE",
//               center: ellipseCenter,
//               majorAxis: entity.majorAxis || 1,
//               minorAxisRatio: entity.minorAxisRatio || 1,
//               startAngle: entity.startAngle || 0,
//               endAngle: entity.endAngle || 2 * Math.PI,
//               layer: entity.layer,
//               color: entity.color,
//               xdata: entity.xdata,
//             });
//             break;

//           case "SPLINE":
//             const controlPoints = (entity.controlPoints || []).map((p) =>
//               transformPoint(accumulatedMatrix, {
//                 x: p.x || 0,
//                 y: p.y || 0,
//                 z: p.z || 0,
//               })
//             );
//             curves.push({
//               type: "SPLINE",
//               controlPoints,
//               knots: entity.knots || [],
//               degree: entity.degree || 3,
//               layer: entity.layer,
//               color: entity.color,
//               xdata: entity.xdata,
//             });
//             break;

//           case "HATCH":
//             curves.push({
//               type: "HATCH",
//               boundaryPaths: (entity.boundaryPaths || []).map((path) => ({
//                 edges: (path.edges || []).map((edge) => ({
//                   type: edge.type,
//                   vertices: (edge.vertices || []).map((v) =>
//                     transformPoint(accumulatedMatrix, {
//                       x: v.x || 0,
//                       y: v.y || 0,
//                       z: v.z || 0,
//                     })
//                   ),
//                   center: edge.center
//                     ? transformPoint(accumulatedMatrix, {
//                         x: edge.center.x || 0,
//                         y: edge.center.y || 0,
//                         z: edge.center.z || 0,
//                       })
//                     : undefined,
//                   radius: edge.radius,
//                   startAngle: edge.startAngle,
//                   endAngle: edge.endAngle,
//                 })),
//               })),
//               pattern: entity.pattern,
//               layer: entity.layer,
//               color: entity.color,
//               xdata: entity.xdata,
//             });
//             break;

//           case "DIMENSION":
//             texts.push({
//               type: "DIMENSION",
//               text: entity.text || "",
//               position: transformPoint(accumulatedMatrix, {
//                 x: entity.textMidPoint?.x || entity.x || 0,
//                 y: entity.textMidPoint?.y || entity.y || 0,
//                 z: entity.textMidPoint?.z || entity.z || 0,
//               }),
//               definitionPoint: transformPoint(accumulatedMatrix, {
//                 x: entity.definitionPoint?.x || 0,
//                 y: entity.definitionPoint?.y || 0,
//                 z: entity.definitionPoint?.z || 0,
//               }),
//               dimensionType: entity.dimensionType,
//               style: entity.style || "STANDARD",
//               layer: entity.layer,
//               color: entity.color,
//               xdata: entity.xdata,
//             });
//             break;

//           case "LEADER":
//             lines.push({
//               type: "LEADER",
//               vertices: (entity.vertices || []).map((v) =>
//                 transformPoint(accumulatedMatrix, {
//                   x: v.x || 0,
//                   y: v.y || 0,
//                   z: v.z || 0,
//                 })
//               ),
//               layer: entity.layer,
//               color: entity.color,
//               arrowHead: entity.arrowHead,
//               xdata: entity.xdata,
//             });
//             break;

//           case "SOLID":
//           case "TRACE":
//             const solidVertices = (entity.vertices || []).map((v) =>
//               transformPoint(accumulatedMatrix, {
//                 x: v.x || 0,
//                 y: v.y || 0,
//                 z: v.z || 0,
//               })
//             );
//             segments.push(...extractSegmentsFromVertices(solidVertices, true));
//             break;

//           case "3DFACE":
//             const faceVertices = (entity.vertices || []).map((v) =>
//               transformPoint(accumulatedMatrix, {
//                 x: v.x || 0,
//                 y: v.y || 0,
//                 z: v.z || 0,
//               })
//             );
//             segments.push(...extractSegmentsFromVertices(faceVertices, true));
//             break;

//           case "POINT":
//             lines.push({
//               type: "POINT",
//               position: transformPoint(accumulatedMatrix, {
//                 x: entity.position?.x || 0,
//                 y: entity.position?.y || 0,
//                 z: entity.position?.z || 0,
//               }),
//               layer: entity.layer,
//               color: entity.color,
//               xdata: entity.xdata,
//             });
//             break;

//           case "ATTDEF":
//           case "ATTRIB":
//             const attribPosition = transformPoint(accumulatedMatrix, {
//               x: entity.position?.x || entity.x || 0,
//               y: entity.position?.y || entity.y || 0,
//               z: entity.position?.z || entity.z || 0,
//             });
//             texts.push({
//               type: entity.type,
//               tag: entity.tag || "",
//               text: entity.text || entity.value || "",
//               position: attribPosition,
//               height: entity.height || 1,
//               rotation: entity.rotation || 0,
//               style: entity.style || "STANDARD",
//               layer: entity.layer,
//               color: entity.color,
//               xdata: entity.xdata,
//             });
//             break;

//           case "VIEWPORT":
//             curves.push({
//               type: "VIEWPORT",
//               center: transformPoint(accumulatedMatrix, {
//                 x: entity.center?.x || 0,
//                 y: entity.center?.y || 0,
//                 z: entity.center?.z || 0,
//               }),
//               width: entity.width || 1,
//               height: entity.height || 1,
//               layer: entity.layer,
//               color: entity.color,
//               xdata: entity.xdata,
//             });
//             break;

//           case "INSERT":
//             if (dxfData.blocks?.[entity.name]) {
//               const block = dxfData.blocks[entity.name];
//               const localTransform = {
//                 position: entity.position || { x: 0, y: 0, z: 0 },
//                 xScale: entity.xScale || 1,
//                 yScale: entity.yScale || 1,
//                 zScale: entity.zScale || 1,
//                 rotation: entity.rotation || 0,
//                 extrusion: entity.extrusion || { x: 0, y: 0, z: 1 },
//                 basePoint: block.basePoint || { x: 0, y: 0, z: 0 },
//               };
//               const localMatrix = getTransformMatrix(localTransform);
//               const totalMatrix = multiplyMatrices(
//                 accumulatedMatrix,
//                 localMatrix
//               );
//               extractEntities(block.entities || [], totalMatrix, space);
//             } else {
//               console.warn(`Block not found: ${entity.name}`);
//               unknownEntities.push({ type: "INSERT", raw: entity, space });
//             }
//             break;

//           case "3DSOLID":
//           case "BODY":
//           case "REGION":
//           case "MESH":
//           case "SURFACE":
//             unknownEntities.push({
//               type: entity.type,
//               raw: entity,
//               space,
//               note: "Complex 3D entity, requires specialized processing",
//             });
//             break;

//           default:
//             console.warn(`Unsupported entity type: ${entity.type}`);
//             unknownEntities.push({ type: entity.type, raw: entity, space });
//             break;
//         }
//       } catch (err) {
//         console.error(`Error processing entity ${entity.type}:`, err, entity);
//         unknownEntities.push({
//           type: entity.type || "UNKNOWN",
//           raw: entity,
//           space,
//           error: err.message,
//         });
//       }
//     }
//   };

//   // Process model space and paper space
//   const identityMatrix = [
//     [1, 0, 0, 0],
//     [0, 1, 0, 0],
//     [0, 0, 1, 0],
//     [0, 0, 0, 1],
//   ];

//   // Extract entities from model space
//   extractEntities(dxfData.entities || [], identityMatrix, "model");

//   // Extract entities from paper space (layouts)
//   if (dxfData.blocks) {
//     for (const blockName of Object.keys(dxfData.blocks)) {
//       if (blockName.toUpperCase().startsWith("*PAPER_SPACE")) {
//         const block = dxfData.blocks[blockName];
//         if (block && block.entities) {
//           extractEntities(block.entities, identityMatrix, `paper:${blockName}`);
//         }
//       }
//     }
//   }

//   // Polygon tracing (unchanged)
//   const edgeMap = new Map();
//   for (const { start, end } of segments) {
//     const k1 = pointKey(start);
//     const k2 = pointKey(end);
//     edgeMap.set(k1, [...(edgeMap.get(k1) || []), end]);
//     edgeMap.set(k2, [...(edgeMap.get(k2) || []), start]);
//   }

//   const visited = new Set();
//   const polygons = [];

//   const tracePolygon = (start) => {
//     const polygon = [start];
//     let current = start;
//     const maxIterations = edgeMap.size;
//     let iteration = 0;

//     while (iteration < maxIterations) {
//       const currentKey = pointKey(current);
//       const neighbors = edgeMap.get(currentKey) || [];
//       const next = neighbors.find((p) => {
//         const edgeId = `${currentKey}->${pointKey(p)}`;
//         return !visited.has(edgeId);
//       });

//       if (!next) break;

//       const edgeId = `${currentKey}->${pointKey(next)}`;
//       const reverseEdgeId = `${pointKey(next)}->${currentKey}`;
//       visited.add(edgeId);
//       visited.add(reverseEdgeId);

//       if (equal(next, start)) {
//         polygon.push(start);
//         return polygon;
//       }

//       polygon.push(next);
//       current = next;
//       iteration++;
//     }

//     return null;
//   };

//   for (const [keyStr] of edgeMap.entries()) {
//     const [xStr, yStr, zStr] = keyStr.split(":");
//     const start = {
//       x: parseFloat(xStr),
//       y: parseFloat(yStr),
//       z: parseFloat(zStr),
//     };
//     const poly = tracePolygon(start);
//     if (poly && poly.length > 3) {
//       polygons.push(poly);
//     }
//   }

//   // Sort polygons clockwise
//   const sortClockwise = (points) => {
//     if (points.length < 3) return points;
//     const center = points.reduce(
//       (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
//       { x: 0, y: 0 }
//     );
//     center.x /= points.length;
//     center.y /= points.length;

//     return [...points].sort((a, b) => {
//       const angleA = Math.atan2(a.y - center.y, a.x - center.x);
//       const angleB = Math.atan2(b.y - center.y, b.x - center.x);
//       return angleA - angleB;
//     });
//   };

//   // Helper functions
//   function pointKey(point) {
//     const epsilon = 1e6;
//     return `${Math.round(point.x * epsilon) / epsilon}:${
//       Math.round(point.y * epsilon) / epsilon
//     }:${Math.round(point.z * epsilon) / epsilon}`;
//   }

//   function equal(p1, p2) {
//     const epsilon = 1e-6;
//     return (
//       Math.abs(p1.x - p2.x) < epsilon &&
//       Math.abs(p1.y - p2.y) < epsilon &&
//       Math.abs(p1.z - p2.z) < epsilon
//     );
//   }

//   // Return structured output
//   return {
//     polygons: polygons.map(sortClockwise),
//     texts,
//     curves,
//     lines,
//     unknownEntities,
//     metadata,
//   };
// };

export const extractAllFromDXF = (dxfData) => {
  if (!dxfData || typeof dxfData !== "object") {
    console.error("Invalid or missing DXF data");
    return {
      polygons: [],
      texts: [],
      curves: [],
      lines: [],
      unknownEntities: [],
      metadata: {},
    };
  }

  // Initialize result containers
  const segments = [];
  const texts = [];
  const curves = [];
  const lines = [];
  const unknownEntities = [];
  const metadata = {
    layers: dxfData.tables?.layer?.layers || {},
    header: dxfData.header || {},
    blocks: Object.keys(dxfData.blocks || {}),
    styles: dxfData.tables?.style?.styles || {},
    lineTypes: dxfData.tables?.ltype?.lineTypes || {},
    appIds: dxfData.tables?.appid?.appIds || {},
    units: dxfData.header?.$INSUNITS || 0,
    version: dxfData.header?.$ACADVER || "Unknown",
  };

  // Matrix helper functions
  function createTranslationMatrix(tx, ty, tz) {
    return [
      [1, 0, 0, tx],
      [0, 1, 0, ty],
      [0, 0, 1, tz],
      [0, 0, 0, 1],
    ];
  }

  function createScalingMatrix(sx, sy, sz) {
    return [
      [sx || 1, 0, 0, 0],
      [0, sy || 1, 0, 0],
      [0, 0, sz || 1, 0],
      [0, 0, 0, 1],
    ];
  }

  function createRotationMatrix(axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const ux = axis.x || 0;
    const uy = axis.y || 0;
    const uz = axis.z || 1;
    return [
      [c + ux * ux * t, ux * uy * t - uz * s, ux * uz * t + uy * s, 0],
      [uy * ux * t + uz * s, c + uy * uy * t, uy * uz * t - ux * s, 0],
      [uz * ux * t - uy * s, uz * uy * t + ux * s, c + uz * uz * t, 0],
      [0, 0, 0, 1],
    ];
  }

  function multiplyMatrices(A, B) {
    const result = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return result;
  }

  function transformPoint(M, point) {
    const x = point.x || 0;
    const y = point.y || 0;
    const z = point.z || 0;
    const w = 1;
    const newX = M[0][0] * x + M[0][1] * y + M[0][2] * z + M[0][3] * w;
    const newY = M[1][0] * x + M[1][1] * y + M[1][2] * z + M[1][3] * w;
    const newZ = M[2][0] * x + M[2][1] * y + M[2][2] * z + M[2][3] * w;
    return { x: newX, y: -newY, z: newZ };
  }

  function getTransformMatrix(transform) {
    const {
      position = { x: 0, y: 0, z: 0 },
      xScale = 1,
      yScale = 1,
      zScale = 1,
      rotation = 0,
      extrusion = { x: 0, y: 0, z: 1 },
      basePoint = { x: 0, y: 0, z: 0 },
    } = transform;

    if (xScale === 0 || yScale === 0 || zScale === 0) {
      console.warn(
        "Zero scale detected in transformation, using default scale"
      );
      transform.xScale = 1;
      transform.yScale = 1;
      transform.zScale = 1;
    }

    const T_b = createTranslationMatrix(
      -basePoint.x,
      -basePoint.y,
      -basePoint.z
    );
    const S = createScalingMatrix(xScale, yScale, zScale);
    const R = createRotationMatrix(extrusion, (rotation * Math.PI) / 180);
    const T_p = createTranslationMatrix(position.x, position.y, position.z);

    let M1 = multiplyMatrices(S, T_b);
    let M2 = multiplyMatrices(R, M1);
    let M_local = multiplyMatrices(T_p, M2);
    return M_local;
  }

  // Extract segments from vertices
  const extractSegmentsFromVertices = (vertices, isClosed = false) => {
    if (!Array.isArray(vertices) || vertices.length < 2) {
      console.warn("Invalid or insufficient vertices:", vertices);
      return [];
    }
    const segs = [];
    const len = isClosed ? vertices.length : vertices.length - 1;
    for (let i = 0; i < len; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      segs.push({ start: p1, end: p2 });
    }
    return segs;
  };

  // Extract all entities with accumulated transformation
  const extractEntities = (entities, accumulatedMatrix, space = "model") => {
    if (!Array.isArray(entities)) {
      console.warn("Entities is not an array:", entities);
      return;
    }

    for (const entity of entities) {
      if (!entity || !entity.type) {
        console.warn("Invalid entity:", entity);
        unknownEntities.push({ raw: entity, space });
        continue;
      }

      try {
        switch (entity.type.toUpperCase()) {
          case "LWPOLYLINE":
          case "POLYLINE":
            const isClosed = entity.closed || entity.shape || false;
            const vertices =
              entity.vertices || (entity.points ? entity.points : []);
            if (!vertices.length) {
              console.warn(`Empty vertices in ${entity.type}:`, entity);
              unknownEntities.push({ type: entity.type, raw: entity, space });
              break;
            }
            const transformedVertices = vertices.map((v) =>
              transformPoint(accumulatedMatrix, {
                x: v.x || 0,
                y: v.y || 0,
                z: v.z || 0,
              })
            );
            segments.push(
              ...extractSegmentsFromVertices(transformedVertices, isClosed)
            );
            break;

          case "LINE":
            if (
              !Array.isArray(entity.vertices) ||
              entity.vertices.length !== 2
            ) {
              console.warn("Invalid LINE vertices:", entity);
              unknownEntities.push({ type: "LINE", raw: entity, space });
              break;
            }
            const start = transformPoint(accumulatedMatrix, {
              x: entity.vertices[0].x || 0,
              y: entity.vertices[0].y || 0,
              z: entity.vertices[0].z || 0,
            });
            const end = transformPoint(accumulatedMatrix, {
              x: entity.vertices[1].x || 0,
              y: entity.vertices[1].y || 0,
              z: entity.vertices[1].z || 0,
            });
            lines.push({
              start,
              end,
              layer: entity.layer,
              color: entity.colorIndex,
              handle: entity.handle,
              ownerHandle: entity.ownerHandle,
              lineType: entity.lineType,
              lineTypeScale: entity.lineTypeScale,
              lineWeight: entity.lineweight,
              xdata: entity.xdata,
            });
            break;

          case "TEXT":
          case "MTEXT":
            const position = transformPoint(accumulatedMatrix, {
              x: entity.position?.x || entity.x || 0,
              y: entity.position?.y || entity.y || 0,
              z: entity.position?.z || entity.z || 0,
            });
            texts.push({
              type: entity.type,
              text: entity.text || entity.value || "",
              position,
              height: entity.height || 1,
              rotation:
                entity.directionVector?.y === -1 ? 90 : entity.rotation || 0,
              style: entity.style || "STANDARD",
              layer: entity.layer,
              color: entity.color,
              attachmentPoint: entity.attachmentPoint,
              width: entity.width,
              xdata: entity.xdata,
            });
            break;

          case "ARC":
            const arcCenter = transformPoint(accumulatedMatrix, {
              x: entity.center?.x || 0,
              y: entity.center?.y || 0,
              z: entity.center?.z || 0,
            });
            curves.push({
              type: "ARC",
              center: arcCenter,
              radius: entity.radius || 1,
              startAngle: (entity.startAngle || 0) * (Math.PI / 180),
              endAngle: (entity.endAngle || 360) * (Math.PI / 180),
              layer: entity.layer,
              color: entity.color,
              lineType: entity.lineType,
              xdata: entity.xdata,
            });
            break;

          case "CIRCLE":
            const circleCenter = transformPoint(accumulatedMatrix, {
              x: entity.center?.x || 0,
              y: entity.center?.y || 0,
              z: entity.center?.z || 0,
            });
            curves.push({
              type: "CIRCLE",
              center: circleCenter,
              radius: entity.radius || 1,
              layer: entity.layer,
              color: entity.colorIndex,
              lineType: entity.lineType,
              xdata: entity.xdata,
            });
            break;

          case "ELLIPSE":
            const ellipseCenter = transformPoint(accumulatedMatrix, {
              x: entity.center?.x || 0,
              y: entity.center?.y || 0,
              z: entity.center?.z || 0,
            });
            curves.push({
              type: "ELLIPSE",
              center: ellipseCenter,
              majorAxis: entity.majorAxis || 1,
              minorAxisRatio: entity.minorAxisRatio || 1,
              startAngle: entity.startAngle || 0,
              endAngle: entity.endAngle || 2 * Math.PI,
              layer: entity.layer,
              color: entity.color,
              xdata: entity.xdata,
            });
            break;

          case "SPLINE":
            const controlPoints = (entity.controlPoints || []).map((p) =>
              transformPoint(accumulatedMatrix, {
                x: p.x || 0,
                y: p.y || 0,
                z: p.z || 0,
              })
            );
            curves.push({
              type: "SPLINE",
              controlPoints,
              knots: entity.knots || [],
              degree: entity.degree || 3,
              layer: entity.layer,
              color: entity.color,
              xdata: entity.xdata,
            });
            break;

          case "HATCH":
            curves.push({
              type: "HATCH",
              boundaryPaths: (entity.boundaryPaths || []).map((path) => ({
                edges: (path.edges || []).map((edge) => ({
                  type: edge.type,
                  vertices: (edge.vertices || []).map((v) =>
                    transformPoint(accumulatedMatrix, {
                      x: v.x || 0,
                      y: v.y || 0,
                      z: v.z || 0,
                    })
                  ),
                  center: edge.center
                    ? transformPoint(accumulatedMatrix, {
                        x: edge.center.x || 0,
                        y: edge.center.y || 0,
                        z: edge.center.z || 0,
                      })
                    : undefined,
                  radius: edge.radius,
                  startAngle: edge.startAngle,
                  endAngle: edge.endAngle,
                })),
              })),
              pattern: entity.pattern,
              layer: entity.layer,
              color: entity.color,
              xdata: entity.xdata,
            });
            break;

          case "DIMENSION":
            texts.push({
              type: "DIMENSION",
              text: entity.text || "",
              position: transformPoint(accumulatedMatrix, {
                x: entity.textMidPoint?.x || entity.x || 0,
                y: entity.textMidPoint?.y || entity.y || 0,
                z: entity.textMidPoint?.z || entity.z || 0,
              }),
              definitionPoint: transformPoint(accumulatedMatrix, {
                x: entity.definitionPoint?.x || 0,
                y: entity.definitionPoint?.y || 0,
                z: entity.definitionPoint?.z || 0,
              }),
              dimensionType: entity.dimensionType,
              style: entity.style || "STANDARD",
              layer: entity.layer,
              color: entity.color,
              xdata: entity.xdata,
            });
            break;

          case "LEADER":
            lines.push({
              type: "LEADER",
              vertices: (entity.vertices || []).map((v) =>
                transformPoint(accumulatedMatrix, {
                  x: v.x || 0,
                  y: v.y || 0,
                  z: v.z || 0,
                })
              ),
              layer: entity.layer,
              color: entity.color,
              arrowHead: entity.arrowHead,
              xdata: entity.xdata,
            });
            break;

          case "SOLID":
          case "TRACE":
            const solidVertices = (entity.vertices || []).map((v) =>
              transformPoint(accumulatedMatrix, {
                x: v.x || 0,
                y: v.y || 0,
                z: v.z || 0,
              })
            );
            segments.push(...extractSegmentsFromVertices(solidVertices, true));
            break;

          case "3DFACE":
            const faceVertices = (entity.vertices || []).map((v) =>
              transformPoint(accumulatedMatrix, {
                x: v.x || 0,
                y: v.y || 0,
                z: v.z || 0,
              })
            );
            segments.push(...extractSegmentsFromVertices(faceVertices, true));
            break;

          case "POINT":
            lines.push({
              type: "POINT",
              position: transformPoint(accumulatedMatrix, {
                x: entity.position?.x || 0,
                y: entity.position?.y || 0,
                z: entity.position?.z || 0,
              }),
              layer: entity.layer,
              color: entity.color,
              xdata: entity.xdata,
            });
            break;

          case "ATTDEF":
          case "ATTRIB":
            const attribPosition = transformPoint(accumulatedMatrix, {
              x: entity.position?.x || entity.x || 0,
              y: entity.position?.y || entity.y || 0,
              z: entity.position?.z || entity.z || 0,
            });
            texts.push({
              type: entity.type,
              tag: entity.tag || "",
              text: entity.text || entity.value || "",
              position: attribPosition,
              height: entity.height || 1,
              rotation: entity.rotation || 0,
              style: entity.style || "STANDARD",
              layer: entity.layer,
              color: entity.color,
              xdata: entity.xdata,
            });
            break;

          case "VIEWPORT":
            curves.push({
              type: "VIEWPORT",
              center: transformPoint(accumulatedMatrix, {
                x: entity.center?.x || 0,
                y: entity.center?.y || 0,
                z: entity.center?.z || 0,
              }),
              width: entity.width || 1,
              height: entity.height || 1,
              layer: entity.layer,
              color: entity.color,
              xdata: entity.xdata,
            });
            break;

          case "INSERT":
            if (dxfData.blocks?.[entity.name]) {
              const block = dxfData.blocks[entity.name];
              const localTransform = {
                position: entity.position || { x: 0, y: 0, z: 0 },
                xScale: entity.xScale || 1,
                yScale: entity.yScale || 1,
                zScale: entity.zScale || 1,
                rotation: entity.rotation || 0,
                extrusion: entity.extrusion || { x: 0, y: 0, z: 1 },
                basePoint: block.basePoint || { x: 0, y: 0, z: 0 },
              };
              const localMatrix = getTransformMatrix(localTransform);
              const totalMatrix = multiplyMatrices(
                accumulatedMatrix,
                localMatrix
              );
              extractEntities(block.entities || [], totalMatrix, space);
            } else {
              console.warn(`Block not found: ${entity.name}`);
              unknownEntities.push({ type: "INSERT", raw: entity, space });
            }
            break;

          case "3DSOLID":
          case "BODY":
          case "REGION":
          case "MESH":
          case "SURFACE":
            unknownEntities.push({
              type: entity.type,
              raw: entity,
              space,
              note: "Complex 3D entity, requires specialized processing",
            });
            break;

          default:
            console.warn(`Unsupported entity type: ${entity.type}`);
            unknownEntities.push({ type: entity.type, raw: entity, space });
            break;
        }
      } catch (err) {
        console.error(`Error processing entity ${entity.type}:`, err, entity);
        unknownEntities.push({
          type: entity.type || "UNKNOWN",
          raw: entity,
          space,
          error: err.message,
        });
      }
    }
  };

  // Process model space and paper space
  const identityMatrix = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  // Extract entities from model space
  extractEntities(dxfData.entities || [], identityMatrix, "model");

  // Extract entities from paper space (layouts)
  if (dxfData.blocks) {
    for (const blockName of Object.keys(dxfData.blocks)) {
      if (blockName.toUpperCase().startsWith("*PAPER_SPACE")) {
        const block = dxfData.blocks[blockName];
        if (block && block.entities) {
          extractEntities(block.entities, identityMatrix, `paper:${blockName}`);
        }
      }
    }
  }

  // Polygon tracing
  const edgeMap = new Map();
  for (const { start, end } of segments) {
    const k1 = pointKey(start);
    const k2 = pointKey(end);
    edgeMap.set(k1, [...(edgeMap.get(k1) || []), end]);
    edgeMap.set(k2, [...(edgeMap.get(k2) || []), start]);
  }

  const visited = new Set();
  const polygons = [];

  const tracePolygon = (start) => {
    const polygon = [start];
    let current = start;
    const maxIterations = edgeMap.size;
    let iteration = 0;

    while (iteration < maxIterations) {
      const currentKey = pointKey(current);
      const neighbors = edgeMap.get(currentKey) || [];
      const next = neighbors.find((p) => {
        const edgeId = `${currentKey}->${pointKey(p)}`;
        return !visited.has(edgeId);
      });

      if (!next) break;

      const edgeId = `${currentKey}->${pointKey(next)}`;
      const reverseEdgeId = `${pointKey(next)}->${currentKey}`;
      visited.add(edgeId);
      visited.add(reverseEdgeId);

      if (equal(next, start)) {
        polygon.push(start);
        return polygon;
      }

      polygon.push(next);
      current = next;
      iteration++;
    }

    return null;
  };

  for (const [keyStr] of edgeMap.entries()) {
    const [xStr, yStr, zStr] = keyStr.split(":");
    const start = {
      x: parseFloat(xStr),
      y: parseFloat(yStr),
      z: parseFloat(zStr),
    };
    const poly = tracePolygon(start);
    if (poly && poly.length > 3) {
      polygons.push(poly);
    }
  }

  // Sort polygons clockwise
  const sortClockwise = (points) => {
    if (points.length < 3) return points;
    const center = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    center.x /= points.length;
    center.y /= points.length;

    return [...points].sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });
  };

  // Helper functions
  function pointKey(point) {
    const epsilon = 1e6;
    return `${Math.round(point.x * epsilon) / epsilon}:${
      Math.round(point.y * epsilon) / epsilon
    }:${Math.round(point.z * epsilon) / epsilon}`;
  }

  function equal(p1, p2) {
    const epsilon = 1e-6;
    return (
      Math.abs(p1.x - p2.x) < epsilon &&
      Math.abs(p1.y - p2.y) < epsilon &&
      Math.abs(p1.z - p2.z) < epsilon
    );
  }

  // Return structured output
  return {
    polygons: polygons.map(sortClockwise),
    texts,
    curves,
    lines,
    unknownEntities,
    metadata,
  };
};
