// import { observer } from "mobx-react-lite";
// import baseplateStore from "../../../stores/BasePlateStore";
// import LineVisualizer from "../Helpers/LineVisualizerProps";
// import DimensionLine from "../Helpers/DimensionLine";
// import uiStore from "../../../stores/UIStore";

// const BasePlateVisualizer = observer(() => (

//   <>
//     {baseplateStore.basePlates.map((baseplate) => (

//       <>
//         <LineVisualizer
//           key={baseplate.id}
//           points={baseplate.points}
//           color="#00ff00"
//         />

//         {uiStore.currentComponent === "baseplate" && (
//           <>
//             <DimensionLine
//               startPoint={baseplate.points[0] as [number, number, number]}
//               endPoint={baseplate.points[1] as [number, number, number]}
//               length={baseplate.points[1][0] - baseplate.points[0][0]}
//               lineColor="#00ff00"
//               textColor="#00ff00"
//               lineDirection="-y"
//               textDirection="-y"
//               textOffset={0.5}
//               textSize={0.5}
//               lineOffset={0.5}
//             />

//             <DimensionLine
//               startPoint={baseplate.points[1] as [number, number, number]}
//               endPoint={baseplate.points[2] as [number, number, number]}
//               length={Math.abs(baseplate.points[2][1] - baseplate.points[1][1])}
//               lineColor="#00ff00"
//               textColor="#00ff00"
//               lineDirection={baseplate.wall === "left" ? "-x" : "+x"}
//               textDirection={baseplate.wall === "left" ? "-x" : "+x"}
//               textOffset={1}
//               textSize={0.5}
//               lineOffset={3}
//             />
//           </>
//         )}
//       </>
//     ))}
//   </>
// ));

// export default BasePlateVisualizer;
import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";

const BasePlateVisualizer = observer(() => (
  <>
    {baseplateStore.basePlates.map((baseplate) => {
      const [p0, p1, p2] = baseplate.points;

      const horizontalLength = p1[0] - p0[0]; // Width (X)
      const verticalLength = p2[1] - p1[1]; // Height (Y)

      const isLeftSide = p1[0] < 0;
      const isTopSide = p0[1] > 0;

      const verticalLineDirection = isLeftSide ? "-x" : "+x";
      const verticalTextDirection = verticalLineDirection;

      const horizontalLineDirection = isTopSide ? "+y" : "-y";
      const horizontalTextDirection = horizontalLineDirection;

      return (
        <>
          <LineVisualizer
            key={baseplate.id}
            points={baseplate.points}
            color="#00ff00"
          />

          {uiStore.currentComponent === "baseplate" && (
            <>
              {/* Horizontal dimension (X-axis) */}
              <DimensionLine
                startPoint={p0 as [number, number, number]}
                endPoint={p1 as [number, number, number]}
                length={horizontalLength}
                lineColor="#00ff00"
                textColor="#00ff00"
                lineDirection={horizontalLineDirection}
                textDirection={horizontalTextDirection}
                textOffset={0.5}
                textSize={0.5}
                lineOffset={2}
              />

              {/* Vertical dimension (Y-axis) */}
              <DimensionLine
                startPoint={p1 as [number, number, number]}
                endPoint={p2 as [number, number, number]}
                length={verticalLength}
                lineColor="#00ff00"
                textColor="#00ff00"
                lineDirection={verticalLineDirection}
                textDirection={verticalTextDirection}
                textOffset={1}
                textSize={0.5}
                lineOffset={3}
              />
            </>
          )}
        </>
      );
    })}
  </>
));

export default BasePlateVisualizer;
