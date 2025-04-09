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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBarMenuItem from "./SideBarMenuItem";
import { BiLogOutCircle } from "react-icons/bi";
import { HiOutlineTemplate } from "react-icons/hi";

const Sidebar = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`bg-gray-700 flex flex-col py-4 p-1 absolute z-20 top-16 left-0 h-[calc(100vh-64px)] transition-[width] duration-500 ${
        isOpen ? "w-[300px]" : "w-[50px]"
      }`}
    >
      <SideBarMenuItem
        isHovered={isOpen}
        icon={<MdMenu />}
        label="Menu"
        onClick={toggleSidebar}
      />
      <SideBarMenuItem
        isHovered={isOpen}
        icon={<BiLogOutCircle />}
        label="Log Out"
        onClick={() => navigate("/")}
      />
      <SideBarMenuItem
        isHovered={isOpen}
        icon={<HiOutlineTemplate />}
        label="Templates"
        onClick={() => {}}
      />
    </div>
  );
});

export default Sidebar;
