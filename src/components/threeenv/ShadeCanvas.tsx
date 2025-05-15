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
        className="fixed top-18 right-65 z-50 text-3xl p-1  shadow-lg cursor-pointer hover:bg-gray-300 transition rounded-full"
      >
        <RiScreenshot2Line />
      </button>
    </div>
  );
}

export default ShadeCanvas;
