// src/utils/polygon.js
import { CONFIG } from "./constants";
import {
  getEdgeCenter,
  getEdgeNormal,
  distanceBetPoints,
  projectPointToSegment,
} from "./geometry";
import { doLinesIntersect } from "../../utils/PolygonUtils";

export function traceInnerPolygonsWithRays(startPoly, otherPolys) {
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
}

export function findIntersectingPolygons(rays) {
  const uniquePolygons = new Set();

  for (const ray of rays) {
    if (ray.hitPolygon) {
      uniquePolygons.add(ray.hitPolygon);
    }
  }

  return Array.from(uniquePolygons).filter(Boolean);
}

export function traceAllPolygonsWithRays(startPoly, otherPolys) {
  const allRays = [];
  const allIntersectingPolygons = new Set();
  const processedPolygons = new Set();
  const queue = [{ poly: startPoly, depth: 0 }];
  const DIMENSION_TOLERANCE = 40;

  const getPolygonKey = (poly) => {
    console.log(poly);
    return;
    poly.map((p) => `${p.x.toFixed(4)}:${p.y.toFixed(4)}`).join("-");
  };

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
}

export function getBounds(polygon) {
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
}

// export function findClosestPointOnPolygon(point, polygon) {
//   let closestPoint = null;
//   let minDistance = Infinity;

//   for (let i = 0; i < polygon.length; i++) {
//     const v = polygon[i];
//     const w = polygon[(i + 1) % polygon.length];
//     const projection = projectPointToSegment(point, v, w);
//     const distance = distanceBetPoints(point, projection);

//     if (distance < minDistance) {
//       minDistance = distance;
//       closestPoint = projection;
//     }
//   }

//   return { point: closestPoint, distance: minDistance };
// }

export function filterPolygonsByDimension(
  polygons,
  referencePolygon,
  tolerance
) {
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
}

/**
 * Determines if polygon B is completely inside polygon A
 * @param {Array} polyA - Array of points {x, y} defining the outer polygon
 * @param {Array} polyB - Array of points {x, y} defining the potentially inner polygon
 * @returns {boolean} True if polyB is completely inside polyA
 */
export function isPolygonInsidePolygon(polyA, polyB) {
  // Quick check: if any point of B is outside A, B is not inside A
  for (const pointB of polyB) {
    if (!isPointInPolygon(pointB, polyA)) {
      return false;
    }
  }

  // Check if any edges intersect - if they do, B is not fully inside A
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i];
    const a2 = polyA[(i + 1) % polyA.length];

    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j];
      const b2 = polyB[(j + 1) % polyB.length];

      if (doLinesIntersect(a1, a2, b1, b2)) {
        return false; // Edges intersect, B is not inside A
      }
    }
  }

  return true; // All points of B are inside A and no edges intersect
}

/**
 * Determines if a point is inside a polygon using the ray casting algorithm
 * @param {Object} point - The point {x, y} to check
 * @param {Array} polygon - Array of points {x, y} defining the polygon
 * @returns {boolean} True if the point is inside the polygon
 */
export function isPointInPolygon(point, polygon) {
  // Implementation of ray casting algorithm
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Checks if two line segments intersect
 * @param {Object} p1 - First point of first line segment {x, y}
 * @param {Object} p2 - Second point of first line segment {x, y}
 * @param {Object} p3 - First point of second line segment {x, y}
 * @param {Object} p4 - Second point of second line segment {x, y}
 * @returns {boolean} True if the line segments intersect
 */
export function doLinesIntersect(p1, p2, p3, p4, epsilon = 1e-9) {
  // Calculate direction vectors
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;

  // Calculate the determinant
  const det = d1x * d2y - d1y * d2x;

  // Lines are parallel if determinant is close to 0
  if (Math.abs(det) < epsilon) {
    return false;
  }

  // Calculate parameters for the point of intersection
  const dx = p3.x - p1.x;
  const dy = p3.y - p1.y;

  const t = (dx * d2y - dy * d2x) / det;
  const u = (dx * d1y - dy * d1x) / det;

  // Check if the intersection point is on both line segments
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/**
 * Alternative approach: check if polygon B is inside polygon A using winding number method
 * This can be more robust in certain edge cases
 * @param {Array} polyA - Array of points {x, y} defining the outer polygon
 * @param {Array} polyB - Array of points {x, y} defining the potentially inner polygon
 * @returns {boolean} True if polyB is completely inside polyA
 */
export function isPolygonInsidePolygonWinding(polyA, polyB) {
  // Check if all points of B are inside A
  for (const pointB of polyB) {
    if (!isPointInPolygonWinding(pointB, polyA)) {
      return false;
    }
  }

  // Check if any edges intersect
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i];
    const a2 = polyA[(i + 1) % polyA.length];

    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j];
      const b2 = polyB[(j + 1) % polyB.length];

      if (doLinesIntersect(a1, a2, b1, b2)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Determines if a point is inside a polygon using the winding number algorithm
 * More robust than ray casting in some edge cases
 * @param {Object} point - The point {x, y} to check
 * @param {Array} polygon - Array of points {x, y} defining the polygon
 * @returns {boolean} True if the point is inside the polygon
 */
export function isPointInPolygonWinding(point, polygon) {
  let wn = 0; // Winding number

  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];

    if (current.y <= point.y) {
      if (next.y > point.y && isLeft(current, next, point) > 0) {
        wn++;
      }
    } else {
      if (next.y <= point.y && isLeft(current, next, point) < 0) {
        wn--;
      }
    }
  }

  return wn !== 0;
}

/**
 * Helper function for winding number algorithm
 * Tests if point is left of the line from p1 to p2
 */
function isLeft(p1, p2, point) {
  return (p2.x - p1.x) * (point.y - p1.y) - (point.x - p1.x) * (p2.y - p1.y);
}
/**
 * Finds the closest polygon to a point that is smaller than a reference polygon.
 * If multiple polygons are at similar distances, selects the largest among them.
 * 
 * @param {Object} point - Point {x, y} to find closest polygon to
 * @param {Array} polygons - Array of polygons, each an array of points {x, y}
 * @param {Array} referencePolygon - The polygon to compare sizes against
 * @param {Object} options - Optional parameters
 * @param {number} options.distanceTolerance - Distance difference tolerance to consider polygons as equally distant (default: 5)
 * @param {number} options.areaTolerance - Tolerance for area comparison to consider polygons as same size (default: 0)
 * @returns {Object} Result containing closest smaller polygon and distance
 */
export function findClosestSmallerPolygon(point, polygons, referencePolygon, options = {}) {
  if (!polygons || polygons.length === 0 || !referencePolygon) {
    return { polygon: null, distance: Infinity };
  }

  const { distanceTolerance = 10000000000, areaTolerance = 10000000000 } = options;
  const referenceArea = calculatePolygonArea(referencePolygon);
  
  // Filter polygons smaller than the reference polygon
  const smallerPolygons = polygons.filter(polygon => {
    const area = calculatePolygonArea(polygon);
    return area < referenceArea - areaTolerance;
  });
  
  if (smallerPolygons.length === 0) {
    return { polygon: null, distance: Infinity };
  }
  
  // Calculate distance and area for each smaller polygon
  const polygonData = smallerPolygons.map(polygon => {
    const closestPoint = findClosestPointOnPolygon(point, polygon);
    const area = calculatePolygonArea(polygon);
    
    return {
      polygon,
      distance: closestPoint.distance,
      area
    };
  });
  
  // Sort by distance (ascending)
  polygonData.sort((a, b) => a.distance - b.distance);
  
  // Get the closest distance
  const minDistance = polygonData[0].distance;
  
  // Filter polygons that are within tolerance of the closest distance
  const closePolygons = polygonData.filter(data => 
    data.distance <= minDistance + distanceTolerance
  );
  
  // If only one polygon is close, return it
  if (closePolygons.length === 1) {
    return {
      polygon: closePolygons[0].polygon,
      distance: closePolygons[0].distance
    };
  }
  
  // If multiple polygons are close, find the largest one
  closePolygons.sort((a, b) => b.area - a.area); // Sort by area (descending)
  
  return {
    polygon: closePolygons[0].polygon,
    distance: closePolygons[0].distance
  };
}

/**
 * Finds the closest point on a polygon to a given point
 * @param {Object} point - Point {x, y} to find closest point to
 * @param {Array} polygon - Array of points {x, y} defining the polygon
 * @returns {Object} Result containing closest point and distance
 */
export function findClosestPointOnPolygon(point, polygon) {
  if (!polygon || polygon.length < 2) {
    return { point: null, distance: Infinity };
  }

  let closestPoint = null;
  let minDistance = Infinity;

  // Check each edge of the polygon
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
}

/**
 * Projects a point onto a line segment
 * @param {Object} p - Point {x, y} to project
 * @param {Object} v - First endpoint {x, y} of line segment
 * @param {Object} w - Second endpoint {x, y} of line segment
 * @returns {Object} Projected point {x, y}
 */
export function projectPointToSegment(p, v, w) {
  const l2 = distanceBetPoints(v, w) ** 2;
  
  // If segment is a point, return it
  if (l2 === 0) return v;
  
  // Calculate projection parameter
  const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  
  // Clamp to segment
  const clampedT = Math.max(0, Math.min(1, t));
  
  // Calculate projection point
  return {
    x: v.x + clampedT * (w.x - v.x),
    y: v.y + clampedT * (w.y - v.y)
  };
}

/**
 * Calculates distance between two points
 * @param {Object} p1 - First point {x, y}
 * @param {Object} p2 - Second point {x, y}
 * @returns {number} Distance between points
 */
export function distanceBetPoints(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Calculates the area of a polygon using the Shoelace formula
 * @param {Array} polygon - Array of points {x, y} defining the polygon
 * @returns {number} Area of the polygon
 */
export function calculatePolygonArea(polygon) {
  if (!polygon || polygon.length < 3) return 0;
  
  let area = 0;
  
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  
  return Math.abs(area / 2);
}

/**
 * Finds all polygons smaller than a reference polygon
 * @param {Array} polygons - Array of polygons to check
 * @param {Array} referencePolygon - The polygon to compare sizes against
 * @param {number} areaTolerance - Tolerance for area comparison (default: 0)
 * @returns {Array} Array of polygons smaller than the reference polygon
 */
export function findSmallerPolygons(polygons, referencePolygon, areaTolerance = 0) {
  if (!polygons || polygons.length === 0 || !referencePolygon) {
    return [];
  }
  
  const referenceArea = calculatePolygonArea(referencePolygon);
  
  return polygons.filter(polygon => {
    const area = calculatePolygonArea(polygon);
    return area < referenceArea - areaTolerance;
  });
}

/**
 * Enhanced version that provides more detailed results including size comparison data
 * @param {Object} point - Point {x, y} to find closest polygon to
 * @param {Array} polygons - Array of polygons, each an array of points {x, y}
 * @param {Array} referencePolygon - The polygon to compare sizes against
 * @param {Object} options - Optional parameters
 * @returns {Object} Detailed result with polygon, distance, areas, and size ratio
 */
export function findClosestSmallerPolygonDetailed(point, polygons, referencePolygon, options = {}) {
  const result = findClosestSmallerPolygon(point, polygons, referencePolygon, options);
  
  if (result.polygon) {
    const polygonArea = calculatePolygonArea(result.polygon);
    const referenceArea = calculatePolygonArea(referencePolygon);
    const sizeRatio = polygonArea / referenceArea;
    
    return {
      ...result,
      polygonArea,
      referenceArea,
      sizeRatio
    };
  }
  
  return result;
}