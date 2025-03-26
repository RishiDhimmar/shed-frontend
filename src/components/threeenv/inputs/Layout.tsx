import { observer } from "mobx-react-lite";
import { useState } from "react";
import { PlotInput } from "./PlotInput";
import { Shade } from "./Shade";

export const Layout = observer(() => {
  const [currentComponent, setCurrentComponent] = useState("plot");

  return (
    <div className="flex w-[100px] z-10">
      <div className="w-20 bg-gray-800 text-white flex flex-col items-center p-4">
        <button
          onClick={() => setCurrentComponent("plot")}
          className="mb-4 hover:text-blue-300"
        >
          Plot
        </button>
        <button
          onClick={() => setCurrentComponent("shade")}
          className="hover:text-green-300"
        >
          Shade
        </button>
      </div>
      <div className="flex-1 p-8 w-[400px]">
        {currentComponent === "plot" ? <PlotInput /> : <Shade />}
      </div>
    </div>
  );
});
