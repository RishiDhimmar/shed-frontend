import { useRef } from "react";
import basePlotStore from "../stores/BasePlotStore";
import wallStore from "../stores/WallStore";
import baseplateStore from "../stores/BasePlateStore";
import columnStore from "../stores/ColumnStore";
import foundationStore from "../stores/FoundationStore";
import mullionColumnStore from "../stores/MullianColumnStore";
import dxfStore from "../stores/DxfStore";
import { convertToPointObjects } from "./PolygonUtils";
import uiStore from "../stores/UIStore";

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text(); // Read file content as text
      const jsonData = JSON.parse(text); // Parse text to JSON
      console.log("JSON data:", jsonData);

      wallStore.wallThickness = jsonData.wall.wallThickness;
      dxfStore.externalWallPolygon = jsonData.wall.externalWallPoints;
      dxfStore.externalWallPoints = convertToPointObjects(
        jsonData.wall.externalWallPoints
      );
      dxfStore.internalWallPolygon = jsonData.wall.internalWallPoints;

      baseplateStore.groups = jsonData.baseplate.groups;
      // baseplateStore.basePlates = jsonData.baseplate.basePlates;
      baseplateStore.basePlates = jsonData.baseplate.groups.flatMap(
        (group) => group.basePlates
      );

      columnStore.columnInputs = jsonData.column.columnInputs;
      columnStore.polygons = jsonData.column.polygons;
      // columnStore.columns = jsonData.column.columns;
      columnStore.columns = jsonData.column.polygons.flatMap(
        (group) => group.columns
      );

      foundationStore.foundationInputs = jsonData.foundation.foundationInputs;
      // foundationStore.foundations = jsonData.foundation.foundations;
      foundationStore.foundations = jsonData.foundation.groups.flatMap(
        (group) => group.foundations
      );
      foundationStore.groups = jsonData.foundation.groups;
      foundationStore.generateFoundations();

      mullionColumnStore.polygons = jsonData.mullionColumn.polygons;

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
