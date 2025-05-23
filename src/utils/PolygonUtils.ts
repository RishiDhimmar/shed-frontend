import { all, getDirection } from "three/tsl";
import baseplateStore from "../stores/BasePlateStore";
import dxfStore from "../stores/DxfStore";
import { equal, key } from "./GeometryUtils";
import columnStore from "../stores/ColumnStore";
const EPSILON = 0.01;
const SCALE = 1 / 100;
const CONFIG = {
  EPSILON: 0.01,
  SCALE: 1 / 100,
  RAY_LENGTH: 9800,
  CANVAS_PADDING: 20,
  MAX_SCALE: 5,
  MIN_SCALE: 0.1,
  ZOOM_STEP: 0.1,
  EDGE_THRESHOLD: 0.5,
};
import * as ClipperLib from "clipper-lib";

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

  return result.reverse();
}
function computeCentroid(points) {
  let sumX = 0,
    sumY = 0;
  for (let p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  let n = points.length;
  return { x: sumX / n, y: sumY / n };
}
export function getCenterPoints(points) {
  let sumX = 0,
    sumY = 0;
  for (let p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  let n = points.length;
  return { x: sumX / n, y: sumY / n };
}

// Helper function to calculate the polar angle of a point relative to the centroid
function getAngle(p, center) {
  let dx = p.x - center.x,
    dy = p.y - center.y;
  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

// Helper function to calculate the Euclidean distance from a point to the centroid
function getDistance(p, center) {
  let dx = p.x - center.x,
    dy = p.y - center.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Function to sort polygon points in clockwise order
export function sortPolygonPointsClockwise(points) {
  if (points.length < 2) return points;
  let center = computeCentroid(points);
  return points.slice().sort((p1, p2) => {
    let angle1 = getAngle(p1, center),
      angle2 = getAngle(p2, center);
    if (angle1 !== angle2) return angle2 - angle1; // Descending for clockwise
    let dist1 = getDistance(p1, center),
      dist2 = getDistance(p2, center);
    return dist1 - dist2; // Ascending distance for ties
  });
}

export function getLineDirection(p1, p2, epsilon = 1e-6) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const x = Math.abs(dx) < epsilon ? 0 : dx;
  const y = Math.abs(dy) < epsilon ? 0 : dy;

  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? "+x" : "-x";
  } else if (Math.abs(y) > 0) {
    return y > 0 ? "+y" : "-y";
  } else {
    return "none"; // points are essentially the same
  }
}

export function getEdgeCenter(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}
export function getEdgeNormal(p1, p2, polygon) {
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

export const getBounds = (polygon) => {
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
export function getPolygonCenter(polygon) {
  const bounds = getBounds(polygon);
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
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
export const traceInnerPolygonsWithRays = (startPoly, otherPolys) => {
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
export const findIntersectingPolygons = (rays) => {
  const uniquePolygons = new Set();

  for (const ray of rays) {
    if (ray.hitPolygon) {
      uniquePolygons.add(ray.hitPolygon);
    }
  }

  return Array.from(uniquePolygons).filter(Boolean);
};
export const filterPolygonsByDimension = (
  polygons,
  referencePolygon,
  tolerance
) => {
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

// Helper function to check if one polygon is completely inside another
export function isCompletelyInside(innerPoly, outerPoly) {
  for (let point of innerPoly) {
    if (!isPointInPolygon(point, outerPoly)) {
      return false;
    }
  }
  return true;
}

// Updated traceAllPolygonsWithRays function
export const traceAllPolygonsWithRays = (startPoly, otherPolys) => {
  const allRays = [];
  const allIntersectingPolygons = new Set();
  const processedPolygons = new Set();
  const queue = [{ poly: startPoly, depth: 0 }];
  const DIMENSION_TOLERANCE = 1000;

  // Define tempInternalWall
  let tempInternalWall = [];
  for (let i = 0; i < dxfStore.internalWallPolygon.length; i += 3) {
    tempInternalWall.push({
      x: dxfStore.internalWallPolygon[i],
      y: dxfStore.internalWallPolygon[i + 1],
      z: dxfStore.internalWallPolygon[i + 2],
    });
  }

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

    filteredIntersectingPolys.forEach((intersectingPoly) => {
      const intersectingKey = getPolygonKey(intersectingPoly);
      if (!processedPolygons.has(intersectingKey)) {
        queue.push({ poly: intersectingPoly, depth: 0 });
      }
      allIntersectingPolygons.add(intersectingPoly);
    });
  }

  // Step 1: Filter out inner polygons
  let keptPolygons = new Set();
  for (let P of allIntersectingPolygons) {
    let isInner = false;
    for (let Q of allIntersectingPolygons) {
      if (P === Q) continue; // Skip self
      if (isCompletelyInside(P, Q)) {
        isInner = true;
        break;
      }
    }
    if (!isInner) {
      keptPolygons.add(P);
    }
  }

  // Step 2: Generate baseplates only for kept polygons
  for (let poly of keptPolygons) {
    const rays = traceInnerPolygonsWithRays(poly, otherPolys);
    let count = 0;
    const hits = [];
    rays.forEach((ray) => {
      if (
        ray.hitPolygon &&
        getPolygonKey(ray.hitPolygon) === getPolygonKey(tempInternalWall)
      ) {
        count++;
        const direction = getLineDirection(ray.start, ray.end);
        hits.push({
          hitPoint: ray.hit,
          direction: direction,
        });
      }
    });
    const baseplateData = {
      points: poly,
      hits: hits,
      center: getPolygonCenter(poly),
    };
    if (count === 2) {
      baseplateData.type = "corner";
      baseplateStore.cornerBasePlates.push({
        ...baseplateData,
        group: "Group 2",
      });
    } else if (count === 1) {
      baseplateData.type = "edge";
      baseplateStore.edgeBasePlates.push({
        ...baseplateData,
        group: "Group 1",
      });
    } else if (count === 0) {
      baseplateData.type = "middle";
      baseplateStore.middleBasePlates.push({
        ...baseplateData,
        group: "Group 3",
      });
    }
  }

  // Step 3: Return the filtered list of polygons
  return {
    rays: allRays,
    allIntersectingPolygons: Array.from(keptPolygons),
  };
};

export const distanceBetPoints = (p1, p2) => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

export const getBiggerRectangleAtOffset = (
  polygon,
  offsetLeft,
  offsetRight,
  offsetTop,
  offsetBottom
) => {
  const { points } = polygon;
  const biggerPolygon = [
    { x: points[0].x + offsetLeft, y: points[0].y - offsetTop },
    { x: points[1].x - offsetRight, y: points[1].y - offsetTop },
    { x: points[2].x - offsetRight, y: points[2].y + offsetBottom },
    { x: points[3].x + offsetLeft, y: points[3].y + offsetBottom },
  ];
  return sortPolygonPointsClockwise(biggerPolygon);
};

export function generateBiggerPolygonAtSomeOffset(
  points: Array<{ x: number; y: number; z: number }>,
  offset: number
): Array<{ x: number; y: number; z: number }> {
  // Validate inputs
  if (points.length < 3) {
    throw new Error("Polygon must have at least 3 points");
  }
  if (!Number.isFinite(offset)) {
    throw new Error("Offset must be a finite number");
  }

  // Clamp offset to a reasonable range
  const maxOffset = offset;

  // Validate points: must be {x, y, z} with finite numbers
  for (const point of points) {
    if (
      typeof point !== "object" ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y) ||
      !Number.isFinite(point.z)
    ) {
      throw new Error(
        "All points must be {x, y, z} objects with finite numbers"
      );
    }
  }

  // Handle empty or single-point cases
  if (points.length === 0) {
    return [];
  }
  if (points.length === 1) {
    return [{ x: points[0].x, y: points[0].y, z: points[0].z }];
  }

  // Helper function to check if two points are identical within epsilon
  const arePointsIdentical = (
    point1: { x: number; y: number; z: number },
    point2: { x: number; y: number; z: number },
    epsilon: number = 0.0001
  ): boolean => {
    return (
      Math.abs(point1.x - point2.x) < epsilon &&
      Math.abs(point1.y - point2.y) < epsilon &&
      Math.abs(point1.z - point2.z) < epsilon
    );
  };

  // Helper function to filter unique points
  const getUniquePoints = (
    points: Array<{ x: number; y: number; z: number }>,
    epsilon: number = 0.0001
  ): Array<{ x: number; y: number; z: number }> => {
    const uniquePoints: Array<{ x: number; y: number; z: number }> = [];
    for (const point of points) {
      let isUnique = true;
      for (const existingPoint of uniquePoints) {
        if (arePointsIdentical(point, existingPoint, epsilon)) {
          isUnique = false;
          break;
        }
      }
      if (isUnique) {
        uniquePoints.push(point);
      }
    }
    return uniquePoints;
  };

  // Filter unique points from input
  const uniqueInputPoints = getUniquePoints(points);
  if (uniqueInputPoints.length < points.length) {
    console.warn(
      `Removed ${
        points.length - uniqueInputPoints.length
      } duplicate points from input polygon`,
      { originalPoints: points, uniquePoints: uniqueInputPoints }
    );
  }

  // Validate unique points
  if (uniqueInputPoints.length < 3) {
    console.warn(
      "After removing duplicates, fewer than 3 points remain; returning original points",
      {
        uniqueInputPoints,
      }
    );
    return points.slice();
  }

  // Use unique points for further processing
  const workingPoints = uniqueInputPoints;

  // Check polygon validity (area and non-collinearity)
  const computePolygonArea = (pts: Array<{ x: number; y: number }>) => {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area) / 2;
  };

  const area = computePolygonArea(workingPoints);
  const minArea = 0.0001; // Minimum area to consider polygon valid
  if (area < minArea) {
    console.warn(
      `Input polygon has insufficient area (${area}); returning original points`,
      { workingPoints }
    );
    return points.slice();
  }

  // Helper function to compute the normal of an edge
  const computeEdgeNormal = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 1e-6) {
      return { x: 0, y: 0 }; // Degenerate edge
    }
    // Rotate 90 degrees clockwise for outward normal (assuming CCW polygon)
    return { x: dy / length, y: -dx / length };
  };

  // Helper function to compute line segment intersection
  const computeIntersection = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ): { x: number; y: number } | null => {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (Math.abs(denom) < 1e-6) {
      return null; // Parallel or coincident lines
    }
    const ua =
      ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub =
      ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return {
        x: p1.x + ua * (p2.x - p1.x),
        y: p1.y + ua * (p2.y - p1.y),
      };
    }
    return null; // No intersection within segments
  };

  // Compute vertex normals by averaging adjacent edge normals
  const normals: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < workingPoints.length; i++) {
    const prev =
      workingPoints[(i - 1 + workingPoints.length) % workingPoints.length];
    const curr = workingPoints[i];
    const next = workingPoints[(i + 1) % workingPoints.length];
    const normal1 = computeEdgeNormal(prev, curr);
    const normal2 = computeEdgeNormal(curr, next);
    const avgNormal = {
      x: (normal1.x + normal2.x) / 2,
      y: (normal1.y + normal2.y) / 2,
    };
    const length = Math.sqrt(
      avgNormal.x * avgNormal.x + avgNormal.y * avgNormal.y
    );
    if (length < 1e-6) {
      console.warn("Invalid vertex normal; returning original points", {
        vertex: i,
        workingPoints,
      });
      return points.slice();
    }
    normals.push({ x: avgNormal.x / length, y: avgNormal.y / length });
  }

  // Log inputs for debugging
  console.debug("Manual offset input:", { workingPoints, offset, normals });

  // Compute initial offset points
  const initialOffsetPoints: Array<{ x: number; y: number; z: number }> =
    workingPoints.map((p, i) => ({
      x: p.x + normals[i].x * offset,
      y: p.y + normals[i].y * offset,
      z: p.z, // Temporary z, will adjust later
    }));

  // Compute intersections to form the offset polygon
  let offsetPoints: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i < workingPoints.length; i++) {
    const p1 = initialOffsetPoints[i];
    const p2 = initialOffsetPoints[(i + 1) % workingPoints.length];
    const p3 =
      initialOffsetPoints[
        (i - 1 + workingPoints.length) % workingPoints.length
      ];
    const p4 = initialOffsetPoints[i];
    const intersection = computeIntersection(p3, p4, p1, p2);
    if (intersection) {
      // Find closest original point for z
      let minDistance = Infinity;
      let closestZ = workingPoints[0].z;
      for (const origPoint of workingPoints) {
        const dx = intersection.x - origPoint.x;
        const dy = intersection.y - origPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          closestZ = origPoint.z;
        }
      }
      offsetPoints.push({ x: intersection.x, y: intersection.y, z: closestZ });
    } else {
      console.warn(
        "Failed to compute intersection for offset edge; returning original points",
        {
          edge: i,
          workingPoints,
        }
      );
      return points.slice();
    }
  }

  // Filter unique points in output
  const uniqueOffsetPoints = getUniquePoints(offsetPoints);

  // Warn if duplicates were removed
  if (uniqueOffsetPoints.length < offsetPoints.length) {
    console.warn(
      `Removed ${
        offsetPoints.length - uniqueOffsetPoints.length
      } duplicate points from the offset polygon`,
      { offsetPoints, uniqueOffsetPoints }
    );
  }

  // Validate output
  if (uniqueOffsetPoints.length < 3) {
    console.warn(
      "Offset polygon has fewer than 3 points; returning original points",
      { uniqueOffsetPoints }
    );
    return points.slice();
  }

  // Check output polygon area
  const outputArea = computePolygonArea(uniqueOffsetPoints);
  if (outputArea < minArea) {
    console.warn(
      `Output polygon has insufficient area (${outputArea}); returning original points`,
      {
        uniqueOffsetPoints,
      }
    );
    return points.slice();
  }

  return uniqueOffsetPoints;
}

export function getRectanglePointsAroundCenter(center, width, height) {
  return [
    { x: center.x - width / 2, y: center.y - height / 2, z: center.z },
    { x: center.x + width / 2, y: center.y - height / 2, z: center.z },
    { x: center.x + width / 2, y: center.y + height / 2, z: center.z },
    { x: center.x - width / 2, y: center.y + height / 2, z: center.z },
  ];
}

export function getCenters(polygons) {
  return polygons.map((polygon) => ({
    x:
      (Math.min(...polygon.points.map((p) => p.x)) +
        Math.max(...polygon.points.map((p) => p.x))) /
      2,
    y:
      (Math.min(...polygon.points.map((p) => p.y)) +
        Math.max(...polygon.points.map((p) => p.y))) /
      2,
  }));
}

export function getCenterOfPolygon(polygon) {
  return {
    x:
      (Math.min(...polygon.points.map((p) => p.x)) +
        Math.max(...polygon.points.map((p) => p.x))) /
      2,
    y:
      (Math.min(...polygon.points.map((p) => p.y)) +
        Math.max(...polygon.points.map((p) => p.y))) /
      2,
  };
}

export function convertToPointObjects(flatArray) {
  const points = [];
  for (let i = 0; i < flatArray.length; i += 2) {
    points.push({
      x: flatArray[i],
      y: flatArray[i + 1],
    });
  }
  return points;
}

export // Calculate the center of foundations to offset them to [0, 0, 0]
function getFoundationCenter(foundations) {
  const points = foundations.flatMap((f) => [
    ...(f.outerFoundationPoints || []),
    ...(f.innerFoundationPoints || []),
  ]);

  if (points.length === 0) return [0, 0, 0];

  const sum = points.reduce(
    (acc, p) => {
      acc.x += p.x / 1000; // Convert mm to meters
      acc.z += p.y / 1000; // Map plan y to Three.js z
      return acc;
    },
    { x: 0, z: 0 }
  );

  const avgX = sum.x / points.length;
  const avgZ = sum.z / points.length;

  return [avgX, 0, avgZ]; // [centerX, height=0, centerZ]
}

export function removeDuplicatePoints(points, precision = 1e-6) {
  const seen = new Set();
  return points.filter((p) => {
    const key = `${p.x.toFixed(6)}|${p.y.toFixed(6)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function extendLine(ip1, ip2, iNewLength) {
  const dx = ip2.x - ip1.x;
  const dy = ip2.y - ip1.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    // Prevent division by zero
    return [ip1, ip2];
  }

  const center = {
    x: (ip1.x + ip2.x) / 2,
    y: (ip1.y + ip2.y) / 2,
  };

  const newP1 = {
    x: center.x - iNewLength / 2,
    y: center.y + iNewLength / 2,
  };
  const newP2 = {
    x: center.x + iNewLength / 2,
    y: center.y - iNewLength / 2,
  };

  return [newP1, newP2];
}

export function divideLineIntoEqualParts(start, end, segments) {
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    const x = (1 - t) * start.x + t * end.x;
    const y = (1 - t) * start.y + t * end.y;

    points.push({ x, y });
  }

  return points;
}

export function generateSymmetricPoints(
  start: number,
  end: number,
  idealDistance: number
): number[] {
  const center = (start + end) / 2;
  const points = new Set<number>([center]);

  // Positive direction
  let pos = center + idealDistance;
  while (pos < end) {
    points.add(pos);
    pos += idealDistance;
  }
  points.add(end); // always include end

  // Negative direction
  let neg = center - idealDistance;
  while (neg > start) {
    points.add(neg);
    neg -= idealDistance;
  }
  points.add(start); // always include start

  return Array.from(points).sort((a, b) => a - b);
}

export function partitionGroupsByDimension(groups, type) {
  const result = [];
  console.log(groups);

  for (const group of groups) {
    const dimensionMap = {};
    const temp = group.basePlates;

    for (const column of temp) {
      console.log(column);
      const xs = column.points.map((p) => p.x);
      const ys = column.points.map((p) => p.y);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);

      // Create dimension key (order-agnostic)
      const [dim1, dim2] = [width.toFixed(0), height.toFixed(0)].sort(
        (a, b) => a - b
      );
      const dimensionKey = `${dim1}_${dim2}`;

      if (!dimensionMap[dimensionKey]) {
        dimensionMap[dimensionKey] = [];
      }
      dimensionMap[dimensionKey].push(column);
    }

    const subgroups = Object.values(dimensionMap);

    // Push each subgroup as its own new group with same name (or modified)
    if (subgroups.length === 1) {
      if (type === "Baseplate") {
        result.push({
          name: group.name,
          basePlates: subgroups[0],
        });
      } else {
        result.push({
          name: group.name,
          columns: subgroups[0],
        });
      }
    } else {
      let i = 1;
      for (const subgroup of subgroups) {
        if (type === "Foundation") {
          result.push({
            name: `${group.name} - ${i}`,
            foundations: subgroup,
          });
          i++;
          continue;
        }
        result.push({
          name: `${group.name} - ${i}`,
          basePlates: subgroup,
        });
        i++;
      }
    }
  }

  return result;
}
