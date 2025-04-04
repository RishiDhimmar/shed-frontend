import { IoHomeOutline } from "react-icons/io5";
import { RiLogoutCircleLine } from "react-icons/ri";
import uiStore from "../../stores/UIStore";
import { BiHide } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa6";
import { observer } from "mobx-react-lite";

const Sidebar = observer (() => {
  return (
    <div className="bg-gray-700 flex flex-col items-center p-1 ">
      <IoHomeOutline className="text-white text-3xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded mt-4" />
      {uiStore.isDimensionsVisible ? (
        <BiHide
          className="text-white text-3xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded"
          onClick={() => uiStore.toggleDimensionsVisibility()}
        />
      ) : (
        <FaRegEye className="text-white text-3xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded" 
        onClick={() => uiStore.toggleDimensionsVisibility()}/>
      )}
      <RiLogoutCircleLine className="text-white text-3xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded " />
    </div>
  );
})

export default Sidebar;
