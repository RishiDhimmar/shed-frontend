import { useRef } from "react";
import wallStore from "../stores/WallStore";
import { BACKEND_URL } from "../Constants";

export const Import = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("dxfFile", file);

    try {
      const response = await fetch(BACKEND_URL + "api/upload-dxf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      wallStore.processWallData(data);
      console.log("Parsed DXF Data:", data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        className=" bg-gray-800 text-white px-3 py-2 rounded shadow-md hover:text-gray-300 cursor-pointer w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        Import Shade
      </button>
    </div>
  );
};
