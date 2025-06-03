import { useRef } from "react";
import basePlotStore from "../../../stores/BasePlotStore";
import baseplateStore from "../../../stores/BasePlateStore";
import wallStore from "../../../stores/WallStore";
import columnStore from "../../../stores/ColumnStore";
import foundationStore from "../../../stores/FoundationStore";
import mullionColumnStore from "../../../stores/MullianColumnStore";

export const UploadJson = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text(); // Read file content as text
      const jsonData = JSON.parse(text); // Parse text to JSON

      console.log(jsonData);
    } catch (error) {
      console.error("Error reading JSON file:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileChange}
      />

      <button
        className="bg-white px-3 py-2 rounded-md shadow-md hover:bg-gray-300 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        Import Data
      </button>
    </div>
  );
};
