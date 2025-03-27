import { observer } from "mobx-react-lite";
import { PlotInput } from "./PlotInput";
import { Shade } from "./Shade";
import uiStore from "../../../stores/UIStore";
import { BaseplateInput } from "./Baseplate";

export const Layout = observer(() => {
  return (
    <div className="flex w-[100px] z-10">
      <div className="w-20 bg-gray-800 text-white flex flex-col items-center p-4">
        <button
          onClick={() => uiStore.setCurrentComponent("plot")}
          className="mb-4 hover:text-blue-300"
        >
          Plot
        </button>
        <button
          onClick={() => uiStore.setCurrentComponent("shade")}
          className="mb-4 hover:text-blue-300"
        >
          Shade
        </button>
        <button
          onClick={() => uiStore.setCurrentComponent("baseplate")}
          className="mb-4 hover:text-blue-300"
        >
          BasePLate
        </button>
      </div>
        <div className="flex-1 p-8 w-[400px]">
          {uiStore.currentComponent === "plot" && <PlotInput />}
          {uiStore.currentComponent === "shade" && <Shade />}
          {uiStore.currentComponent === "baseplate" && <BaseplateInput />}
        </div>
    </div>
  );
});
