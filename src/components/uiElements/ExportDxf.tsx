import { useState } from "react";
import { toJS } from "mobx";
import basePlotStore from "../../stores/BasePlotStore";
import wallStore from "../../stores/WallStore";
import baseplateStore from "../../stores/BasePlateStore";
import columnStore from "../../stores/ColumnStore";
import foundationStore from "../../stores/FoundationStore";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { BACKEND_URL } from "../../Constants";
import uiStore from "../../stores/UIStore";
import { observer } from "mobx-react-lite";
import dxfStore from "../../stores/DxfStore";

const ExportMenu = observer(() => {
  const [showOptions, setShowOptions] = useState(false);

  // const handleExportDXF = async () => {
  //   try {
  //     const response = await fetch(BACKEND_URL + "api/dxf/generate-dxf", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         basePlot: toJS(basePlotStore),
  //         wall: toJS(wallStore),
  //         baseplate: toJS(baseplateStore),
  //         column: toJS(columnStore),
  //         foundation: toJS(foundationStore),
  //         mullionColumn: toJS(mullionColumnStore),
  //         groundBeam: toJS(basePlotStore),
  //       }),
  //     });

  //     if (!response.ok) throw new Error("Failed to export DXF");

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "shed.dxf";
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Export failed:", error);
  //   }
  // };

  const handleExportDXF = async () => {
    try {
      const payload: Record<string, any> = {};

      if (uiStore.visibility.plot) {
        payload.basePlot = toJS(basePlotStore);
      }
      if (uiStore.visibility.shade) {
        // Add shade store if available
        payload.wall = toJS(wallStore);
      }
      if (uiStore.visibility.baseplate) {
        payload.baseplate = toJS(baseplateStore);
      }
      if (uiStore.visibility.column) {
        payload.column = toJS(columnStore);
      }
      if (uiStore.visibility.foundation) {
        payload.foundation = toJS(foundationStore);
      }
      if (uiStore.visibility.mullionColumn) {
        payload.mullionColumn = toJS(mullionColumnStore);
      }
      if (uiStore.visibility.groundBeam) {
        payload.groundBeam = toJS(basePlotStore); // Assuming you meant a different store here?
      }

      // payload.dxfData = toJS(dxfStore);
      payload.dxfData = {
        data: {
          curves: uiStore.visibility.circles ? toJS(dxfStore.data.curves) : [],
          lines: uiStore.visibility.lines ? toJS(dxfStore.data.lines) : [],
          polygons: uiStore.visibility.polygons
            ? toJS(dxfStore.data.polygons)
            : [],
        },
      };

      console.log(payload);
      const response = await fetch(BACKEND_URL + "api/dxf/generate-dxf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    <div className="relative w-full">
      <button
        className="bg-gray-800 py-2 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
        onClick={() => setShowOptions((prev) => !prev)}
      >
        Export
      </button>

      {showOptions && (
        <div className="absolute bg-white border border-gray-300 rounded shadow-md top-full mt-1 left-0 w-full z-10">
          <button
            className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 text-sm"
            onClick={() => {
              setShowOptions(false);
              handleExportDXF();
            }}
          >
            Export as DXF
          </button>
          <button
            className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 text-sm"
            onClick={() => {
              const temp: void | (() => void) = uiStore.pdfExportFn();
              if (typeof temp === "function") {
                (temp as () => void)();
              }
              setShowOptions(false);
            }}
          >
            Export as PDF
          </button>
          <button
            className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 text-sm"
            onClick={() => {
              const temp: void | (() => void) = uiStore.screenshotFn();
              if (typeof temp === "function") {
                (temp as () => void)();
              }
              setShowOptions(false);
            }}
          >
            Export as PNG
          </button>
        </div>
      )}
    </div>
  );
});
export default ExportMenu;
