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

const Sidebar = observer(() => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`bg-gray-700 flex flex-col py-4 p-1 absolute z-20 top-16 left-0 h-screen transition-[width] duration-500 ${
        isHovered ? "w-[300px]" : "w-[50px]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SideBarMenuItem
        isHovered={isHovered}
        icon={<MdMenu />}
        label="Home"
        onClick={() => navigate("/listview")}
      />
      <SideBarMenuItem
        isHovered={isHovered}
        icon={<BiLogOutCircle />}
        label="Log Out"
        onClick={() => navigate("/")}
      />
    </div>
  );
});

export default Sidebar;
