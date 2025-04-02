import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RiScreenshot2Line } from "react-icons/ri";

function ScreenshotButton() {
  const { gl, scene, camera } = useThree();

  const takeScreenshot = () => {
    gl.render(scene, camera); // Ensure the latest frame is rendered
    const dataUrl = gl.domElement.toDataURL("image/png"); // Convert canvas to image URL

    // Create an invisible link and trigger download
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "screenshot.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Html
      style={{
          position: "absolute",
          top: "250px",
          left: "300px",
          zIndex: 1
      }}

    >
      <button onClick={takeScreenshot} style={{ fontSize: "30px", cursor : "pointer"}}><RiScreenshot2Line /></button>
    </Html>
  );
}

export default ScreenshotButton;
