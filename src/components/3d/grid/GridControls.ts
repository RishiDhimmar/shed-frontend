import { useControls } from "leva";

export const useGridControls = () => {
  return useControls("Grid", {
    gridSize: [10.5, 10.5],
    cellSize: { value: 1.6, min: 0, max: 10, step: 0.1 },
    cellThickness: { value: 0.5, min: 0, max: 5, step: 0.1 },
    cellColor: "#ffffff",
    sectionSize: { value: 0.5, min: 0, max: 10, step: 0.1 },
    sectionThickness: { value: 1.3, min: 0, max: 5, step: 0.1 },
    sectionColor: "#efecec",
    fadeDistance: { value: 43, min: 0, max: 100, step: 1 },
    fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
    followCamera: false,
    infiniteGrid: true,
    opacity: { value: 0.5, min: 0, max: 1, step: 0.01 },
  });
};
