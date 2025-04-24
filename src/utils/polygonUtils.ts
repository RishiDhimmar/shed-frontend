import {
  equal,
  key,
  isPointInPolygon,
  calculateBoundingBoxArea,
  getEdgeCenter,
  getEdgeNormal,
  raySegmentIntersection,
} from "./GeometryUtils";
const EPSILON = 0.01;
const SCALE = 1 / 100;
export function sortPolygon(polygon) {
  if (polygon.length < 3) return polygon;

  const points = [...polygon];
  const result = [];
  result.push(points[0]);
  points.splice(0, 1);

  while (points.length > 0) {
    const currentPoint = result[result.length - 1];
    let nextPointIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < points.length; i++) {
      const distance = Math.sqrt(
        Math.pow(currentPoint.x - points[i].x, 2) +
          Math.pow(currentPoint.y - points[i].y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nextPointIndex = i;
      }
    }

    result.push(points[nextPointIndex]);
    points.splice(nextPointIndex, 1);
  }

  return result;
}

export function filterInnerRectangularPolygons(polygons) {
  return polygons.filter((polygon) => {
    const sortedPolygon = sortPolygon(polygon);
    const uniqueVertices = new Set();
    for (const vertex of sortedPolygon) {
      uniqueVertices.add(key(vertex));
    }
    if (uniqueVertices.size !== 4) return false;
    return areAnglesRight(sortedPolygon);
  });
}

export function areAnglesRight(polygon) {
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % n];
    const p3 = polygon[(i + 2) % n];
    const vector1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const vector2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    if (Math.abs(dotProduct) > EPSILON) return false;
  }
  return true;
}

export function findIntersectingPolygons(innerPolys) {
  const visited = new Set();
  const intersectingPolys = [];

  for (const poly of innerPolys) {
    if (visited.has(poly)) continue;
    const chain = traceInnerPolygons(poly, innerPolys, visited);
    for (const p of chain) visited.add(p);
    if (chain.length > 1) intersectingPolys.push(...chain);
  }

  return intersectingPolys;
}

export function traceInnerPolygons(
  startPoly,
  allPolygons,
  visited = new Set()
) {
  const queue = [startPoly];
  const result = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    result.push(current);

    for (let i = 0; i < current.length; i++) {
      const p1 = current[i];
      const p2 = current[(i + 1) % current.length];
      const center = getEdgeCenter(p1, p2);
      const normal = getEdgeNormal(p1, p2);
      const neighbor = raycastToPolygon(center, normal, allPolygons, current);
      if (neighbor && !visited.has(neighbor)) queue.push(neighbor);
    }
  }

  return result;
}

export function raycastToPolygon(
  origin,
  direction,
  polygons,
  excludePolygon = null
) {
  let closestPolygon = null;
  let closestDistSq = Infinity;

  for (const poly of polygons) {
    if (poly === excludePolygon) continue;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const hit = raySegmentIntersection(origin, direction, a, b);
      if (hit) {
        const dx = hit.x - origin.x;
        const dy = hit.y - origin.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < closestDistSq) {
          closestDistSq = distSq;
          closestPolygon = poly;
        }
      }
    }
  }

  return closestPolygon;
}

// export function isPointInPolygon(point, polygon) {
//   let inside = false;
//   let x = point.x,
//     y = point.y;

//   for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
//     const xi = polygon[i].x,
//       yi = polygon[i].y;
//     const xj = polygon[j].x,
//       yj = polygon[j].y;

//     const intersect =
//       yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
//     if (intersect) inside = !inside;
//   }

//   return inside;
// }
export function isPointInPolygon(point, polygon) {
  const EPSILON = 0.01; // Use CONFIG.EPSILON for consistency

  // Helper function to check if a point is on a line segment
  const isPointOnSegment = (p, v, w) => {
    // Check if point p is collinear with segment (v, w) and within bounds
    const minX = Math.min(v.x, w.x) - EPSILON;
    const maxX = Math.max(v.x, w.x) + EPSILON;
    const minY = Math.min(v.y, w.y) - EPSILON;
    const maxY = Math.max(v.y, w.y) + EPSILON;

    // Check if point is within the bounding box of the segment
    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
      return false;
    }

    // Calculate the distance from point to the line segment
    const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
    if (l2 < EPSILON) {
      // Segment is a point; check if p is close to v
      return Math.abs(p.x - v.x) < EPSILON && Math.abs(p.y - v.y) < EPSILON;
    }

    // Project point onto the line
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projection = {
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y),
    };

    // Check if the point is close to the projection
    const distance = Math.sqrt(
      (p.x - projection.x) ** 2 + (p.y - projection.y) ** 2
    );
    return distance < EPSILON;
  };

  // Check if the point lies on any edge of the polygon
  for (let i = 0; i < polygon.length; i++) {
    const v = polygon[i];
    const w = polygon[(i + 1) % polygon.length];
    if (isPointOnSegment(point, v, w)) {
      return true; // Point is on the edge
    }
  }

  // Original ray-casting algorithm for points not on edges
  let inside = false;
  let x = point.x,
    y = point.y;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
export function calculateBoundingBoxArea(polygon) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const point of polygon) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return (maxX - minX) * (maxY - minY);
}

export function doLinesIntersect(p1, p2, p3, p4, EPSILON = 0.01) {
  const a1 = p2.y - p1.y;
  const b1 = p1.x - p2.x;
  const c1 = a1 * p1.x + b1 * p1.y;

  const a2 = p4.y - p3.y;
  const b2 = p3.x - p4.x;
  const c2 = a2 * p3.x + b2 * p3.y;

  const determinant = a1 * b2 - a2 * b1;

  if (Math.abs(determinant) < EPSILON) {
    return null;
  }

  const x = (b2 * c1 - b1 * c2) / determinant;
  const y = (a1 * c2 - a2 * c1) / determinant;

  const isOnSegment = (p, q, r) =>
    q.x >= Math.min(p.x, r.x) - EPSILON &&
    q.x <= Math.max(p.x, r.x) + EPSILON &&
    q.y >= Math.min(p.y, r.y) - EPSILON &&
    q.y <= Math.max(p.y, r.y) + EPSILON;

  const point = { x, y };
  if (isOnSegment(p1, point, p2) && isOnSegment(p3, point, p4)) {
    return point;
  }

  return null;
}
