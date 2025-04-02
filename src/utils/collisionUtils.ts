// Add this utility function to check overlap between two rectangles
// Place this in your GeometryUtils.ts file

export function doRectanglesOverlap(rect1Points: number[][], rect2Points: number[][]): boolean {
    // Convert rectangle points to bounds
    const rect1Bounds = getPointsBoundingBox(rect1Points);
    const rect2Bounds = getPointsBoundingBox(rect2Points);
    
    // Check for overlap
    return !(
      rect1Bounds.maxX < rect2Bounds.minX ||
      rect1Bounds.minX > rect2Bounds.maxX ||
      rect1Bounds.maxY < rect2Bounds.minY ||
      rect1Bounds.minY > rect2Bounds.maxY
    );
  }
  
  export function getPointsBoundingBox(points: number[][]) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    for (const point of points) {
      minX = Math.min(minX, point[0]);
      minY = Math.min(minY, point[1]);
      maxX = Math.max(maxX, point[0]);
      maxY = Math.max(maxY, point[1]);
    }
    
    return { minX, minY, maxX, maxY };
  }
  
  // Helper to add a safety margin to a rectangle's bounds
  export function expandRectangle(points: number[][], margin: number): number[][] {
    const bounds = getPointsBoundingBox(points);
    return [
      [bounds.minX - margin, bounds.minY - margin, 0],
      [bounds.maxX + margin, bounds.minY - margin, 0],
      [bounds.maxX + margin, bounds.maxY + margin, 0],
      [bounds.minX - margin, bounds.maxY + margin, 0],
    ];
  }