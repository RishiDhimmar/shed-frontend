// import React from "react";
// import { MdMenu } from "react-icons/md";

// function SideBarMenuItem() {
//   return (
//     <div className="flex items-center gap-2 p-2 text-center">
//       <MdMenu className="text-white text-3xl cursor-pointer hover:bg-gray-600 rounded " />
//       <div className="text-white text-center ">Home</div>
//     </div>
//   );
// }

// export default SideBarMenuItem;


interface SideBarMenuItemProps {
  isHovered: boolean;
  icon: any;
  label: string;
  onClick: () => void;
}


function SideBarMenuItem({ isHovered, icon, label, onClick } : SideBarMenuItemProps) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-2 text-center hover:bg-gray-600 cursor-pointer"
      onClick={onClick}
    >
      {/* Icon remains visible at all times */}
      <div className="text-white text-xl cursor-pointer  rounded ">{icon}</div>

      {/* Only the text fades in/out */}
      <div
        className={`text-white text-center transition-all duration-500 transform ${
          isHovered ? "opacity-100  w-auto" : "opacity-0  w-0"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export default SideBarMenuItem;
