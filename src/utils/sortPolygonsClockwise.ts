// // import { sortPolygon } from "./PolygonUtils";

// // export const sortPolygonsClockwise = (polygons) => {
// //     const center = { x: 0, y: 0 };
// //     polygons.forEach((p) => {
// //         center.x += p.x;
// //         center.y += p.y;
// //     });
// //     center.x /= polygons.length;
// //     center.y /= polygons.length;

// //     return [...polygons].sort((a, b) => {
// //         const angleA = Math.atan2(a.y - center.y, a.x - center.x);
// //         const angleB = Math.atan2(b.y - center.y, b.x - center.x);
// //         return angleA - angleB;
// //     });
// // }


// // src/utils/sortPolygonsClockwise.js

// /**
//  * Sorts an array of polygons in clockwise order based on their centroids relative to a reference point.
//  * @param {Array<Array<{x: number, y: number}>>} polygons - Array of polygons, where each polygon is an array of points.
//  * @returns {Array<Array<{x: number, y: number}>>} - Sorted array of polygons in clockwise order.
//  */
// export function sortPolygonsClockwise(polygons) {
//     if (!polygons || !Array.isArray(polygons) || polygons.length === 0) {
//       return [];
//     }
  
//     // Step 1: Calculate centroids for each polygon
//     const centroids = polygons.map((polygon, index) => {
//       if (!polygon || polygon.length === 0) {
//         return { x: 0, y: 0, index };
//       }
  
//       let xSum = 0, ySum = 0, count = 0;
//       polygon.forEach((point) => {
//         // Handle both {x, y} and [x, y, z] formats
//         const x = Array.isArray(point) ? point[0] : point.x;
//         const y = Array.isArray(point) ? point[1] : point.y;
//         xSum += x;
//         ySum += y;
//         count += 1;
//       });
  
//       return {
//         x: count > 0 ? xSum / count : 0,
//         y: count > 0 ? ySum / count : 0,
//         index,
//       };
//     });
  
//     // Step 2: Calculate the reference point (centroid of all centroids)
//     let refX = 0, refY = 0, validCentroids = 0;
//     centroids.forEach((centroid) => {
//       if (centroid.x !== 0 || centroid.y !== 0) {
//         refX += centroid.x;
//         refY += centroid.y;
//         validCentroids += 1;
//       }
//     });
//     refX = validCentroids > 0 ? refX / validCentroids : 0;
//     refY = validCentroids > 0 ? refY / validCentroids : 0;
  
//     // Step 3: Compute angles and sort polygons
//     const sortedPolygons = centroids
//       .map((centroid) => {
//         // Calculate angle relative to reference point using atan2
//         const dx = centroid.x - refX;
//         const dy = centroid.y - refY;
//         // atan2 returns angles in [-π, π]; adjust for clockwise sorting
//         let angle = Math.atan2(dy, dx);
//         // Convert to [0, 2π] and reverse for clockwise (smaller angles are more clockwise)
//         angle = angle < 0 ? angle + 2 * Math.PI : angle;
//         return { angle, index: centroid.index };
//       })
//       .sort((a, b) => b.angle - a.angle) // Sort in descending order for clockwise
//       .map(({ index }) => polygons[index]);
  
//     return sortedPolygons;
//   }



// src/utils/sortPolygonsClockwise.js
import { isNearExternalWall } from '../components/canvas2d/Geometry';
import { getBounds } from '../components/canvas2d/Polygon';

/**
 * Sorts an array of polygons in clockwise order, starting with the topmost-left polygon.
 * External polygons (near the external wall) are sorted first, followed by internal polygons.
 * @param {Array<Array<{x: number, y: number} | [number, number, number]>>} polygons - Array of polygons, where each polygon is an array of points.
 * @param {Array<{x: number, y: number}>} externalWall - The external wall points for proximity check.
 * @returns {Array<Array<{x: number, y: number} | [number, number, number]>>} - Sorted array of polygons in clockwise order.
 */
export function sortPolygonsClockwise(polygons, externalWall = []) {
  if (!polygons || !Array.isArray(polygons) || polygons.length === 0) {
    console.log("sortPolygonsClockwise: Empty or invalid input, returning empty array");
    return [];
  }

  if (!externalWall || externalWall.length === 0) {
    console.warn("sortPolygonsClockwise: No external wall provided, treating all polygons as internal");
  }

  // Step 1: Calculate centroids and bounds for each polygon
  const polygonData = polygons.map((polygon, index) => {
    if (!polygon || polygon.length === 0) {
      console.warn(`sortPolygonsClockwise: Polygon at index ${index} is empty`);
      return { centroid: { x: 0, y: 0 }, bounds: null, index };
    }

    let xSum = 0, ySum = 0, count = 0;
    polygon.forEach((point) => {
      const x = Array.isArray(point) ? point[0] : point.x;
      const y = Array.isArray(point) ? point[1] : point.y;
      xSum += x;
      ySum += y;
      count += 1;
    });

    const centroid = {
      x: count > 0 ? xSum / count : 0,
      y: count > 0 ? ySum / count : 0,
    };

    // Calculate bounds for isNearExternalWall
    const points = polygon.map(p => ({
      x: Array.isArray(p) ? p[0] : p.x,
      y: Array.isArray(p) ? p[1] : p.y,
    }));
    const bounds = getBounds(points);

    return { centroid, bounds, index };
  });

  console.log("Centroids:", polygonData.map(d => ({
    index: d.index,
    x: d.centroid.x,
    y: d.centroid.y,
  })));

  // Step 2: Find the topmost-left polygon
  let topmostLeft = polygonData[0];
  polygonData.forEach((data) => {
    if (!data.centroid) return;
    if (
      data.centroid.y < topmostLeft.centroid.y ||
      (data.centroid.y === topmostLeft.centroid.y && data.centroid.x < topmostLeft.centroid.x)
    ) {
      topmostLeft = data;
    }
  });

  console.log("Topmost-Left Polygon:", {
    index: topmostLeft.index,
    centroid: topmostLeft.centroid,
  });

  // Step 3: Classify polygons as external or internal
  const externalPolygons = [];
  const internalPolygons = [];

  polygonData.forEach((data) => {
    if (!data.bounds) return;
    const isExternal = externalWall.length > 0 && isNearExternalWall(data.bounds, externalWall);
    (isExternal ? externalPolygons : internalPolygons).push(data);
  });

  console.log("External Polygons (indices):", externalPolygons.map(d => d.index));
  console.log("Internal Polygons (indices):", internalPolygons.map(d => d.index));

  // Step 4: Calculate the reference point (centroid of all centroids)
  let refX = 0, refY = 0, validCentroids = 0;
  polygonData.forEach((data) => {
    if (data.centroid && (data.centroid.x !== 0 || data.centroid.y !== 0)) {
      refX += data.centroid.x;
      refY += data.centroid.y;
      validCentroids += 1;
    }
  });
  refX = validCentroids > 0 ? refX / validCentroids : 0;
  refY = validCentroids > 0 ? refY / validCentroids : 0;
  console.log(`Reference Point: (${refX}, ${refY})`);

  // Step 5: Sort polygons clockwise within each group
  const sortGroup = (group) => {
    return group
      .map((data) => {
        const dx = data.centroid.x - refX;
        const dy = data.centroid.y - refY;
        // atan2 returns angles in [-π, π], counterclockwise from positive x-axis
        let angle = Math.atan2(dy, dx);
        // Convert to [0, 2π]
        angle = angle >= 0 ? angle : angle + 2 * Math.PI;
        // Invert for clockwise order (smaller angles are more clockwise)
        const clockwiseAngle = 2 * Math.PI - angle;
        return { ...data, angle: clockwiseAngle };
      })
      .sort((a, b) => {
        // Prioritize topmost-left polygon
        if (a.index === topmostLeft.index) return -1;
        if (b.index === topmostLeft.index) return 1;
        return a.angle - b.angle; // Ascending for clockwise
      })
      .map((data) => data.index);
  };

  const sortedExternalIndices = sortGroup(externalPolygons);
  const sortedInternalIndices = sortGroup(internalPolygons);

  // Step 6: Combine sorted indices (external first, then internal)
  const sortedIndices = [...sortedExternalIndices, ...sortedInternalIndices];
  const sortedPolygons = sortedIndices.map((index) => polygons[index]);

  // Log angles for verification
  console.log("Sorted Order (indices):", sortedIndices);
  console.log("Angles (clockwise):", polygonData.map((data, i) => {
    const dx = data.centroid.x - refX;
    const dy = data.centroid.y - refY;
    let angle = Math.atan2(dy, dx);
    angle = angle >= 0 ? angle : angle + 2 * Math.PI;
    const clockwiseAngle = 2 * Math.PI - angle;
    return {
      index: i,
      angle: clockwiseAngle,
      degrees: (clockwiseAngle * 180 / Math.PI).toFixed(2),
      isTopmostLeft: i === topmostLeft.index,
    };
  }));

  return sortedPolygons;
}