import { useState } from "react";
import wallStore from "../stores/WallStore";
import baseplateStore from "../stores/BasePlateStore";
import { BACKEND_URL } from "../Constants";
import processBaseplates from "./processBaseplateDXFData";
import ImportModel from "../components/uiElements/ImportModel";

export const Import = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleShadeFileChange = async (file: File) => {
    const formData = new FormData();
    formData.append("dxfFile", file);

    try {
      const response = await fetch(`${BACKEND_URL}api/dxf/upload-dxf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      wallStore.processWallData(data);
      console.log("Parsed Shade DXF Data:", data);
    } catch (error) {
      console.error("Error uploading shade file:", error);
    }
  };

  const handleBaseplateJsonChange = async (file: File) => {
    const formData = new FormData();
    formData.append("dxfFile", file);

    try {
      const response = await fetch(BACKEND_URL + "api/dxf/upload-dxf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const jsonData = await response.json();
      baseplateStore.clearBaseplates();
      wallStore.clearWallData();
      processBaseplates(jsonData);
      console.log("✅ Baseplate JSON imported via API:", jsonData);
    } catch (error) {
      console.error("❌ Error uploading baseplate JSON file:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex">
        <button
          className="bg-gray-800 text-white m-1 p-2 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          Import Files
        </button>

        <ImportModel
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onShadeImport={handleShadeFileChange}
          onBaseplateImport={handleBaseplateJsonChange}
        />
      </div>
    </div>
  );
};
