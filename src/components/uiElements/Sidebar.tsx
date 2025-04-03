import { FaGun } from "react-icons/fa6";

function Sidebar() {
  return (
    <div className="bg-gray-800 flex flex-col items-center p-3 gap-2">
      <FaGun className="text-white text-2xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded" />
      <FaGun className="text-white text-2xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded"  />
      <FaGun className="text-white text-2xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded" />
      <FaGun className="text-white text-2xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded" />
      <FaGun className="text-white text-2xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded" />
      <FaGun className="text-white text-2xl cursor-pointer hover:bg-gray-600 m-1 p-1 rounded" />
    </div>
  );
}

export default Sidebar;
