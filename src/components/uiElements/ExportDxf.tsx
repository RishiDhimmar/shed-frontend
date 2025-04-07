import { toJS } from "mobx";
import React from "react";
import basePlotStore from "../../stores/BasePlotStore";
import wallStore from "../../stores/WallStore";
import baseplateStore from "../../stores/BasePlateStore";
import columnStore from "../../stores/ColumnStore";
import foundationStore from "../../stores/FoundationStore";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { BACKEND_URL } from "../../Constants";

function ExportDxf() {
  const handleExport = async () => {
    try {
      const response = await fetch(BACKEND_URL + "api/generate-dxf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          basePlot: toJS(basePlotStore),
          wall: toJS(wallStore),
          baseplate: toJS(baseplateStore),
          column: toJS(columnStore),
          foundation: toJS(foundationStore),
          mullionColumn: toJS(mullionColumnStore),
          groundBeam: toJS(basePlotStore),
        }),
      });

      if (!response.ok) throw new Error("Failed to export DXF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "shed.dxf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="w-full">
      <button
        className="bg-gray-800 py-2 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
        onClick={handleExport}
      >
        Export DXF
      </button>
    </div>
  );
}

export default ExportDxf;
