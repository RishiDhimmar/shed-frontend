import { useRef } from "react";
import wallStore from "../stores/WallStore";
import { BACKEND_URL } from "../Constants";
import baseplateStore from "../stores/BasePlateStore";

export const Import = () => {
  const shadeInputRef = useRef<HTMLInputElement | null>(null);
  const baseplateInputRef = useRef<HTMLInputElement | null>(null);

  const handleShadeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("dxfFile", file);

    try {
      const response = await fetch(`${BACKEND_URL}api/upload-dxf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      wallStore.processWallData(data);
      console.log("Parsed Shade DXF Data:", data);
    } catch (error) {
      console.error("Error uploading shade file:", error);
    }
  };

  const handleBaseplateJsonChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const text = await file.text();
      const jsonData = await JSON.parse(text);
  
      // Feed the values into the baseplate store
      if (jsonData.config) {
        baseplateStore.setBasePlateConfig(jsonData.config);
      }
      if (typeof jsonData.idealHorizontalDistance === "number") {
        baseplateStore.setIdealHorizontalDistance(jsonData.idealHorizontalDistance);
      }
      if (typeof jsonData.idealVerticalDistance === "number") {
        baseplateStore.setIdealVerticalDistance(jsonData.idealVerticalDistance);
      }
      if (Array.isArray(jsonData.basePlates)) {
        baseplateStore.setBasePlates(jsonData.basePlates);
      }
      wallStore.generateWallPointsFromBaseplates()
  
      console.log("✅ Baseplate JSON imported:", jsonData);
    } catch (error) {
      console.error("❌ Error parsing baseplate JSON file:", error);
    }
  };
  

  return (
    <div className="w-full">
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={shadeInputRef}
        className="hidden"
        accept=".dxf"
        onChange={handleShadeFileChange}
      />
      <input
        type="file"
        ref={baseplateInputRef}
        className="hidden"
        accept=".json"
        onChange={handleBaseplateJsonChange}
      />

      {/* Buttons */}
      <div className="flex">
        <button
          className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
          onClick={() => shadeInputRef.current?.click()}
        >
          Import Shade 
        </button>
        <button
          className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
          onClick={() => baseplateInputRef.current?.click()}
        >
          Import Baseplate
        </button>
      </div>
    </div>
  );
};
