import { MdMenu } from "react-icons/md";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SideBarMenuItem from "./SideBarMenuItem";
import { BiLayer, BiLogOutCircle } from "react-icons/bi";
import { HiOutlineTemplate } from "react-icons/hi";
import uiStore from "../../stores/UIStore";
import { PiSlidersBold } from "react-icons/pi";

const Sidebar = observer(() => {
  const navigate = useNavigate();

  const [showMasterSubMenu, setShowMasterSubMenu] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState("");

  const handleTemplatesClick = () => {
    setSelectedSubMenu("templates");
    navigate("/app/templates");
    setShowMasterSubMenu(false);
  };

  const handleStandardInputsClick = () => {
    setSelectedSubMenu("standardInputs");
    uiStore.toggleStandardInputs();
    setShowMasterSubMenu(false);
    uiStore.toggleSidebar();
  };
  return (
    <div
      className={`bg-gray-700 flex flex-col z-20 py-4 px-2 h-calc(100vh-64px) transition-[width] duration-500  ease-in-out  absolute h-screen ${
        uiStore.isSidebarOpen ? "w-[200px]" : "w-[50px]"
      }`}
    >
      <SideBarMenuItem
        icon={<MdMenu />}
        label="Menu"
        onIconClick={() => uiStore.toggleSidebar()}
        showLabel={uiStore.isSidebarOpen}
      />
      <SideBarMenuItem
        icon={<BiLogOutCircle />}
        label="Log Out"
        showLabel={uiStore.isSidebarOpen}
        onIconClick={() => uiStore.toggleSidebar()}
        onLabelClick={() => navigate("/")}
      />
      <SideBarMenuItem
        icon={<HiOutlineTemplate />}
        label="Templates"
        onIconClick={() => {
          uiStore.toggleSidebar();
        }}
        showLabel={uiStore.isSidebarOpen}
      />
      <SideBarMenuItem
        icon={uiStore.useStandardInputs ? <PiSlidersBold /> : <BiLayer />}
        label="Master"
        onIconClick={() => {
          uiStore.toggleSidebar();
        }}
        onLabelClick={() => {
          if (uiStore.isSidebarOpen) {
            setShowMasterSubMenu(!showMasterSubMenu);
          }
        }}
        showLabel={uiStore.isSidebarOpen}
      />

      {showMasterSubMenu && uiStore.isSidebarOpen && (
        <div className="ml-8 mt-1">
          <div
            className={`text-white py-2 px-4 hover:bg-gray-600 cursor-pointer rounded ${
              selectedSubMenu === "templates" ? "bg-gray-600" : ""
            }`}
            onClick={() => {
              handleTemplatesClick();
              uiStore.setSidebarOpen(false);
            }}
          >
            Templates
          </div>
          <div
            className={`text-white py-2 px-4 hover:bg-gray-600 cursor-pointer rounded" ${
              selectedSubMenu === "standardInputs" ? "bg-gray-600" : ""
            }`}
            onClick={handleStandardInputsClick}
          >
            {uiStore.useStandardInputs ? "Custom Inputs" : "Standard Inputs"}
          </div>
        </div>
      )}
    </div>
  );
});

export default Sidebar;
