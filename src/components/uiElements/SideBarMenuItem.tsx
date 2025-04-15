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
  showLabel: boolean;
  icon: React.ReactNode;
  label: string;
  onIconClick?: () => void;
  onLabelClick?: () => void;
}

function SideBarMenuItem({
  showLabel,
  icon,
  label,
  onIconClick,
  onLabelClick,
}: SideBarMenuItemProps) {
  return (
    <div className="flex items-center gap-2  hover:bg-gray-600 h-10 p-1">
      <div
        className="text-white text-xl cursor-pointer flex items-center justify-center"
        onClick={onIconClick}
      >
        {icon}
      </div>

      <div
        className={`text-white ml-2 transition-all duration-400 cursor-pointer ${
          showLabel ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
        onClick={onLabelClick}
      >
        {label}
      </div>
    </div>
  );
}

export default SideBarMenuItem;
