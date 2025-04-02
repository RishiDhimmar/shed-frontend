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
    <div className="">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        className="bg-white px-3 py-2 rounded-md shadow-md hover:bg-gray-300 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        Import Shade
      </button>
    </div>
  );
};
