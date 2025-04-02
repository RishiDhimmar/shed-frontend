import { Assumptions } from "./components/threeenv/Helpers/Assumptions";
import ShadeCanvas from "./components/threeenv/ShadeCanvas";
import { Layout } from "./components/threeenv/inputs/Layout";
import Navbar from "./components/uiElements.tsx/Navbar";
import { Import } from "./utils/Import";
import Info from "./utils/Info";
import Save from "./utils/Save";

function App() {
  return (
    <div className="flex flex-col h-">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Layout />

        <div className="relative flex-1">
          <ShadeCanvas />
        </div>

        <div className="  bg-gray-100 shadow-md px-4 py-2 flex flex-col items-center absolute right-0 top-16 h-[calc(100vh-64px)] gap-2">
          <Import />
          <Save />
          <Assumptions />
          <Info />
        </div>
      </div>
    </div>
  );
}

export default App;
