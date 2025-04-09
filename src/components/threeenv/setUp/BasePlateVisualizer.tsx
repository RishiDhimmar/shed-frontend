
import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import uiStore from "../../../stores/UIStore";
import DimensionLine from "../Helpers/DimensionLine";

const BasePlateVisualizer = observer(() => (
  <>
    {baseplateStore.basePlates.map((baseplate) => {
      const [p0, p1, p2] = baseplate.points;

      const horizontalLength = p1[0] - p0[0]; // Width (X)
      const verticalLength = p2[1] - p1[1];   // Height (Y)

      let horizontalLineDirection = "+y";
      let horizontalTextDirection = "+y";
      let verticalLineDirection = "+x";
      let verticalTextDirection = "+x";

      let horizontalLineOffset = 2;
      let horizontalTextOffset = 0.5;
      let verticalLineOffset = 3;
      let verticalTextOffset = 0.5;

      const subtype = baseplate.wall;

      switch (subtype) {
        case "top-left":
          horizontalLineDirection = "+y";
          horizontalTextDirection = "+y";
          verticalLineDirection = "-x";
          verticalTextDirection = "-x";
          horizontalLineOffset = 2;
          verticalLineOffset = 3;
          break;
        case "bottom-left":
          horizontalLineDirection = "-y";
          horizontalTextDirection = "-y";
          verticalLineDirection = "-x";
          verticalTextDirection = "-x";
          horizontalLineOffset = 2;
          verticalLineOffset = 3;
          break;
        case "top-right":
          horizontalLineDirection = "+y";
          horizontalTextDirection = "+y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 2;
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
          verticalLineOffset = 3;
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
          horizontalLineDirection = "+y";
          horizontalTextDirection = "+y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 2;
          verticalLineOffset = 1;
          break;
        case "bottom":
          horizontalLineDirection = "-y";
          horizontalTextDirection = "-y";
          verticalLineDirection = "+x";
          verticalTextDirection = "+x";
          horizontalLineOffset = 2;
          verticalLineOffset = 1;
          break;
        default:
          break;
      }

      return (
        <React.Fragment key={baseplate.id}>
          <LineVisualizer points={baseplate.points} color="#00ff00" />

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
                textOffset={horizontalTextOffset}
                textSize={0.5}
                lineOffset={horizontalLineOffset}
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
