
// import { useEffect, useState } from "react";
// import { useThree } from "@react-three/fiber";
// import jsPDF from "jspdf";
// import { Html } from "@react-three/drei";
// import { RiScreenshot2Line } from "react-icons/ri";
// import { AiOutlineFilePdf } from "react-icons/ai";
// import * as THREE from "three";

// function ExportControls() {
//   const { gl, scene, camera } = useThree();
//   const [takeScreenshot, setScreenshotFn] = useState<() => void>(
//     () => () => {}
//   );
//   const [exportPDF, setPDFExportFn] = useState<() => void>(() => () => {});

//   // Screenshot handler (PNG)
//   useEffect(() => {
//     const screenshotHandler = () => {
//       gl.render(scene, camera);
//       const dataUrl = gl.domElement.toDataURL("image/png");

//       const link = document.createElement("a");
//       link.href = dataUrl;
//       link.download = "screenshot.png";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     };

//     setScreenshotFn(() => screenshotHandler);
//   }, [gl, scene, camera]);

//   useEffect(() => {
//     const pdfExportHandler = () => {
//       const originalSize = gl.getSize(new THREE.Vector2());
//       const originalPixelRatio = gl.getPixelRatio();
  
//       const exportWidth = 1920; // Desired resolution width
//       const exportHeight = 1080; // Desired resolution height
  
//       // Set temporary high-resolution render target
//       gl.setPixelRatio(2); // You can increase this for even better quality
//       gl.setSize(exportWidth, exportHeight);
//       gl.render(scene, camera);
  
//       // Get image from canvas
//       const dataUrl = gl.domElement.toDataURL("image/jpeg", 1.0); // 100% quality
  
//       // Restore original size and pixel ratio
//       gl.setPixelRatio(originalPixelRatio);
//       gl.setSize(originalSize.x, originalSize.y);
  
//       // Create PDF and add image
//       const pdf = new jsPDF({
//         orientation: exportWidth > exportHeight ? "landscape" : "portrait",
//         unit: "px",
//         format: [exportWidth, exportHeight],
//       });
  
//       pdf.addImage(dataUrl, "JPEG", 0, 0, exportWidth, exportHeight);
//       pdf.save("scene-export.pdf");
//     };
  
//     setPDFExportFn(() => pdfExportHandler);
//   }, [gl, scene, camera]);
  
  
//   return (
//    <></>
//   );
// }

// export default ExportControls;

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import jsPDF from "jspdf";
import uiStore from "../../../stores/UIStore";
import { observer } from "mobx-react-lite";

const ExportControls = observer(() => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    console.log("Mounting ExportControls", gl, scene, camera);
    const screenshotHandler = () => {
      console.log("Taking screenshot...");
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");
  
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "screenshot.png";
      a.click();
    };
  
    uiStore.setScreenshotFn(() => screenshotHandler);
  }, [gl, scene, camera]);
  
  useEffect(() => {
    console.log("Mounting PDF handler");
    const pdfHandler = () => {
      console.log("Exporting to PDF...");
      const originalSize = gl.getSize(new THREE.Vector2());
      const originalRatio = gl.getPixelRatio();
  
      gl.setPixelRatio(2);
      gl.setSize(1920, 1080);
      gl.render(scene, camera);
  
      const dataUrl = gl.domElement.toDataURL("image/jpeg");
  
      gl.setPixelRatio(originalRatio);
      gl.setSize(originalSize.x, originalSize.y);
  
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1920, 1080],
      });
  
      pdf.addImage(dataUrl, "JPEG", 0, 0, 1920, 1080);
      pdf.save("scene.pdf");
    };
  
    uiStore.setPdfExportFn(() => pdfHandler);
  }, [gl, scene, camera]);
  

  return null;
})


export default ExportControls;