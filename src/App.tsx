import { useEffect } from "react";
import Navbar from "./components/uiElements/Navbar";
import uiStore from "./stores/UIStore";
import { Outlet } from "react-router-dom";
import "react-tooltip/dist/react-tooltip.css";
import "antd/dist/antd.css";

function App() {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (uiStore.isModified) {
        event.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  return (
    <div className="flex flex-col h-[calc(100vh-40px)]">
      <Navbar />

      <div className="flex  overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
