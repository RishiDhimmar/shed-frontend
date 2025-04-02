// import { useEffect } from "react";
// import { Assumptions } from "./components/threeenv/Helpers/Assumptions";
// import ShadeCanvas from "./components/threeenv/ShadeCanvas";
// import { Layout } from "./components/threeenv/inputs/Layout";
// import Navbar from "./components/uiElements.tsx/Navbar";
// import { Import } from "./utils/Import";
// import Info from "./utils/Info";
// import Save from "./utils/Save";
// import uiStore from "./stores/UIStore";

// function App() {
//   useEffect(() => {
//     const handleBeforeUnload = (event: BeforeUnloadEvent) => {
//       if (uiStore.isModified) {
//         event.preventDefault();
//         return "You have unsaved changes. Are you sure you want to leave?";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, []);
//   return (
//     <div className="flex flex-col h-">
//       <Navbar />

//       <div className="flex flex-1 overflow-hidden">
//         <Layout />

//         <div className="relative flex-1">
//           <ShadeCanvas />
//         </div>

//         <div className="  bg-gray-100 shadow-md px-4 py-2 flex flex-col items-center absolute right-0 top-16 h-[calc(100vh-64px)] gap-2">
//           <Import />
//           <Save />
//           <Assumptions />
//           <Info />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
import { useEffect } from "react";
import { Assumptions } from "./components/threeenv/Helpers/Assumptions";
import ShadeCanvas from "./components/threeenv/ShadeCanvas";
import { Layout } from "./components/threeenv/inputs/Layout";
import Navbar from "./components/uiElements.tsx/Navbar";
import { Import } from "./utils/Import";
import Info from "./utils/Info";
import Save from "./utils/Save";
import uiStore from "./stores/UIStore";

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
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex  overflow-hidden">
        <Layout />

        {/* Make the ShadeCanvas take up all the remaining space */}
        <div className="flex-1">
          <ShadeCanvas />
        </div>

        {/* Right panel stays fixed width and full height */}
        <div className="bg-gray-100 shadow-md px-4 py-2 flex flex-col items-center h-full gap-2 w-60">
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
