import { observer } from "mobx-react-lite";
import { useState } from "react";
import { PlotInput } from "./PlotInput";
import { Shade } from "./Shade";
import uiStore, { currentComponentType } from "../../../stores/UIStore";
import { BaseplateInput } from "./Baseplate";
import { Column } from "./Column";
import { MullionColumn } from "./MullianColumn";
import LayoutItem from "./LayoutItem";
import { GroundBeam } from "./GroundBeam";
import Foundation from "./Foundation";
import Update from "../../../utils/Update";
import BOM from "./BOM";

export const Layout = observer(() => {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const handleSelect = (title: string) => {
    setSelectedTitle(title);
    uiStore.setCurrentComponent(title as currentComponentType);
  };

  return (
    <div className="flex h-full z-10   ">
      <div className="w-[250px] h-[calc(100vh-40px)] bg-gray-800  text-white flex flex-col items-start px-2 py-4">
        <LayoutItem
          title="Dimensions"
          color="bg-black"
          isHidden={!uiStore.isDimensionsVisible}
          isSelected={uiStore.isDimensionsVisible}
          onClick={() => {}}
          onToggleVisibility={() => uiStore.toggleDimensionsVisibility()}
        />

        <div className="line border w-full my-1 border-gray-600"></div>
        <LayoutItem
          title="Visibility"
          color="bg-black"
          isHidden={Object.values(uiStore.visibility).includes(false)}
          isSelected={uiStore.isDimensionsVisible}
          onClick={() => {}}
          onToggleVisibility={() => uiStore.toggleAllLayoutVisibility()}
        />

        <div className="line border w-full my-1 border-gray-600"></div>
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
          isHidden={!uiStore.visibility.foundation}
          isSelected={selectedTitle === "foundation"}
          onClick={() => handleSelect("foundation")}
          onToggleVisibility={() => uiStore.toggleVisibility("foundation")}
        />
        <LayoutItem
          title="Mullion Column"
          color="bg-[#FF0000]"
          isHidden={!uiStore.visibility.mullionColumn}
          isSelected={selectedTitle === "mullionColumn"}
          onClick={() => handleSelect("mullionColumn")}
          onToggleVisibility={() => uiStore.toggleVisibility("mullionColumn")}
        />
        <LayoutItem
          title="Ground Beam"
          color="bg-[#00FFFF]"
          isHidden={!uiStore.visibility.groundBeam}
          isSelected={selectedTitle === "groundBeam"}
          onClick={() => handleSelect("groundBeam")}
          onToggleVisibility={() => uiStore.toggleVisibility("groundBeam")}
        />
        <LayoutItem
          title="Circles"
          color="bg-[#00FFFF]"
          isHidden={!uiStore.visibility.circles}
          isSelected={selectedTitle === "circles"}
          onClick={() => {
            handleSelect("circles");
          }}
          onToggleVisibility={() => uiStore.toggleVisibility("circles")}
        />
        <LayoutItem
          title="Lines"
          color="bg-[#00FFFF]"
          isHidden={!uiStore.visibility.lines}
          isSelected={selectedTitle === "lines"}
          onClick={() => handleSelect("lines")}
          onToggleVisibility={() => uiStore.toggleVisibility("lines")}
        />
        <LayoutItem
          title="Polygons"
          color="bg-[#00FFFF]"
          isHidden={!uiStore.visibility.polygons}
          isSelected={selectedTitle === "polygons"}
          onClick={() => handleSelect("polygons")}
          onToggleVisibility={() => uiStore.toggleVisibility("polygons")}
        />
        <LayoutItem
          title="Annotation"
          color="bg-[#00FFFF]"
          isHidden={!uiStore.visibility.annotation}
          isSelected={selectedTitle === "annotation"}
          onClick={() => handleSelect("annotation")}
          onToggleVisibility={() => uiStore.toggleVisibility("annotation")}
        />
        <LayoutItem
          title="Plinth"
          color="bg-[gray]"
          isHidden={!uiStore.visibility.plinth}
          isSelected={selectedTitle === "plinth"}
          onClick={() => handleSelect("plinth")}
          onToggleVisibility={() => uiStore.toggleVisibility("plinth")}
        />
        <LayoutItem
          title="BOM"
          color="bg-[gray]"
          isHidden={!uiStore.visibility.bom}
          isSelected={selectedTitle === "bom"}
          onClick={() => handleSelect("bom")}
          onToggleVisibility={() => uiStore.toggleVisibility("bom")}
        />
      </div>
      <div className={` flex flex-col  overflow-y-auto  ${uiStore.currentComponent === "bom" ? "w-[1300px]" : "w-[300px]"} h-[calc(100vh-40px)]  ml-1 bg-white rounded shadow-xl  z-1 top-0 `}>
        {uiStore.currentComponent === "plot" && <PlotInput />}
        {uiStore.currentComponent === "shade" && <Shade />}
        {uiStore.currentComponent === "baseplate" && <BaseplateInput />}
        {uiStore.currentComponent === "column" && <Column />}
        {uiStore.currentComponent === "foundation" && <Foundation />}
        {uiStore.currentComponent === "mullionColumn" && <MullionColumn />}
        {uiStore.currentComponent === "groundBeam" && <GroundBeam />}
        {uiStore.currentComponent === "bom" && <BOM />}
      </div>
    </div>
  );
});

export default Layout;
