// src/constants.js
export const CONFIG = {
    EPSILON: 0.01,
    SCALE: 1 / 100,
    RAY_LENGTH: 1000,
    CANVAS_PADDING: 20,
    MAX_SCALE: 5,
    MIN_SCALE: 0.1,
    ZOOM_STEP: 0.1,
    EDGE_THRESHOLD: 0.5,
  };
  
  export const TEXT_HEIGHT_WORLD = 0.0025; // 2.5 mm if units are meters
  export const BALLOON_RADIUS_WORLD = 0.01; // 1 mm if units are meters
  export const OFFSET_WORLD = 0.03; // 3 mm for balloon offset if units are meters
  export const DIMENSION_OFFSET_WORLD = 0.05; // 5 mm offset for dimension lines if units are meters
  export const MIN_FONT_SIZE = 8; // Minimum font size in pixels for readability