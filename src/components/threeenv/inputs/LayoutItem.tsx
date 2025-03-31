import React from "react";
import { BiBookOpen, BiHide } from "react-icons/bi";

function LayoutItem({ title, color, isHidden, onClick }: any) {
  return (
    <div className="flex items-center justify-between w-full px-1 py-1">
      <div className={`h-4 w-4 rounded ${color}`}></div>
      <div
        className="text-white font-medium  hover:text-blue-300 cursor-pointer ml-1"
        onClick={onClick}
      >
        {title}
      </div>
      <div className="text-white h-5 w-5 flex items-center justify-center rounded cursor-pointer">
        {isHidden ? <BiHide /> : <BiBookOpen />}{" "}
      </div>
    </div>
  );
}

export default LayoutItem;
