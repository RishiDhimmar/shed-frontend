import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";

const BasePlateVisualizer = observer(() => (
  <>
    {baseplateStore.basePlates.map((baseplate) => (
      <LineVisualizer key={baseplate.id} points={baseplate.points} color="#00ff00" />
    ))}
  </>
));

export default BasePlateVisualizer;
