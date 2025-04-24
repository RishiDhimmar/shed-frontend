export function pointToSegmentDistance(p, v, w) {
    const l2 = (w.x - v.x) * (w.x - v.x) + (w.y - v.y) * (w.y - v.y);
    if (l2 === 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
    
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
  }
  
  export function isMouseOverPolygon(mousePos, polygon, worldToScreen) {
    const THRESHOLD = 5;
    for (let i = 0; i < polygon.length; i++) {
      const p1 = worldToScreen(polygon[i]);
      const p2 = worldToScreen(polygon[(i + 1) % polygon.length]);
      const distance = pointToSegmentDistance(mousePos, p1, p2);
      if (distance < THRESHOLD) return true;
    }
    return false;
  }
  
  export function calculateInitialViewport(polygons, canvasSize) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    polygons.forEach(polygon => {
      polygon.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });
  
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 20;
  
    const scaleX = (canvasSize.width - padding * 2) / width;
    const scaleY = (canvasSize.height - padding * 2) / height;
    const newScale = Math.min(scaleX, scaleY, 5);
  
    return {
      scale: newScale,
      offset: {
        x: canvasSize.width / 2 - (minX + width / 2) * newScale,
        y: canvasSize.height / 2 - (minY + height / 2) * newScale
      }
    };
  }