// import { observer } from "mobx-react-lite";
// import baseplateStore from "../../../stores/BasePlateStore";
// import LineVisualizer from "../Helpers/LineVisualizerProps";
// import uiStore from "../../../stores/UIStore";
// import DimensionLine from "../Helpers/DimensionLine";
// import React from "react";

// const BasePlateVisualizer = observer(() => (
//   <>
//     {baseplateStore.basePlates.map((baseplate) => {
//       const [p0, p1, p2] = baseplate.points;

//       const horizontalLength = p1[0] - p0[0]; // Width (X)
//       const verticalLength = p2[1] - p1[1]; // Height (Y)

//       let horizontalLineDirection: "+x" | "-x" | "+y" | "-y" = "+y";
//       let horizontalTextDirection: "+x" | "-x" | "+y" | "-y" = "+y";
//       let verticalLineDirection: "+x" | "-x" | "+y" | "-y" = "+x";
//       let verticalTextDirection: "+x" | "-x" | "+y" | "-y" = "+x";

//       let horizontalLineOffset = 2;
//       let horizontalTextOffset = 0.5;
//       let verticalLineOffset = 3;
//       let verticalTextOffset = 0.5;

//       const subtype = baseplate.wall;

//       switch (subtype) {
//         case "top-left":
//           horizontalLineDirection = "+y";
//           horizontalTextDirection = "+y";
//           verticalLineDirection = "-x";
//           verticalTextDirection = "-x";
//           horizontalLineOffset = 2;
//           verticalLineOffset = 3;
//           break;
//         case "bottom-left":
//           horizontalLineDirection = "-y";
//           horizontalTextDirection = "-y";
//           verticalLineDirection = "-x";
//           verticalTextDirection = "-x";
//           horizontalLineOffset = 2;
//           verticalLineOffset = 3;
//           break;
//         case "top-right":
//           horizontalLineDirection = "+y";
//           horizontalTextDirection = "+y";
//           verticalLineDirection = "+x";
//           verticalTextDirection = "+x";
//           horizontalLineOffset = 2;
//           verticalLineOffset = 3;
//           break;
//         case "bottom-right":
//           horizontalLineDirection = "-y";
//           horizontalTextDirection = "-y";
//           verticalLineDirection = "+x";
//           verticalTextDirection = "+x";
//           horizontalLineOffset = 2;
//           verticalLineOffset = 3;
//           break;
//         case "left":
//           horizontalLineDirection = "-y";
//           horizontalTextDirection = "-y";
//           verticalLineDirection = "-x";
//           verticalTextDirection = "-x";
//           horizontalLineOffset = 1;
//           verticalLineOffset = 3;
//           break;
//         case "right":
//           horizontalLineDirection = "-y";
//           horizontalTextDirection = "-y";
//           verticalLineDirection = "+x";
//           verticalTextDirection = "+x";
//           horizontalLineOffset = 1;
//           verticalLineOffset = 3;
//           break;
//         case "top":
//           horizontalLineDirection = "+y";
//           horizontalTextDirection = "+y";
//           verticalLineDirection = "+x";
//           verticalTextDirection = "+x";
//           horizontalLineOffset = 2;
//           verticalLineOffset = 1;
//           break;
//         case "bottom":
//           horizontalLineDirection = "-y";
//           horizontalTextDirection = "-y";
//           verticalLineDirection = "+x";
//           verticalTextDirection = "+x";
//           horizontalLineOffset = 2;
//           verticalLineOffset = 1;
//           break;
//         default:
//           break;
//       }

//       return (
//         <React.Fragment key={baseplate.id}>
//           <LineVisualizer points={baseplate.points} color="#00ff00" />

//           {uiStore.currentComponent === "baseplate" && (
//             <>
//               {/* Horizontal dimension (X-axis) */}
//               <DimensionLine
//                 startPoint={p0 as [number, number, number]}
//                 endPoint={p1 as [number, number, number]}
//                 length={horizontalLength}
//                 lineColor="#00ff00"
//                 textColor="#00ff00"
//                 lineDirection={horizontalLineDirection}
//                 textDirection={horizontalTextDirection}
//                 textOffset={horizontalTextOffset}
//                 textSize={0.5}
//                 lineOffset={horizontalLineOffset}
//               />

//               {/* Vertical dimension (Y-axis) */}
//               <DimensionLine
//                 startPoint={p1 as [number, number, number]}
//                 endPoint={p2 as [number, number, number]}
//                 length={verticalLength}
//                 lineColor="#00ff00"
//                 textColor="#00ff00"
//                 lineDirection={verticalLineDirection}
//                 textDirection={verticalTextDirection}
//                 textOffset={verticalTextOffset}
//                 textSize={0.5}
//                 lineOffset={verticalLineOffset}
//               />
//             </>
//           )}
//         </React.Fragment>
//       );
//     })}
//   </>
// ));

// export default BasePlateVisualizer;

import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import uiStore from "../../../stores/UIStore";
import DimensionLine from "../Helpers/DimensionLine";
import React from "react";

const BasePlateVisualizer = observer(() => (
  <>
    {baseplateStore.basePlates.map((baseplate) => {
      const [p0, p1, p2, p3] = baseplate.points;

      if (!p0 || !p1 || !p2 || !p3) return null;

      const horizontalLength = p2[0] - p3[0]; // Width (X)
      const verticalLength = p2[1] - p1[1];   // Height (Y)

      // Default values
      let horizontalLineDirection: "+x" | "-x" | "+y" | "-y" = "+y";
      let horizontalTextDirection: "+x" | "-x" | "+y" | "-y" = "+y";
      let verticalLineDirection: "+x" | "-x" | "+y" | "-y" = "+x";
      let verticalTextDirection: "+x" | "-x" | "+y" | "-y" = "+x";
      let horizontalLineOffset = 2;
      let horizontalTextOffset = 0.5;
      let verticalLineOffset = 3;

      let verticalTextOffset = 0.5;

      // Points to use for dimension lines
      let horizontalStartPoint, horizontalEndPoint;
      let verticalStartPoint, verticalEndPoint;

      const subtype = baseplate.wall;

      // Configure dimension lines based on wall position
      switch (subtype) {
        case "top-left":
          // Top-left corner
          horizontalLineDirection = "+y";
          horizontalTextDirection = "+y";
          verticalLineDirection = "-x";
          verticalTextDirection = "-x";
          horizontalLineOffset = 2;
          verticalLineOffset = 3;

          // Horizontal dimension on the top side
          horizontalStartPoint = p0;
          horizontalEndPoint = p1;

          // Vertical dimension on the left side
          verticalStartPoint = p0;
          verticalEndPoint = p3;
          break;

        case "bottom-left":
          // Bottom-left corner
          horizontalLineDirection = "-y";
          horizontalTextDirection = "-y";
          verticalLineDirection = "-x";
          verticalTextDirection = "-x";
          horizontalLineOffset = 2;
          verticalLineOffset = 3;

          // Horizontal dimension on the bottom side
          horizontalStartPoint = p3;
          horizontalEndPoint = p2;

          // Vertical dimension on the left side
          verticalStartPoint = p0;
          verticalEndPoint = p3;
          break;

        case "top-right":
          // Top-right corner
          horizontalLineDirection = "+y";
          horizontalTextDirection = "+y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 2;
          verticalLineOffset = 3;

          // Horizontal dimension on the top side
          horizontalStartPoint = p0;
          horizontalEndPoint = p1;

          // Vertical dimension on the right side
          verticalStartPoint = p1;
          verticalEndPoint = p2;
          break;

        case "bottom-right":
          // Bottom-right corner
          horizontalLineDirection = "-y";
          horizontalTextDirection = "-y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 2;
          verticalLineOffset = 3;

          // Horizontal dimension on the bottom side
          horizontalStartPoint = p3;
          horizontalEndPoint = p2;

          // Vertical dimension on the right side
          verticalStartPoint = p1;
          verticalEndPoint = p2;
          break;

        case "left":
          // Left wall
          horizontalLineDirection = "-y";
          horizontalTextDirection = "-y";
          verticalLineDirection = "-x";
          verticalTextDirection = "-x";
          horizontalLineOffset = 1;
          verticalLineOffset = 3;

          // For left wall - horizontal at bottom, vertical at left
          horizontalStartPoint = p3;
          horizontalEndPoint = p2;
          verticalStartPoint = p0;
          verticalEndPoint = p3;
          break;

        case "right":
          // Right wall
          horizontalLineDirection = "-y";
          horizontalTextDirection = "-y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 1;
          verticalLineOffset = 3;

          // For right wall - horizontal at bottom, vertical at right
          horizontalStartPoint = p3;
          horizontalEndPoint = p2;
          verticalStartPoint = p1;
          verticalEndPoint = p2;
          break;

        case "top":
          // Top wall
          horizontalLineDirection = "+y";
          horizontalTextDirection = "+y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 2;
          verticalLineOffset = 1;

          // For top wall - horizontal at top, vertical at right
          horizontalStartPoint = p0;
          horizontalEndPoint = p1;
          verticalStartPoint = p1;
          verticalEndPoint = p2;
          break;

        case "bottom":
          // Bottom wall
          horizontalLineDirection = "-y";
          horizontalTextDirection = "-y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 2;
          verticalLineOffset = 1;

          // For bottom wall - horizontal at bottom, vertical at right
          horizontalStartPoint = p3;
          horizontalEndPoint = p2;
          verticalStartPoint = p1;
          verticalEndPoint = p2;
          break;

        default:
          // Default fallback if wall type isn't recognized
          horizontalStartPoint = p0;
          horizontalEndPoint = p1;
          verticalStartPoint = p1;
          verticalEndPoint = p2;
          break;
      }

      // If any point is undefined (in case baseplate.points doesn't have p3)
      // fallback to original points
      if (
        !horizontalStartPoint ||
        !horizontalEndPoint ||
        !verticalStartPoint ||
        !verticalEndPoint
      ) {
        horizontalStartPoint = p0;
        horizontalEndPoint = p1;
        verticalStartPoint = p1;
        verticalEndPoint = p2;
      }

      return (
        <React.Fragment key={baseplate.id}>
          <LineVisualizer points={baseplate.points} color="#00ff00" />

          {uiStore.currentComponent === "baseplate" && (
            <>
              {/* Horizontal dimension (X-axis) */}
              <DimensionLine
                startPoint={p2 as [number, number, number]}
                endPoint={p3 as [number, number, number]}
                length={horizontalLength}
                lineColor="#00ff00"
                textColor="#00ff00"
                lineDirection={
                  horizontalLineDirection as "+x" | "-x" | "+y" | "-y"
                }
                textDirection={
                  horizontalTextDirection as "+x" | "-x" | "+y" | "-y"
                }
                textOffset={horizontalTextOffset}
                textSize={0.5}
                lineOffset={horizontalLineOffset}
              />

              {/* Vertical dimension (Y-axis) */}
              <DimensionLine
                startPoint={verticalStartPoint as [number, number, number]}
                endPoint={verticalEndPoint as [number, number, number]}
                length={verticalLength}
                lineColor="#00ff00"
                textColor="#00ff00"
                lineDirection={verticalLineDirection}
                textDirection={verticalTextDirection}
                textOffset={verticalTextOffset}
                textSize={0.5}
                lineOffset={verticalLineOffset}
              />
            </>
          )}
        </React.Fragment>
      );
    })}
  </>
));

export default BasePlateVisualizer;
