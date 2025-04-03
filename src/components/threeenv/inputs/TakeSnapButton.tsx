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
    <Html>
      <div
        className="fixed top-70
       right-85 z-50"
      >
        <button
          onClick={takeScreenshot}
          className="text-3xl p-2 bg-white shadow-lg cursor-pointer hover:bg-gray-200 transition"
        >
          <RiScreenshot2Line />
        </button>
      </div>
    </Html>
  );
}

export default ScreenshotButton;
