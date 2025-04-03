import { IoHomeOutline } from "react-icons/io5";
import { RiLogoutCircleLine } from "react-icons/ri";

function Sidebar() {
  return (
    <div className="bg-gray-700 flex flex-col items-center p-1 ">
      <IoHomeOutline className="text-white text-3xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded mt-4" />
      <RiLogoutCircleLine className="text-white text-3xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded " />
    </div>
  );
}

export default Sidebar;
