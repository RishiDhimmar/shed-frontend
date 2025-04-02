import { Import } from "../../utils/Import";
import Save from "../../utils/Save";

function Navbar() {
  return (
    <div className="w-full bg-gray-200 h-16 flex items-center justify-between px-4">
      <div>
        <img src="assets/resolute-logo.png" alt="Logo" className="w-30 h-10" />
      </div>
      <div className="flex gap-3">
        <Save />
        <Import />
      </div>
    </div>
  );
}

export default Navbar;
