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

export const extractAllFromDXF = (dxfData) => {
  if (!dxfData || !Array.isArray(dxfData.entities)) {
    console.error("Invalid or missing DXF data");
    return { polygons: [], texts: [], curves: [], lines: [], metadata: {} };
  }

  // Initialize result containers
  const segments = [];
  const texts = [];
  const curves = [];
  const lines = [];
  const metadata = {
    layers: dxfData.tables?.layer?.layers || {},
    header: dxfData.header || {},
    blocks: Object.keys(dxfData.blocks || {}),
  };

  // Matrix helper functions for 4x4 matrices
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
      [sx, 0, 0, 0],
      [0, sy, 0, 0],
      [0, 0, sz, 0],
      [0, 0, 0, 1],
    ];
  }

  function createRotationMatrix(axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const ux = axis.x;
    const uy = axis.y;
    const uz = axis.z;
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
    const x = point.x;
    const y = point.y;
    const z = point.z || 0;
    const w = 1;
    const newX = M[0][0] * x + M[0][1] * y + M[0][2] * z + M[0][3] * w;
    const newY = M[1][0] * x + M[1][1] * y + M[1][2] * z + M[1][3] * w;
    const newZ = M[2][0] * x + M[2][1] * y + M[2][2] * z + M[2][3] * w;
    // Invert y-coordinate to flip along y-axis
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

    // Debugging: Log transform parameters

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

  // Extract segments from vertices (for polylines)
  const extractSegmentsFromVertices = (vertices) => {
    if (!Array.isArray(vertices) || vertices.length < 2) {
      console.warn("Invalid or insufficient vertices:", vertices);
      return [];
    }
    const segs = [];
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      segs.push({ start: p1, end: p2 });
    }
    return segs;
  };

  // Extract all entities with accumulated transformation matrix
  const extractEntities = (entities, accumulatedMatrix) => {
    for (const entity of entities) {
      switch (entity.type) {
        case "LWPOLYLINE":
        case "POLYLINE":
          const transformedVertices = entity.vertices.map((v) =>
            transformPoint(accumulatedMatrix, { x: v.x, y: v.y, z: v.z || 0 })
          );
          segments.push(...extractSegmentsFromVertices(transformedVertices));
          break;

        case "LINE":
          if (!Array.isArray(entity.vertices) || entity.vertices.length !== 2) {
            console.warn("Invalid LINE vertices:", entity.vertices);
            break;
          }
          const start = transformPoint(accumulatedMatrix, {
            x: entity.vertices[0].x,
            y: entity.vertices[0].y,
            z: entity.vertices[0].z || 0,
          });
          const end = transformPoint(accumulatedMatrix, {
            x: entity.vertices[1].x,
            y: entity.vertices[1].y,
            z: entity.vertices[1].z || 0,
          });
          lines.push({
            start,
            end,
            layer: entity.layer,
            color: entity.color,
            handle: entity.handle,
            ownerHandle: entity.ownerHandle,
            lineTypeScale: entity.lineTypeScale,
            lineweight: entity.lineweight,
          });
          break;

        case "TEXT":
        case "MTEXT":
          const position = transformPoint(accumulatedMatrix, {
            x: entity.position?.x || 0,
            y: entity.position?.y || 0,
            z: entity.position?.z || 0,
          });
          texts.push({
            type: entity.type,
            text: entity.text || entity.value || "",
            position,
            height: entity.height || 1,
            rotation: entity.rotation || 0,
            style: entity.style || "STANDARD",
            layer: entity.layer,
            color: entity.color,
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
            color: entity.color,
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
          });
          break;

        case "SPLINE":
          const controlPoints = (entity.controlPoints || []).map((p) =>
            transformPoint(accumulatedMatrix, { x: p.x, y: p.y, z: p.z || 0 })
          );
          curves.push({
            type: "SPLINE",
            controlPoints,
            knots: entity.knots || [],
            degree: entity.degree || 3,
            layer: entity.layer,
            color: entity.color,
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
            // Debugging: Log block name and base point
            const localMatrix = getTransformMatrix(localTransform);
            const totalMatrix = multiplyMatrices(
              accumulatedMatrix,
              localMatrix
            );
            extractEntities(block.entities, totalMatrix);
          } else {
            console.warn(`Block not found: ${entity.name}`);
          }
          break;

        default:
          console.warn(`Unsupported entity type: ${entity.type}`);
          break;
      }
    }
  };

  // Start extraction with identity matrix
  const identityMatrix = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  extractEntities(dxfData.entities, identityMatrix);

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

  // Sort polygons clockwise (projected onto xy-plane)
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
    metadata,
  };
};

// export const extractAllFromDXF = (dxfData) => {
//   if (!dxfData || !Array.isArray(dxfData.entities)) {
//     console.error("Invalid or missing DXF data");
//     return { polygons: [], texts: [], curves: [], lines: [], metadata: {} };
//   }

//   // Initialize result containers
//   const segments = [];
//   const texts = [];
//   const curves = [];
//   const lines = [];
//   const metadata = {
//     layers: dxfData.tables?.layer?.layers || {},
//     header: dxfData.header || {},
//     blocks: Object.keys(dxfData.blocks || {}),
//   };

//   // Matrix helper functions for 4x4 matrices
//   function createTranslationMatrix(tx, ty, tz) {
//     return [
//       [1, 0, 0, tx],
//       [0, 1, 0, ty],
//       [0, 0, 1, tz],
//       [0, 0, 0, 1]
//     ];
//   }

//   function createScalingMatrix(sx, sy, sz) {
//     return [
//       [sx, 0, 0, 0],
//       [0, sy, 0, 0],
//       [0, 0, sz, 0],
//       [0, 0, 0, 1]
//     ];
//   }

//   function createRotationMatrix(axis, angle) {
//     const c = Math.cos(angle);
//     const s = Math.sin(angle);
//     const t = 1 - c;
//     const ux = axis.x;
//     const uy = axis.y;
//     const uz = axis.z;
//     return [
//       [c + ux * ux * t, ux * uy * t - uz * s, ux * uz * t + uy * s, 0],
//       [uy * ux * t + uz * s, c + uy * uy * t, uy * uz * t - ux * s, 0],
//       [uz * ux * t - uy * s, uz * uy * t + ux * s, c + uz * uz * t, 0],
//       [0, 0, 0, 1]
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
//     const x = point.x;
//     const y = point.y;
//     const z = point.z || 0;
//     const w = 1;
//     const newX = M[0][0] * x + M[0][1] * y + M[0][2] * z + M[0][3] * w;
//     const newY = M[1][0] * x + M[1][1] * y + M[1][2] * z + M[1][3] * w;
//     const newZ = M[2][0] * x + M[2][1] * y + M[2][2] * z + M[2][3] * w;
//     // Invert y-coordinate to flip along y-axis
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
//       basePoint = { x: 0, y: 0, z: 0 }
//     } = transform;

//     // Debugging: Log transform parameters
//     console.log(`Transform: position=${JSON.stringify(position)}, xScale=${xScale}, yScale=${yScale}, zScale=${zScale}, rotation=${rotation}, extrusion=${JSON.stringify(extrusion)}, basePoint=${JSON.stringify(basePoint)}`);

//     // Warn if base point is zero, indicating potential parsing issue
//     if (basePoint.x === 0 && basePoint.y === 0 && basePoint.z === 0) {
//       console.warn(`Base point is (0,0,0) for transform. Verify DXF block base point parsing.`);
//     }

//     const T_b = createTranslationMatrix(-basePoint.x, -basePoint.y, -basePoint.z);
//     const S = createScalingMatrix(xScale, yScale, zScale);
//     const R = createRotationMatrix(extrusion, rotation * Math.PI / 180);
//     const T_p = createTranslationMatrix(position.x, position.y, position.z);

//     let M1 = multiplyMatrices(S, T_b);
//     let M2 = multiplyMatrices(R, M1);
//     let M_local = multiplyMatrices(T_p, M2);

//     // Debugging: Log final transformation matrix
//     console.log(`Final transformation matrix: ${JSON.stringify(M_local)}`);

//     return M_local;
//   }

//   // Extract segments from vertices (for polylines)
//   const extractSegmentsFromVertices = (vertices) => {
//     if (!Array.isArray(vertices) || vertices.length < 2) {
//       console.warn("Invalid or insufficient vertices:", vertices);
//       return [];
//     }
//     const segs = [];
//     for (let i = 0; i < vertices.length; i++) {
//       const p1 = vertices[i];
//       const p2 = vertices[(i + 1) % vertices.length];
//       segs.push({ start: p1, end: p2 });
//     }
//     return segs;
//   };

//   // Extract all entities with accumulated transformation matrix
//   const extractEntities = (entities, accumulatedMatrix) => {
//     for (const entity of entities) {
//       switch (entity.type) {
//         case "LWPOLYLINE":
//         case "POLYLINE":
//           const transformedVertices = entity.vertices.map(v => {
//             const transformed = transformPoint(accumulatedMatrix, { x: v.x, y: v.y, z: v.z || 0 });
//             // Debugging: Log transformed vertices
//             console.log(`Transformed vertex for ${entity.type} (handle: ${entity.handle}): ${JSON.stringify(transformed)}`);
//             return transformed;
//           });
//           segments.push(...extractSegmentsFromVertices(transformedVertices));
//           break;

//         case "LINE":
//           if (!Array.isArray(entity.vertices) || entity.vertices.length !== 2) {
//             console.warn("Invalid LINE vertices:", entity.vertices);
//             break;
//           }
//           const start = transformPoint(accumulatedMatrix, {
//             x: entity.vertices[0].x,
//             y: entity.vertices[0].y,
//             z: entity.vertices[0].z || 0
//           });
//           const end = transformPoint(accumulatedMatrix, {
//             x: entity.vertices[1].x,
//             y: entity.vertices[1].y,
//             z: entity.vertices[1].z || 0
//           });
//           // Debugging: Log transformed LINE vertices
//           console.log(`Transformed LINE (handle: ${entity.handle}): start=${JSON.stringify(start)}, end=${JSON.stringify(end)}`);
//           lines.push({
//             start,
//             end,
//             layer: entity.layer,
//             color: entity.color,
//             handle: entity.handle,
//             ownerHandle: entity.ownerHandle,
//             lineTypeScale: entity.lineTypeScale,
//             lineweight: entity.lineweight,
//           });
//           break;

//         case "TEXT":
//         case "MTEXT":
//           const position = transformPoint(accumulatedMatrix, {
//             x: entity.position?.x || 0,
//             y: entity.position?.y || 0,
//             z: entity.position?.z || 0
//           });
//           // Debugging: Log transformed TEXT position
//           console.log(`Transformed ${entity.type} (handle: ${entity.handle}): position=${JSON.stringify(position)}, text="${entity.text || entity.value}"`);
//           texts.push({
//             type: entity.type,
//             text: entity.text || entity.value || "",
//             position,
//             height: entity.height || 1,
//             rotation: entity.rotation || 0,
//             style: entity.style || "STANDARD",
//             layer: entity.layer,
//             color: entity.color,
//           });
//           break;

//         case "ARC":
//           const arcCenter = transformPoint(accumulatedMatrix, {
//             x: entity.center?.x || 0,
//             y: entity.center?.y || 0,
//             z: entity.center?.z || 0
//           });
//           curves.push({
//             type: "ARC",
//             center: arcCenter,
//             radius: entity.radius || 1,
//             startAngle: (entity.startAngle || 0) * (Math.PI / 180),
//             endAngle: (entity.endAngle || 360) * (Math.PI / 180),
//             layer: entity.layer,
//             color: entity.color,
//           });
//           break;

//         case "CIRCLE":
//           const circleCenter = transformPoint(accumulatedMatrix, {
//             x: entity.center?.x || 0,
//             y: entity.center?.y || 0,
//             z: entity.center?.z || 0
//           });
//           curves.push({
//             type: "CIRCLE",
//             center: circleCenter,
//             radius: entity.radius || 1,
//             layer: entity.layer,
//             color: entity.color,
//           });
//           break;

//         case "ELLIPSE":
//           const ellipseCenter = transformPoint(accumulatedMatrix, {
//             x: entity.center?.x || 0,
//             y: entity.center?.y || 0,
//             z: entity.center?.z || 0
//           });
//           curves.push({
//             type: "ELLIPSE",
//             center: ellipseCenter,
//             majorAxis: entity.majorAxis || 1,
//             minorAxisRatio: entity.minorAxisRatio || 1,
//             startAngle: entity.startAngle || 0,
//             endAngle: entity.endAngle || 2 * Math.PI,
//             layer: entity.layer,
//             color: entity.color,
//           });
//           break;

//         case "SPLINE":
//           const controlPoints = (entity.controlPoints || []).map(p =>
//             transformPoint(accumulatedMatrix, { x: p.x, y: p.y, z: p.z || 0 })
//           );
//           curves.push({
//             type: "SPLINE",
//             controlPoints,
//             knots: entity.knots || [],
//             degree: entity.degree || 3,
//             layer: entity.layer,
//             color: entity.color,
//           });
//           break;

//         case "INSERT":
//           if (dxfData.blocks?.[entity.name]) {
//             const block = dxfData.blocks[entity.name];
//             const localTransform = {
//               position: entity.position || { x: 0, y: 0, z: 0 },
//               xScale: entity.xScale || 1,
//               yScale: entity.yScale || 1,
//               zScale: entity.zScale || 1,
//               rotation: entity.rotation || 0,
//               extrusion: entity.extrusion || { x: 0, y: 0, z: 1 },
//               basePoint: block.basePoint || { x: 0, y: 0, z: 0 },
//             };
//             // Debugging: Log block name and base point
//             console.log(`Processing INSERT for block: ${entity.name}, basePoint: ${JSON.stringify(localTransform.basePoint)}`);
//             const localMatrix = getTransformMatrix(localTransform);
//             const totalMatrix = multiplyMatrices(accumulatedMatrix, localMatrix);
//             extractEntities(block.entities, totalMatrix);
//           } else {
//             console.warn(`Block not found: ${entity.name}`);
//           }
//           break;

//         default:
//           console.warn(`Unsupported entity type: ${entity.type}`);
//           break;
//       }
//     }
//   };

//   // Start extraction with identity matrix
//   const identityMatrix = [
//     [1, 0, 0, 0],
//     [0, 1, 0, 0],
//     [0, 0, 1, 0],
//     [0, 0, 0, 1]
//   ];
//   extractEntities(dxfData.entities, identityMatrix);

//   // Polygon tracing
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
//     const start = { x: parseFloat(xStr), y: parseFloat(yStr), z: parseFloat(zStr) };
//     const poly = tracePolygon(start);
//     if (poly && poly.length > 3) {
//       polygons.push(poly);
//     }
//   }

//   // Sort polygons clockwise (projected onto xy-plane)
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
//     return `${Math.round(point.x * epsilon) / epsilon}:${Math.round(point.y * epsilon) / epsilon}:${Math.round(point.z * epsilon) / epsilon}`;
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
//     metadata,
//   };
// };
