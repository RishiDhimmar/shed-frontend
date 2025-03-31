import { observer } from "mobx-react-lite";
import plotStore from "../../../stores/BasePlotStore";
import InputNumber from "../Helpers/InputNumber";

export const PlotInput = observer(() => {
  return (
    <div className="bg-white p-8 rounded shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Plot Input</h1>
      <form className="space-y-4">
        <InputNumber
          label="Length:"
          value={plotStore.length}
          onChange={(newHeight: number) => plotStore.setLength(newHeight)}
        />
        <InputNumber
          label="width:"
          value={plotStore.width}
          onChange={(newHeight: number) => plotStore.setWidth(newHeight)}
        />
      </form>
    </div>
  );
});
