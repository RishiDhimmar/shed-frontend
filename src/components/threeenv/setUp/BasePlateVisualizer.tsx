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
import uiStore from "../../../stores/UIStore";
import DimensionLine from "../Helpers/DimensionLine";
// import TestComp from "./testComp";

const BasePlateVisualizer = observer(() => (
  <>
    {baseplateStore.basePlates.map((baseplate) => (
      <>
        <LineVisualizer
          key={baseplate.id}
          points={baseplate.points}
          color="#00ff00"
        />

        {uiStore.currentComponent === "baseplate" && (
          <>
            <DimensionLine
              startPoint={baseplate.points[0] as [number, number, number]}
              endPoint={baseplate.points[1] as [number, number, number]}
              length={baseplate.points[1][0] - baseplate.points[0][0]}
              lineColor="#00ff00"
              textColor="#00ff00"
              lineDirection="-y"
              textDirection="-y"
              textOffset={0.5}
              textSize={0.5}
              lineOffset={0.5}
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
