import { scalePoint, key, equal } from "./GeometryUtils";
import { sortPolygon } from "./polygonUtils";

export function extractPolygonsFromDXF(dxfData) {
  const segments = [];

  const applyTransform = (point, insert) => {
    console.log("applyTransform Input:", { point, insert });
    const angle = (insert.rotation || 0) * (Math.PI / 180);
    const scaleX = insert.xScale ?? 1;
    const scaleY = insert.yScale ?? 1;
    let x = point.x * scaleX ;
    let y = point.y * scaleY ;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rx = x * cosA - y * sinA;
    const ry = x * sinA + y * cosA;
    const tx = insert.position?.x ?? 0;
    const ty = insert.position?.y ?? 0;
    return { x: rx + tx, y: ry + ty };
  };

  const extractSegmentsFromVertices = (vertices, insert = null) => {
    const segs = [];
    for (let i = 0; i < vertices.length; i++) {
      let p1 = vertices[i];
      let p2 = vertices[(i + 1) % vertices.length];
      if (insert) {
        p1 = applyTransform(p1, insert);
        p2 = applyTransform(p2, insert);
      }
      segs.push({ start: scalePoint(p1), end: scalePoint(p2) });
    }
    return segs;
  };

  const extractEntities = (entities, insert = null) => {
    for (const entity of entities) {
      if (entity.type === "LWPOLYLINE" || entity.type === "POLYLINE") {
        segments.push(...extractSegmentsFromVertices(entity.vertices, insert));
      }
      if (entity.type === "INSERT" && dxfData.blocks?.[entity.name]) {
        extractEntities(dxfData.blocks[entity.name].entities, entity);
      }
    }
  };

  extractEntities(dxfData.entities);

  const graph = new Map();
  for (const seg of segments) {
    const k1 = key(seg.start);
    const k2 = key(seg.end);
    if (!graph.has(k1)) graph.set(k1, []);
    if (!graph.has(k2)) graph.set(k2, []);
    graph.get(k1).push(seg.end);
    graph.get(k2).push(seg.start);
  }

  const visitedEdges = new Set();
  const polygons = [];

  const walk = (path, current, origin, depth = 0) => {
    const currentKey = key(current);
    const originKey = key(origin);
    if (depth > 2 && equal(current, origin)) {
      polygons.push([...path]);
      return;
    }
    if (!graph.has(currentKey)) return;
    for (const next of graph.get(currentKey)) {
      const edgeKey = `${key(current)}->${key(next)}`;
      if (visitedEdges.has(edgeKey)) continue;
      visitedEdges.add(edgeKey);
      path.push(next);
      walk(path, next, origin, depth + 1);
      path.pop();
    }
  };

  for (const [startKey] of graph.entries()) {
    const [x, y] = startKey.split(":").map(Number);
    walk([{ x, y }], { x, y }, { x, y });
  }

  const unique = new Set();
  const finalPolygons = [];
  for (const poly of polygons) {
    const hash = poly
      .map((p) => key(p))
      .sort()
      .join("-");
    if (!unique.has(hash)) {
      unique.add(hash);
      finalPolygons.push(sortPolygon(poly));
    }
  }

  return finalPolygons;
}
