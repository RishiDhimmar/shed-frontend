import { useRef } from "react";
import wallStore from "../stores/WallStore";

export const Import = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("dxfFile", file);

    try {
      const response = await fetch(
        "https://3rdp084j-3000.inc1.devtunnels.ms/api/upload-dxf",
        {
          method: "POST",
          body: formData,
        }
      );

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
    <div className="absolute top-6 right-5 z-10">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Custom button to trigger file input */}
      <button
        className="bg-white px-3 py-2 rounded-md shadow-md hover:bg-gray-300 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        Import Shade
      </button>
    </div>
  );
};
