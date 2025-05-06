import React from "react";
import { Ellipse } from "react-konva";
import { fill } from "three/src/extras/TextureUtils.js";

function EllipseDrawer({ ellipses }) {
  return (
    <>
      {ellipses.map((ellipse, i) => (
        <>
          {console.log(ellipse.center.x)}
          <Ellipse
            key={`ellipse-${i}`}
            x={ellipse.center.x}
            y={ellipse.center.y}
            radiusX={1000}
            radiusY={500}
            listening={false}
          />
        </>
      ))}
    </>
  );
}

export default EllipseDrawer;
