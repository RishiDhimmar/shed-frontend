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
import  { useState } from "react";
import { Canvas } from "@react-three/fiber";
import ExperienceSetup from "./setUp/ExperienceSetup";
import ScreenshotProvider from "./inputs/TakeSnapButton";
import { RiScreenshot2Line } from "react-icons/ri";

function ShadeCanvas() {
  // State to hold the screenshot function from inside the Canvas
  const [takeScreenshot, setTakeScreenshot] = useState<(() => void) | null>(null);

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <Canvas style={{ background: "white" }} gl={{ preserveDrawingBuffer: true }}>
        <ExperienceSetup />
        <ScreenshotProvider setScreenshotFn={setTakeScreenshot} />
      </Canvas>

      {/* Render the button outside the Canvas */}
      <button
        onClick={() => {
          if (takeScreenshot) {
            takeScreenshot();
          }
        }}
        className="fixed bottom-15 right-5 z-50 text-3xl p-2 bg-white shadow-lg cursor-pointer hover:bg-gray-200 transition"
      >
        <RiScreenshot2Line />
      </button>
    </div>
  );
}

export default ShadeCanvas;
