import { Outlet } from "react-router-dom";

import Navbar from "./components/uiElements/Navbar";

function App() {
  return (
    <div className="flex flex-col h-">
      <Navbar />

      <div className="flex  overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
