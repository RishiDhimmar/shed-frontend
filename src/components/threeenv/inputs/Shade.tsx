import { observer } from "mobx-react-lite";
import plotStore from "../../../stores/BasePlotStore";

export const Shade = observer(() => {
  return (
    <div className="bg-gradient-to-br from-green-200 to-blue-300 p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">Shade Component</h1>
      <p className="text-lg mb-2">Length: {plotStore.height} meters</p>
      <p className="text-lg mb-4">Width: {plotStore.width} meters</p>
      <p className="text-xl font-semibold">
        Configure your shade settings here.
      </p>
    </div>
  );
});
