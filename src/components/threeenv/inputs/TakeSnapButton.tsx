// import  { useEffect } from "react";
// import { useThree } from "@react-three/fiber";

// function ScreenshotProvider({ setScreenshotFn }: { setScreenshotFn: (fn: () => void) => void }) {
//   const { gl, scene, camera } = useThree();

//   useEffect(() => {
//     // Create a function that takes a screenshot
//     const takeScreenshot = () => {
//       gl.render(scene, camera); // Render latest frame
//       const dataUrl = gl.domElement.toDataURL("image/png"); // Convert canvas to image URL

//       // Create an invisible link and trigger download
//       const link = document.createElement("a");
//       link.href = dataUrl;
//       link.download = "screenshot.png";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     };

//     // Pass the screenshot function to the parent component
//     setScreenshotFn(() => takeScreenshot);
//   }, [gl, scene, camera, setScreenshotFn]);

//   return null; // This component doesn't render anything
// }

// export default ScreenshotProvider;

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import jsPDF from "jspdf";
import { Html } from "@react-three/drei";
import { RiScreenshot2Line } from "react-icons/ri";
import { AiOutlineFilePdf } from "react-icons/ai";
import * as THREE from "three";

function ExportControls() {
  const { gl, scene, camera } = useThree();
  const [takeScreenshot, setScreenshotFn] = useState<() => void>(
    () => () => {}
  );
  const [exportPDF, setPDFExportFn] = useState<() => void>(() => () => {});

  // Screenshot handler (PNG)
  useEffect(() => {
    const screenshotHandler = () => {
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "screenshot.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    setScreenshotFn(() => screenshotHandler);
  }, [gl, scene, camera]);

  useEffect(() => {
    const pdfExportHandler = () => {
      const originalSize = gl.getSize(new THREE.Vector2());
      const originalPixelRatio = gl.getPixelRatio();
  
      const exportWidth = 1920; // Desired resolution width
      const exportHeight = 1080; // Desired resolution height
  
      // Set temporary high-resolution render target
      gl.setPixelRatio(2); // You can increase this for even better quality
      gl.setSize(exportWidth, exportHeight);
      gl.render(scene, camera);
  
      // Get image from canvas
      const dataUrl = gl.domElement.toDataURL("image/jpeg", 1.0); // 100% quality
  
      // Restore original size and pixel ratio
      gl.setPixelRatio(originalPixelRatio);
      gl.setSize(originalSize.x, originalSize.y);
  
      // Create PDF and add image
      const pdf = new jsPDF({
        orientation: exportWidth > exportHeight ? "landscape" : "portrait",
        unit: "px",
        format: [exportWidth, exportHeight],
      });
  
      pdf.addImage(dataUrl, "JPEG", 0, 0, exportWidth, exportHeight);
      pdf.save("scene-export.pdf");
    };
  
    setPDFExportFn(() => pdfExportHandler);
  }, [gl, scene, camera]);
  
  
  return (
    <Html>
      <div className="fixed top-20 right-20 z-50 flex flex-col space-y-3">
        <button
          onClick={takeScreenshot}
          className="text-3xl p-2 bg-white shadow-lg rounded-full cursor-pointer hover:bg-gray-200 transition"
          title="Download Screenshot"
        >
          <RiScreenshot2Line />
        </button>
        <button
          onClick={exportPDF}
          className="text-3xl p-2 bg-white shadow-lg rounded-full cursor-pointer hover:bg-gray-200 transition"
          title="Export Floorplan PDF"
        >
          <AiOutlineFilePdf />
        </button>
      </div>
    </Html>
  );
}

export default ExportControls;
