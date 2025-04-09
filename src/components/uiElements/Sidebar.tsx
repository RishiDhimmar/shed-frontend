// import { MdMenu } from "react-icons/md";
// import { observer } from "mobx-react-lite";
// import { useState } from "react";
// import { FaChevronRight } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import SideBarMenuItem from "./SideBarMenuItem";

// const Sidebar = observer(() => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const navigate = useNavigate();

//   return (
//     <div className="bg-gray-700 flex flex-col  py-3 p-1 absolute z-20 top-16 left-0 h-screen hover:w-[250px] transition-all duration-1300">
//       <MdMenu
//         className="text-white text-3xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded "
//         onClick={() => setIsMenuOpen(!isMenuOpen)}
//       />

//       <SideBarMenuItem />
//     </div>
//   );
// });

// export default Sidebar;

import { MdMenu } from "react-icons/md";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import SideBarMenuItem from "./SideBarMenuItem";
import { BiLogOutCircle } from "react-icons/bi";
import { HiOutlineTemplate } from "react-icons/hi";
import uiStore from "../../stores/UIStore";

const Sidebar = observer(() => {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-gray-700 flex flex-col py-4 p-1 absolute z-20 top-16 left-0 h-[calc(100vh-64px)] transition-[width] duration-500 ease-in-out ${
        uiStore.isSidebarOpen ? "w-[300px]" : "w-[50px]"
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
        onIconClick={() => uiStore.toggleSidebar()}
        showLabel={uiStore.isSidebarOpen}
      />
    </div>
  );
});

export default Sidebar;
