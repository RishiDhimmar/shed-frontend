import { Assumptions } from "./components/threeenv/Helpers/Assumptions";
import ShadeCanvas from "./components/threeenv/ShadeCanvas";
import { Layout } from "./components/threeenv/inputs/Layout";
import Navbar from "./components/uiElements.tsx/Navbar";
import Info from "./utils/Info";

function App() {
  return (
    <div className="flex flex-col h-">
      {/* Navbar at the top */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Layout on the left */}
        <Layout />

        {/* Main Content Area */}
        <div className="relative flex-1">
          <ShadeCanvas />
        </div>

        {/* New Right-Side Section */}
        <div className="  bg-gray-100 shadow-md px-4 py-6 flex flex-col items-center absolute right-0 top-16 h-[calc(100vh-64px)]">
          <Assumptions />
          <Info />
        </div>
      </div>
    </div>
  );
}

export default App;
