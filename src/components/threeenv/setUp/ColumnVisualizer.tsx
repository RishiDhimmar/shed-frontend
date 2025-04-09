// import { observer } from "mobx-react-lite";
// import columnStore from "../../../stores/ColumnStore";
// import { useMemo } from "react";
// import baseplateStore from "../../../stores/BasePlateStore";
// import LineVisualizer from "../Helpers/LineVisualizerProps";
// import DimensionLine from "../Helpers/DimensionLine";
// import uiStore from "../../../stores/UIStore";

// const ColumnVisualizer = observer(() => {
//   useMemo(() => {
//     columnStore.generateColumns();
//   }, [baseplateStore.basePlates]);

//   return (
//     <>
//       {columnStore.columns.map((column) => {
//         // Get the actual dimensions based on column type
//         let width = 0;
//         let length = 0;

//         if (column.wall === "corner") {
//           width = columnStore.cornerLength;
//           length = columnStore.cornerWidth;
//         } else if (column.wall === "horizontal") {
//           width = columnStore.horizontalWidth;
//           length = columnStore.horizontalLength;
//         } else if (column.wall === "vertical") {
//           width = columnStore.verticalWidth;
//           length = columnStore.verticalLength;
//         }

//         return (
//           <>
//             <LineVisualizer
//               key={column.id}
//               points={column.points}
//               color="#6363E1"
//             />
//             {uiStore.currentComponent === "column" && (
//               <>
//                 <DimensionLine
//                   startPoint={column.points[0] as [number, number, number]}
//                   endPoint={column.points[1] as [number, number, number]}
//                   length={column.wall === "vertical" ? width : length}
//                   lineColor="#6363E1"
//                   textColor="#6363E1"
//                   lineDirection="+y"
//                   textDirection="+y"
//                   textOffset={0.5}
//                   textSize={0.5}
//                   lineOffset={1}
//                 />

//                 <DimensionLine
//                   startPoint={column.points[1] as [number, number, number]}
//                   endPoint={column.points[2] as [number, number, number]}
//                   length={column.wall === "vertical" ? length : width}
//                   lineColor="#6363E1"
//                   textColor="#6363E1"
//                   lineDirection="-x"
//                   textDirection="-x"
//                   textOffset={0.5}
//                   textSize={0.5}
//                   lineOffset={0.5}
//                 />
//               </>
//             )}
//           </>
//         );
//       })}
//     </>
//   );
// });

// export default ColumnVisualizer;

import { observer } from "mobx-react-lite";
import columnStore from "../../../stores/ColumnStore";
import { useMemo } from "react";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";

const ColumnVisualizer = observer(() => {
  useMemo(() => {
    columnStore.generateColumns();
  }, [baseplateStore.basePlates]);

  return (
    <>
      {columnStore.columns.map((column) => {
        const [p0, p1, p2] = column.points;

        // Dynamically calculate lengths from points
        const horizontalLength = Math.sqrt(
          Math.pow(p1[0] - p0[0], 2) + Math.pow(p1[1] - p0[1], 2)
        );
        const verticalLength = Math.sqrt(
          Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
        );

        let horizontalLineDirection: "+x" | "-x" | "+y" | "-y" = "+y";
        let horizontalTextDirection: "+x" | "-x" | "+y" | "-y" = "+y";
        let verticalLineDirection: "+x" | "-x" | "+y" | "-y" = "+x";
        let verticalTextDirection: "+x" | "-x" | "+y" | "-y" = "+x";
        let horizontalLineOffset = 1;
        let horizontalTextOffset = 0.5;
        let verticalLineOffset = 1;
        let verticalTextOffset = 0.5;

        const wall = column.wall;

        switch (wall) {
          case "top-left":
            horizontalLineDirection = "+y";
            horizontalTextDirection = "+y";
            verticalLineDirection = "-x";
            verticalTextDirection = "-x";
            horizontalLineOffset = 1.5;
            verticalLineOffset = 3;
            break;
          case "bottom-left":
            horizontalLineDirection = "-y";
            horizontalTextDirection = "-y";
            verticalLineDirection = "-x";
            verticalTextDirection = "-x";
            horizontalLineOffset = 1.5;
            verticalLineOffset = 3;
            break;
          case "top-right":
            horizontalLineDirection = "+y";
            horizontalTextDirection = "+y";
            verticalLineDirection = "+x";
            verticalTextDirection = "+x";
            horizontalLineOffset = 1.5;
            verticalLineOffset = 3;
            break;
          case "bottom-right":
            horizontalLineDirection = "-y";
            horizontalTextDirection = "-y";
            verticalLineDirection = "+x";
            verticalTextDirection = "+x";
            horizontalLineOffset = 2;
            verticalLineOffset = 3;
            break;
          case "left":
            horizontalLineDirection = "-y";
            horizontalTextDirection = "-y";
            verticalLineDirection = "-x";
            verticalTextDirection = "-x";
            horizontalLineOffset = 1;
            verticalLineOffset = 2;
            break;
          case "right":
            horizontalLineDirection = "-y";
            horizontalTextDirection = "-y";
            verticalLineDirection = "+x";
            verticalTextDirection = "+x";
            horizontalLineOffset = 1;
            verticalLineOffset = 3;
            break;
          case "top":
            horizontalLineDirection = "+x";
            horizontalTextDirection = "+x";
            verticalLineDirection = "+y";
            verticalTextDirection = "+y";
            horizontalLineOffset = 1;
            verticalLineOffset = 2.5;
            break;
          case "bottom":
            horizontalLineDirection = "+x";
            horizontalTextDirection = "+x";
            verticalLineDirection = "-y";
            verticalTextDirection = "-y";
            horizontalLineOffset = 1;
            verticalLineOffset = 2.5;
            break;
          default:
            break;
        }

        return (
          <>
            <LineVisualizer points={column.points} color="#6363E1" />

            {uiStore.currentComponent === "column" && (
              <>
                <DimensionLine
                  startPoint={p0 as [number, number, number]}
                  endPoint={p1 as [number, number, number]}
                  length={horizontalLength}
                  lineColor="#6363E1"
                  textColor="#6363E1"
                  lineDirection={horizontalLineDirection}
                  textDirection={horizontalTextDirection}
                  textOffset={horizontalTextOffset}
                  textSize={0.5}
                  lineOffset={horizontalLineOffset}
                />

                <DimensionLine
                  startPoint={p1 as [number, number, number]}
                  endPoint={p2 as [number, number, number]}
                  length={verticalLength}
                  lineColor="#6363E1"
                  textColor="#6363E1"
                  lineDirection={verticalLineDirection}
                  textDirection={verticalTextDirection}
                  textOffset={verticalTextOffset}
                  textSize={0.5}
                  lineOffset={verticalLineOffset}
                />
              </>
            )}
          </>
        );
      })}
    </>
  );
});

export default ColumnVisualizer;
