import { useNavigate, useLocation } from "react-router-dom";
import UserName from "./UserName";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="w-full bg-gray-200 h-16 flex items-center justify-between px-4">
      <div>
        <img
          src="assets/resolute-logo.png"
          alt="Logo"
          className="w-30 h-10 object-contain"
        />
      </div>
      <div className="flex gap-5">
        <UserName />
        {location.pathname !== "/" && (
          <button
            className="bg-gray-800 text-white text-sm p-2 rounded-md shadow-md hover:bg-gray-600 cursor-pointer "
            onClick={() => navigate("/")}
          >
            Log out
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
