// useCanvasState.js
import { useState } from 'react';

export default function useCanvasState() {
  const [state, setState] = useState({
    polygons: [],
    selectedKey: null,
    hoveredKey: null,
    scale: 1,
    offset: { x: 0, y: 0 },
    debugRays: [],
    showRays: false
  });

  const updateState = (newState) => setState(prev => ({ ...prev, ...newState }));
  return [state, updateState];
}