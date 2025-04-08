import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import uiStore from "../../../stores/UIStore";
import DimensionLine from "../Helpers/DimensionLine";

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
          {console.log(baseplate.points)}
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

            <DimensionLine
              startPoint={baseplate.points[1] as [number, number, number]}
              endPoint={baseplate.points[2] as [number, number, number]}
              length={baseplate.points[2][1] - baseplate.points[1][1]}
              lineColor="#00ff00"
              textColor="#00ff00"
              lineDirection="+x"
              textDirection="+x"
              textOffset={1}
              textSize={0.5}
              lineOffset={0.5}
            />
          </>
        )}
      </>
    ))}
  </>
));

export default BasePlateVisualizer;
