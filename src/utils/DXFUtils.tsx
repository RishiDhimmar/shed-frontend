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
  const segments = []; // For polygons
  const texts = []; // For TEXT and MTEXT
  const curves = []; // For ARC, CIRCLE, ELLIPSE, SPLINE
  const lines = []; // For LINE
  const metadata = {
    layers: dxfData.tables?.layer?.layers || {},
    header: dxfData.header || {},
    blocks: Object.keys(dxfData.blocks || {}),
  };

  // Transformation function
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

  // Extract segments from vertices (for polylines)
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

  // Extract all entities
  const extractEntities = (entities, insert = null) => {
    for (const entity of entities) {
      switch (entity.type) {
        case "LWPOLYLINE":
        case "POLYLINE":
          segments.push(...extractSegmentsFromVertices(entity.vertices, insert));
          break;

        case "LINE":
          {
            if (!Array.isArray(entity.vertices) || entity.vertices.length !== 2) {
              console.warn("Invalid LINE vertices:", entity.vertices);
              break;
            }
            let start = { x: entity.vertices[0].x, y: entity.vertices[0].y };
            let end = { x: entity.vertices[1].x, y: entity.vertices[1].y };
            if (insert) {
              start = applyTransform(start, insert, insert.basePoint);
              end = applyTransform(end, insert, insert.basePoint);
            }
            lines.push({
              start: scalePoint(start),
              end: scalePoint(end),
              layer: entity.layer,
              color: entity.color,
              handle: entity.handle,
              ownerHandle: entity.ownerHandle,
              lineTypeScale: entity.lineTypeScale,
              lineweight: entity.lineweight,
            });
          }
          break;

        case "TEXT":
        case "MTEXT":
          {
            let position = { x: entity.position?.x || 0, y: entity.position?.y || 0 };
            if (insert) {
              position = applyTransform(position, insert, insert.basePoint);
            }
            texts.push({
              type: entity.type,
              text: entity.text || entity.value || "",
              position: scalePoint(position),
              height: entity.height || 1,
              rotation: entity.rotation || 0,
              style: entity.style || "STANDARD",
              layer: entity.layer,
              color: entity.color,
            });
          }
          break;

        case "ARC":
          {
            let center = { x: entity.center?.x || 0, y: entity.center?.y || 0 };
            if (insert) {
              center = applyTransform(center, insert, insert.basePoint);
            }
            curves.push({
              type: "ARC",
              center: scalePoint(center),
              radius: entity.radius || 1,
              startAngle: (entity.startAngle || 0) * (Math.PI / 180),
              endAngle: (entity.endAngle || 360) * (Math.PI / 180),
              layer: entity.layer,
              color: entity.color,
            });
          }
          break;

        case "CIRCLE":
          {
            let center = { x: entity.center?.x || 0, y: entity.center?.y || 0 };
            if (insert) {
              center = applyTransform(center, insert, insert.basePoint);
            }
            curves.push({
              type: "CIRCLE",
              center: scalePoint(center),
              radius: entity.radius || 1,
              layer: entity.layer,
              color: entity.color,
            });
          }
          break;

        case "ELLIPSE":
          {
            let center = { x: entity.center?.x || 0, y: entity.center?.y || 0 };
            if (insert) {
              center = applyTransform(center, insert, insert.basePoint);
            }
            curves.push({
              type: "ELLIPSE",
              center: scalePoint(center),
              majorAxis: entity.majorAxis || 1,
              minorAxisRatio: entity.minorAxisRatio || 1,
              startAngle: entity.startAngle || 0,
              endAngle: entity.endAngle || 2 * Math.PI,
              layer: entity.layer,
              color: entity.color,
            });
          }
          break;

        case "SPLINE":
          {
            const controlPoints = (entity.controlPoints || []).map((p) => {
              let point = { x: p.x, y: p.y };
              if (insert) {
                point = applyTransform(point, insert, insert.basePoint);
              }
              return scalePoint(point);
            });
            curves.push({
              type: "SPLINE",
              controlPoints,
              knots: entity.knots || [],
              degree: entity.degree || 3,
              layer: entity.layer,
              color: entity.color,
            });
          }
          break;

        case "INSERT":
          if (dxfData.blocks?.[entity.name]) {
            const block = dxfData.blocks[entity.name];
            extractEntities(block.entities, {
              position: entity.position || { x: 0, y: 0 },
              rotation: entity.rotation || 0,
              xScale: entity.xScale || 1,
              yScale: entity.yScale || 1,
              basePoint: block.position || { x: 0, y: 0 },
            });
          }
          break;

        default:
          console.warn(`Unsupported entity type: ${entity.type}`);
          break;
      }
    }
  };

  // Extract entities from the main entities array
  extractEntities(dxfData.entities);

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
    const [x, y] = keyStr.split(":").map(Number);
    const start = { x, y };
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

  // Return structured output
  return {
    polygons: polygons.map(sortClockwise),
    texts,
    curves,
    lines,
    metadata,
  };
};