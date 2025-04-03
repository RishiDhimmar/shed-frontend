import { observer } from "mobx-react-lite";
import basePlotStore from "../../../stores/BasePlotStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";

const BasePlotVisualizer = observer(() => (
  <>
    <LineVisualizer points={basePlotStore.points} color="gray" />
    {/* <PlotDimensions /> */}
    <DimensionLine
      startPoint={basePlotStore.points[0] as [number, number, number]}
      endPoint={basePlotStore.points[1] as [number, number, number]}
      length={basePlotStore.width}
      lineDirection="-y"
      lineOffset={5}
      textDirection="-y"
      textColor="red"
      textOffset={0.5}
      textSize={0.6}
    />
    <DimensionLine
      startPoint={basePlotStore.points[1] as [number, number, number]}
      endPoint={basePlotStore.points[2] as [number, number, number]}
      length={basePlotStore.length}
      lineDirection="+x"
      lineOffset={5}
      textDirection="+x"
      textColor="red"
      textOffset={1}
      textSize={0.6}
    />
  </>
));

export default BasePlotVisualizer;
