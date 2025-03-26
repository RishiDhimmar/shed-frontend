import { observer } from "mobx-react-lite";
import { useState } from "react";
import plotStore from "../../../stores/BasePlotStore";

export const PlotInput = observer(() => {
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    plotStore.setWidth(width);
    plotStore.setHeight(length);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Plot Dimension Input
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="Length of plot (in meters)"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Width of plot (in meters)"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition"
        >
          Add Information
        </button>
      </form>
    </div>
  );
});
