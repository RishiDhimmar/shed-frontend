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
          color="bg-[#FFFFFF]"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("plot")}
        />
        <LayoutItem
          title="Shade"
          color="bg-[#FF7F00]"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("shade")}
        />
        <LayoutItem
          title="Baseplate"
          color="bg-[#00FF00]"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("baseplate")}
        />
        <LayoutItem
          title="Column"
          color="bg-[#6363E1]"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("column")}
        />
        <LayoutItem
          title="Foundation"
          color="bg-[#FF00FF]"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("Foundation")}
        />
        <LayoutItem
          title="Mullion Column"
          color="bg-[#FF0000]"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("MullionColumn")}
        />
        <LayoutItem
          title="Ground Beam"
          color="bg-[#00FFFF]"
          isHidden={true}
          onClick={() => uiStore.setCurrentComponent("Ground Beam")}
        />
      </div>
      <div className="flex-1 p-8 w-[400px] absolute top-0 left-45">
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
