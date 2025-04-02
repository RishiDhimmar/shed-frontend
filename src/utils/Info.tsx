import { IoMdInformationCircleOutline } from "react-icons/io";
import { useState } from "react";

const Info = () => {
  // State to track if the button is being hovered
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="absolute bottom-10 right-6 z-10">
      {/* Info button */}
      <div
        className="p-1 rounded-full flex items-center  cursor-pointer relative hover:bg-gray-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <IoMdInformationCircleOutline className="w-6 h-6" />
      </div>

      {/* Tooltip: It will be shown when isHovered is true */}
      {isHovered && (
        <div className="absolute top-[-185px] bottom-0 right-full w-[250px] mr-1 whitespace-normal bg-gray-200 text-sm px-2 py-1 rounded z-10 shadow-md mb-2">
          <strong>3D Environment Controls:</strong> <br />
          <hr className="my-1 border-gray-200"></hr>
          <strong>1. Zoom</strong>: Scroll to zoom in or out of the scene.{" "}
          <br /> <strong>2. Pan</strong>: Hold the right mouse button and move
          to pan the view. <br />
          <hr className="my-2 border-gray-300"></hr>
          Adjust your perspective using these controls to explore the
          environment!
        </div>
      )}
    </div>
  );
};

export default Info;
