// src/utils/geometry.js
import { CONFIG } from './Constants';
import { findClosestPointOnPolygon } from './Polygon';

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

export function pointToSegmentDistance(p, v, w) {
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
}

export function distanceBetPoints(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function projectPointToSegment(p, v, w) {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 < CONFIG.EPSILON) return v;

  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  return {
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y),
  };
}

export function calculateWallThickness(externalWall, internalWall) {
  if (!externalWall.length || !internalWall.length) return 0;

  let minDistance = Infinity;

  for (const extPoint of externalWall) {
    const closest = findClosestPointOnPolygon(extPoint, internalWall);
    if (closest.distance < minDistance) {
      minDistance = closest.distance;
    }
  }

  return minDistance > 0 ? minDistance : 0.75;
}

export function getWallMidpoint(externalWall, internalWall, columnEdge) {
  const extMid = getEdgeCenter(columnEdge.start, columnEdge.end);
  const closestInt = findClosestPointOnPolygon(extMid, internalWall);
  return {
    x: (extMid.x + closestInt.point.x) / 2,
    y: (extMid.y + closestInt.point.y) / 2,
  };
}

export function isNearExternalWall(columnBounds, externalWall) {
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
}