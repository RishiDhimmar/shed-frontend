// import { Canvas } from "@react-three/fiber";
// import ExperienceSetup from "./setUp/ExperienceSetup";
// import ScreenshotButton from "./inputs/TakeSnapButton";

// function ShadeCanvas() {
//   return (
//     <div className=" h-[calc(100vh-64px)] z-1">
//       <Canvas style={{background: "white"}} gl={{preserveDrawingBuffer: true}}>
//         <ExperienceSetup />

//         <ScreenshotButton />
//       </Canvas>
//     </div>
//   );
// }

// export default ShadeCanvas;

// ShadeCanvas.jsx
import { Canvas } from "@react-three/fiber";
import ExperienceSetup from "./setUp/ExperienceSetup";
import { RiScreenshot2Line } from "react-icons/ri";
import ExportControls from "./inputs/TakeSnapButton";
import uiStore from "../../stores/UIStore";

function ShadeCanvas() {
  // State to hold the screenshot function from inside the Canvas

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <Canvas
        style={{ background: "white" }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ExperienceSetup />
        {/* <ScreenshotProvider setScreenshotFn={setTakeScreenshot} /> */}
        <ExportControls />
      </Canvas>

      {/* Render the button outside the Canvas */}
      <button
        onClick={() => {
          // if (takeScreenshot) {
          const temp: void | (() => void) = uiStore.screenshotFn();
          if (typeof temp === "function") {
            (temp as () => void)();
          }
          // }
        }}
        className="fixed bottom-14 right-5 z-50 text-3xl p-1 bg-white shadow-lg cursor-pointer hover:bg-gray-200 transition rounded"
      >
        <RiScreenshot2Line />
      </button>
    </div>
  );
}

export default ShadeCanvas;
