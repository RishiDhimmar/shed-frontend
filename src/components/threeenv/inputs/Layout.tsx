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
      <div className="w-[200px] bg-gray-800 text-white flex flex-col items-start px-2 py-4">
        <LayoutItem
          title="Plot"
          color="bg-[#FFFFFF]"
          isHidden={!uiStore.visibility.plot}
          onClick={() => uiStore.setCurrentComponent("plot")}
          onToggleVisibility={() => uiStore.toggleVisibility("plot")}
        />
        <LayoutItem
          title="Shade"
          color="bg-[#FF7F00]"
          isHidden={!uiStore.visibility.shade}
          onClick={() => uiStore.setCurrentComponent("shade")}
          onToggleVisibility={() => uiStore.toggleVisibility("shade")}
        />
        <LayoutItem
          title="Baseplate"
          color="bg-[#00FF00]"
          isHidden={!uiStore.visibility.baseplate}
          onClick={() => uiStore.setCurrentComponent("baseplate")}
          onToggleVisibility={() => uiStore.toggleVisibility("baseplate")}
        />
        <LayoutItem
          title="Column"
          color="bg-[#6363E1]"
          isHidden={!uiStore.visibility.column}
          onClick={() => uiStore.setCurrentComponent("column")}
          onToggleVisibility={() => uiStore.toggleVisibility("column")}
        />
        <LayoutItem
          title="Foundation"
          color="bg-[#FF00FF]"
          isHidden={!uiStore.visibility.Foundation}
          onClick={() => uiStore.setCurrentComponent("Foundation")}
          onToggleVisibility={() => uiStore.toggleVisibility("Foundation")}
        />
        <LayoutItem
          title="Mullion Column"
          color="bg-[#FF0000]"
          isHidden={!uiStore.visibility.MullionColumn}
          onClick={() => uiStore.setCurrentComponent("MullionColumn")}
          onToggleVisibility={() => uiStore.toggleVisibility("MullionColumn")}
        />
        <LayoutItem
          title="Ground Beam"
          color="bg-[#00FFFF]"
          isHidden={uiStore.visibility.groundBeam}
          onClick={() => uiStore.setCurrentComponent("Ground Beam")}
          onToggleVisibility={() => uiStore.toggleVisibility("groundBeam")}
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

export default Layout;
