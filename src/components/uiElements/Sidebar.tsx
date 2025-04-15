import { MdMenu } from "react-icons/md";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SideBarMenuItem from "./SideBarMenuItem";
import { BiLayer, BiLogOutCircle } from "react-icons/bi";
import { RiListView } from "react-icons/ri";
import uiStore from "../../stores/UIStore";
import { PiStandardDefinition } from "react-icons/pi";
import { TfiWrite } from "react-icons/tfi";

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
    setSelectedSubMenu("standards");
    navigate("/app/standards");
    uiStore.toggleSidebar();
    setShowMasterSubMenu(false);
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
        icon={<RiListView />}
        label="ListView"
        onIconClick={() => {
          uiStore.toggleSidebar();
        }}
        onLabelClick={() => {
          navigate("/app/listView");
          uiStore.setSidebarOpen(false);
        }}
        showLabel={uiStore.isSidebarOpen}
      />
      <SideBarMenuItem
        icon={<BiLayer />}
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
              selectedSubMenu === "standards" ? "bg-gray-600" : ""
            }`}
            onClick={handleStandardInputsClick}
          >
            Standards
          </div>
        </div>
      )}
      <SideBarMenuItem
        icon={
          !uiStore.useStandardInputs ? (
            <PiStandardDefinition />
          ) : (
            <TfiWrite size={17} />
          )
        }
        label={!uiStore.useStandardInputs ? "Standard Input" : "Custom Input"}
        onIconClick={() => uiStore.toggleSidebar()}
        showLabel={uiStore.isSidebarOpen}
        onLabelClick={() => {
          uiStore.setSidebarOpen(false);
          uiStore.toggleStandardInputs();
        }}
      />
      <div className="items-end">
        <SideBarMenuItem
          icon={<BiLogOutCircle />}
          label="Log Out"
          showLabel={uiStore.isSidebarOpen}
          onIconClick={() => uiStore.toggleSidebar()}
          onLabelClick={() => navigate("/")}
        />
      </div>
    </div>
  );
});

export default Sidebar;
