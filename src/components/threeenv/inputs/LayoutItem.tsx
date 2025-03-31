import { BiHide } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa6";

interface LayoutItemProps {
  title: string;
  color: string;
  isHidden: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  className?: string;
}

function LayoutItem({ title, color, isHidden, onClick, onToggleVisibility, className }: LayoutItemProps) {
  return (
    <div className={`flex items-center justify-between w-full px-1 py-1 ${className}`}>
      <div className={`h-4 w-4 rounded ${color}`}></div>
      <div
        className="text-white font-medium hover:text-blue-300 cursor-pointer ml-1"
        onClick={onClick}
      >
        {title}
      </div>
      <div 
        className="text-white h-5 w-5 flex items-center justify-center rounded cursor-pointer"
        onClick={onToggleVisibility}
      >
        {isHidden ? <BiHide /> : <FaRegEye />}
      </div>
    </div>
  );
}

export default LayoutItem;
