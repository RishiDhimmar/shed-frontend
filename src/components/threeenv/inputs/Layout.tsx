import { observer } from "mobx-react-lite";
import { PlotInput } from "./PlotInput";
import { Shade } from "./Shade";
import uiStore from "../../../stores/UIStore";
import { BaseplateInput } from "./Baseplate";
import { Column } from "./Column";
import { Foundation } from "./Foundation";
import { MullionColumn } from "./MullianColumn";
import LayoutItem from "./LayoutItem";

export const Layout = observer(() => {
  return (
    <div className="flex relative z-10">
      <div className="w-[200px] bg-gray-800 text-white flex flex-col items-start px-2 py-4 ">
        <LayoutItem
          title="Plot"
          color="bg-gray-500"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("plot")}
        />
        <LayoutItem
          title="Shade"
          color="bg-gray-500"
          isHidden={false}
          onClick={() => uiStore.setCurrentComponent("shade")}
        />
        <LayoutItem
          title="Baseplate"
          color="bg-gray-500"
          isHidden={false}
          onClick={() => uiStore.setCurrentComponent("baseplate")}
        />
        <LayoutItem
          title="Column"
          color="bg-gray-500"
          isHidden={false}
          onClick={() => uiStore.setCurrentComponent("column")}
        />
        <LayoutItem
          title="Foundation"
          color="bg-gray-500"
          isHidden={false}
          onClick={() => uiStore.setCurrentComponent("Foundation")}
        />
        <LayoutItem
          title="Mullion Column"
          color="bg-gray-500"
          isHidden={false}
          onClick={() => uiStore.setCurrentComponent("MullionColumn")}
          className="mb-4 hover:text-blue-300 text-left"
        >
          Mullion Column
        </button>
      </div>
      <div className="flex-1 p-8 w-[400px] absolute top-0 left-50">
        {uiStore.currentComponent === "plot" && <PlotInput />}
        {uiStore.currentComponent === "shade" && <Shade />}
        {uiStore.currentComponent === "baseplate" && <BaseplateInput />}
        {uiStore.currentComponent === "column" && <Column />}
        {uiStore.currentComponent === "Foundation" && <Foundation />}
        {uiStore.currentComponent === "MullionColumn" && <MullionColumn />}
      </div>
    </div>
  );
});
