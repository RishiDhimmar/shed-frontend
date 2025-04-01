import { BiHide } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa6";

interface LayoutItemProps {
  title: string;
  color: string;
  isHidden: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  className?: string;
}

function LayoutItem({
  title,
  color,
  isHidden,
  isSelected,
  onClick,
  onToggleVisibility,
  className,
}: LayoutItemProps) {
  return (
    <div
      className={`flex items-center justify-between w-full px-1 py-1 cursor-pointer ${className} ${
        isSelected ? "text-blue-300" : "text-white"
      }`}
      onClick={onClick}
    >
      <div className={`h-4 w-4 rounded ${color}`}></div>
      <div className="font-medium ml-1">{title}</div>
      <div
        className="h-5 w-5 flex items-center justify-center rounded"
        onClick={(e) => {
          e.stopPropagation(); // Prevent selecting when clicking visibility icon
          onToggleVisibility();
        }}
      >
        {isHidden ? <BiHide /> : <FaRegEye />}
      </div>
    </div>
  );
}

export default LayoutItem;
