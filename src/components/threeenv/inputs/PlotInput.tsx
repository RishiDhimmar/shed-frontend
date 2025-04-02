import { observer } from "mobx-react-lite";
import plotStore from "../../../stores/BasePlotStore";
import InputNumber from "../Helpers/InputNumber";

export const PlotInput = observer(() => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Plot Input</h1>
      <form className="space-y-4">
        <InputNumber
          label="Length:"
          value={plotStore.length}
          onChange={(newLength: number) => plotStore.setLength(newLength)}
        />
        <InputNumber
          label="Width:"
          value={plotStore.width}
          onChange={(newWidth: number) => plotStore.setWidth(newWidth)}
        />
      </form>
    </div>
  );
});
