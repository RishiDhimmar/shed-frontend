import { useRef } from "react";
import basePlotStore from "../stores/BasePlotStore";
import wallStore from "../stores/WallStore";
import baseplateStore from "../stores/BasePlateStore";
import columnStore from "../stores/ColumnStore";
import foundationStore from "../stores/FoundationStore";
import mullionColumnStore from "../stores/MullianColumnStore";

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text(); // Read file content as text
      const jsonData = JSON.parse(text); // Parse text to JSON

      basePlotStore.setLength(jsonData.basePlot.length);
      basePlotStore.setWidth(jsonData.basePlot.width);
      basePlotStore.setPoints(jsonData.basePlot.points);

      wallStore.setWallPoints(
        jsonData.wall.externalWallPoints,
        jsonData.wall.internalWallPoints
      );

      baseplateStore.setBasePlates(jsonData.baseplate.basePlates);
      baseplateStore.setBasePlateConfig(jsonData.baseplate.config);
      baseplateStore.setIdealHorizontalDistance(
        jsonData.baseplate.idealHorizontalDistance
      );
      baseplateStore.setIdealVerticalDistance(
        jsonData.baseplat.e.idealVerticalDistance
      );

      columnStore.setColumns(jsonData.column.columns);
      columnStore.setHorizontalLength(jsonData.column.horizontalLength);
      columnStore.setHorizontalWidth(jsonData.column.horizontalWidth);
      columnStore.setCornerLength(jsonData.column.cornerLength);
      columnStore.setCornerWidth(jsonData.column.cornerWidth);
      columnStore.setVerticalLength(jsonData.column.verticalLength);

      foundationStore.foundations = jsonData.foundation.foundations;
      foundationStore.values = jsonData.foundation.values;

      mullionColumnStore.mullionPositions =
        jsonData.mullionColumn.mullionPositions;

      console.log("Parsed JSON Data:", jsonData); // Log data
    } catch (error) {
      console.error("Error reading JSON file:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />

      <button
        className="bg-gray-300 px-3 py-2 rounded-md shadow-md hover:bg-gray-400 cursor-pointer w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload File
      </button>
    </div>
  );
}
