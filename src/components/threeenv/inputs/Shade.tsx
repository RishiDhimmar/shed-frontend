import { observer } from "mobx-react-lite";

import plotStore from "../../../stores/BasePlotStore";

export const Shade = observer(() => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Shade Input</h1>
      <form className="space-y-4">
        <input
          type="number"
          placeholder="Length of shade (in meters)"
          value={plotStore.height}
          onChange={(e) => plotStore.setHeight(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Width of shade (in meters)"
          value={plotStore.width}
          onChange={(e) => plotStore.setWidth(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Thickness of shade"
          value={plotStore.width}
          onChange={(e) => plotStore.setWidth(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </form>
    </div>
  );
});
