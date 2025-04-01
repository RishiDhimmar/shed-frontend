import { observer } from "mobx-react-lite";
import { useState } from "react";
import { PlotInput } from "./PlotInput";
import { Shade } from "./Shade";
import uiStore from "../../../stores/UIStore";
import { BaseplateInput } from "./Baseplate";
import { Column } from "./Column";
import { Foundation } from "./Foundation";
import { MullionColumn } from "./MullianColumn";
import LayoutItem from "./LayoutItem";
import { GroundBeam } from "./GroundBeam";

export const Layout = observer(() => {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const handleSelect = (title: string) => {
    setSelectedTitle(title);
    uiStore.setCurrentComponent(title);
  };

  return (
    <div className="flex relative z-10">
      <div className="w-[200px] bg-gray-800 text-white flex flex-col items-start px-2 py-4">
        <LayoutItem
          title="Plot"
          color="bg-[#FFFFFF]"
          isHidden={!uiStore.visibility.plot}
          isSelected={selectedTitle === "plot"}
          onClick={() => handleSelect("plot")}
          onToggleVisibility={() => uiStore.toggleVisibility("plot")}
        />
        <LayoutItem
          title="Shade"
          color="bg-[#FF7F00]"
          isHidden={!uiStore.visibility.shade}
          isSelected={selectedTitle === "shade"}
          onClick={() => handleSelect("shade")}
          onToggleVisibility={() => uiStore.toggleVisibility("shade")}
        />
        <LayoutItem
          title="Baseplate"
          color="bg-[#00FF00]"
          isHidden={!uiStore.visibility.baseplate}
          isSelected={selectedTitle === "baseplate"}
          onClick={() => handleSelect("baseplate")}
          onToggleVisibility={() => uiStore.toggleVisibility("baseplate")}
        />
        <LayoutItem
          title="Column"
          color="bg-[#6363E1]"
          isHidden={!uiStore.visibility.column}
          isSelected={selectedTitle === "column"}
          onClick={() => handleSelect("column")}
          onToggleVisibility={() => uiStore.toggleVisibility("column")}
        />
        <LayoutItem
          title="Foundation"
          color="bg-[#FF00FF]"
          isHidden={!uiStore.visibility.Foundation}
          isSelected={selectedTitle === "Foundation"}
          onClick={() => handleSelect("Foundation")}
          onToggleVisibility={() => uiStore.toggleVisibility("Foundation")}
        />
        <LayoutItem
          title="Mullion Column"
          color="bg-[#FF0000]"
          isHidden={!uiStore.visibility.MullionColumn}
          isSelected={selectedTitle === "MullionColumn"}
          onClick={() => handleSelect("MullionColumn")}
          onToggleVisibility={() => uiStore.toggleVisibility("MullionColumn")}
        />
        <LayoutItem
          title="Ground Beam"
          color="bg-[#00FFFF]"
          isHidden={!uiStore.visibility.groundBeam}
          isSelected={selectedTitle === "Ground Beam"}
          onClick={() => handleSelect("Ground Beam")}
          onToggleVisibility={() => uiStore.toggleVisibility("groundBeam")}
        />
      </div>
      <div className="flex-1 p-8 w-[400px] absolute top-0 left-[200px]">
        {uiStore.currentComponent === "plot" && <PlotInput />}
        {uiStore.currentComponent === "shade" && <Shade />}
        {uiStore.currentComponent === "baseplate" && <BaseplateInput />}
        {uiStore.currentComponent === "column" && <Column />}
        {uiStore.currentComponent === "Foundation" && <Foundation />}
        {uiStore.currentComponent === "MullionColumn" && <MullionColumn />}
        {uiStore.currentComponent === "Ground Beam" && <GroundBeam />}
      </div>
    </div>
  );
});

export default Layout;
