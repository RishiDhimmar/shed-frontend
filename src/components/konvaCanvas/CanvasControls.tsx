import React from "react";
import { BsBorderCenter } from "react-icons/bs";
import { IoCubeOutline } from "react-icons/io5";
import { Tooltip } from "react-tooltip";
import { useCanvasBounds } from "../hooks/useCanvasBounds";
import uiStore from "../../stores/UIStore";
import dxfStore from "../../stores/DxfStore";
import { partitionGroupsByDimension } from "../../utils/PolygonUtils";
import baseplateStore from "../../stores/BasePlateStore";
import { toJS } from "mobx";

interface CanvasControlsProps {
  setIs3D: React.Dispatch<React.SetStateAction<boolean>>;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({ setIs3D }) => {
  const { handleCenterPolygon } = useCanvasBounds();

  const handlePlacingBSP = () => {
    dxfStore.placeBaseplates();
  };

  return (
    <>
      <button
        className="absolute top-2.5 left-2.5 px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
        onClick={handleCenterPolygon}
        data-tooltip-id="center-polygon-tooltip"
        data-tooltip-content="Center on Polygon"
      >
        <BsBorderCenter className="text-2xl" />
      </button>
      <button
        className="absolute top-2.5 left-[4.5rem] px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
        onClick={() => setIs3D((prev) => !prev)}
        data-tooltip-id="3d-view-tooltip"
        data-tooltip-content="Toggle 3D View"
      >
        <IoCubeOutline className="text-2xl" />
      </button>
      <button
        className="absolute bottom-2.5 right-2.5 px-4 py-2 bg-gray-300 text-black border-none rounded cursor-pointer z-50 hover:bg-gray-400"
        onClick={handlePlacingBSP}
        data-tooltip-id="bsp-placing-tooltip"
        data-tooltip-content="Place Baseplates"
      >
        Place Baseplates
      </button>
      <Tooltip id="center-polygon-tooltip" place="top" />
      <Tooltip id="3d-view-tooltip" place="top" />
      <Tooltip id="bsp-placing-tooltip" place="top" />
    </>
  );
};

export default CanvasControls;
