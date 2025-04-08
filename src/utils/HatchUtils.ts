import * as THREE from "three";

// Simple point-in-polygon (ray casting) algorithm
function pointInPolygon(point: THREE.Vector2, vs: THREE.Vector2[]): boolean {
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x,
      yi = vs[i].y;
    const xj = vs[j].x,
      yj = vs[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Generate diagonal hatch lines inside a polygon using 2D points
 */
export function generateHatchLines(
  polygon: number[][],
  spacing: number = 0.4
): THREE.LineSegments {
  const lines: THREE.Vector3[] = [];

  const xValues = polygon.map(([x]) => x);
  const yValues = polygon.map(([, y]) => y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const width = maxX - minX;
  const height = maxY - minY;
  const length = Math.sqrt(width ** 2 + height ** 2);

  const angle = Math.PI / 4; // 45 degrees

  const polygonVecs = polygon.map(([x, y]) => new THREE.Vector2(x, y));

  for (let offset = -length; offset < length * 2; offset += spacing) {
    const startX = minX + offset;
    const startY = minY;

    const endX = startX - length * Math.sin(angle);
    const endY = startY + length * Math.cos(angle);

    const start = new THREE.Vector2(startX, startY);
    const end = new THREE.Vector2(endX, endY);

    if (
      pointInPolygon(start, polygonVecs) &&
      pointInPolygon(end, polygonVecs)
    ) {
      lines.push(new THREE.Vector3(start.x, start.y, 0.05));
      lines.push(new THREE.Vector3(end.x, end.y, 0.05));
    }
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(lines);
  const material = new THREE.LineBasicMaterial({ color: 0x888888 });

  return new THREE.LineSegments(geometry, material);
}
