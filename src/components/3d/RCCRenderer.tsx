import React, { useMemo } from "react";
import foundationStore from "../../stores/FoundationStore";
import BoxRenderer from "./Box";
import { color } from "three/tsl";
import { Shed3DConfig } from "../../Constants";

const scale = 1;

function RCCRenderer({ bottomPoints }) {
  const instances = useMemo(() => {
    const foundations = foundationStore.foundations;

    return foundations
      .map(() => {
        if (!bottomPoints || bottomPoints.length !== 4) return null;

        const xs = bottomPoints.map((p) => p.x);
        const ys = bottomPoints.map((p) => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = (maxX - minX) * scale;
        const length = (maxY - minY) * scale;
        const centerX = ((minX + maxX) / 2) * scale;
        const centerZ = ((minY + maxY) / 2) * scale;

        return {
          width,
          length,
          height: Shed3DConfig.heights.RCC,
          position: [centerX, Shed3DConfig.heights.RCC / 2, centerZ],
          color: "magenta",
        };
      })
      .filter(Boolean);
  }, [foundationStore.foundations, bottomPoints]);

  return <BoxRenderer instances={instances} opacity={0.02}/>;
}

export default RCCRenderer;
