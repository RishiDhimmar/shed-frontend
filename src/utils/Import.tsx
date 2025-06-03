import { useState } from "react";
import wallStore from "../stores/WallStore";
import baseplateStore from "../stores/BasePlateStore";
import { BACKEND_URL } from "../Constants";
import processBaseplates from "./processBaseplateDXFData";
import ImportModel from "../components/uiElements/ImportModel";
import { extractAllFromDXF, extractPolygonsFromDXF } from "./DXFUtils";
import uiStore from "../stores/UIStore";
import dxfStore from "../stores/DxfStore";
import DxfParser from "dxf-parser";
import { IoSaveSharp } from "react-icons/io5";
import columnStore from "../stores/ColumnStore";
import foundationStore from "../stores/FoundationStore";
import mullionColumnStore from "../stores/MullianColumnStore";
import { Helper } from "dxf";
import { button } from "leva";
import { BsFiletypeXlsx } from "react-icons/bs";
// import * as XLSX from "xlsx";
// import XLSX from "xlsx-style";
import ExcelJS from "exceljs";

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
    } catch (error) {
      console.error("❌ Error uploading baseplate JSON file:", error);
    }
  };
  {
    /* ...
    const handleCombinedFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("dxfFile", file);

    try {
      const response = await fetch(BACKEND_URL + "api/dxf/upload-dxf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();

      // Clean up previous data
      baseplateStore.clearBaseplates();
      wallStore.clearWallData();

      const externalWallLines = jsonData.entities.filter((line: any) => line.layer === "ExternalWall");
      const internalWallLines = jsonData.entities.filter((line: any) => line.layer === "InternalWall");

      externalWallLines[0].vertices.forEach((vertex: any) => {
        vertex.x = vertex.x / 1000;
        vertex.y = vertex.y / 1000;
        vertex.z = 0;
      });

      internalWallLines[0].vertices.forEach((vertex: any) => {
        vertex.x = vertex.x / 1000;
        vertex.y = vertex.y / 1000;
        vertex.z = 0;
      });

      wallStore.processWallData({entities : [ externalWallLines[0], internalWallLines[0] ]});
      processBaseplates(jsonData);

    } catch (error) {
      console.error("❌ Error uploading combined DXF file:", error);
    } finally {
      if (combinedInputRef.current) {
        combinedInputRef.current.value = "";
      }
    }
     */
  }

  // const handleShedBaseplateDxfChange = async (file: File) => {
  const handleShedBaseplateDxfChange = async (
    file: File,
    layerName?: string
  ) => {
    try {
      // Read the file as text
      const fileText = await file.text();

      // Initialize the DXF parser
      const parser = new DxfParser();

      // Parse the DXF file
      const dxfResult = parser.parseSync(fileText);

      console.log(dxfResult);

      if (!dxfResult || !dxfResult.entities) {
        throw new Error("No entities found in uploaded DXF file");
      }

      // Prepare the JSON data similar to the backend response
      let jsonData = {
        entities: dxfResult.entities || [],
        blocks: dxfResult.blocks || {},
      };

      // Process the parsed data as before
      baseplateStore.clearBaseplates();
      wallStore.clearWallData();

      // console.log(new Helper(fileText).parsed);
      // jsonData = new Helper(fileText).parsed;

      const polygons = extractPolygonsFromDXF(jsonData);
      uiStore.data = extractAllFromDXF(jsonData);
      uiStore.setPolygons(polygons);
      dxfStore.data = uiStore.data;
      dxfStore.setCandidatePolygons(uiStore.data.polygons);
    } catch (error) {
      console.error("❌ Error parsing DXF file:", error);
    }
  };
  const handleSaveProject = async () => {
    const jsonData = {
      projectName: uiStore.projectName,
      location: uiStore.location,
      customerName: uiStore.customerName,
      logo: uiStore.logoUrl,
      wall: {
        wallThickness: wallStore.wallThickness,
        externalWallPoints: dxfStore.externalWallPolygon,
        internalWallPoints: dxfStore.internalWallPolygon,
      },
      baseplate: {
        groups: baseplateStore.groups,
        basePlates: baseplateStore.basePlates,
      },
      column: {
        columnInputs: columnStore.columnInputs,
        polygons: columnStore.polygons,
      },
      foundation: {
        foundationInputs: foundationStore.foundationInputs,
        groups: foundationStore.groups,
      },
      mullionColumn: {
        polygons: mullionColumnStore.polygons,
      },
      groundBeam: {
        polygons: [],
      },
      assignedUsers: [
        // Add valid Cognito user sub(s) here
        "e09c993c-f0a1-7012-7689-f363acf1a7ae",
      ],
      createdBy: "e09c993c-f0a1-7012-7689-f363acf1a7ae",
    };

    try {
      const response = await fetch("http://localhost:3000/proje++cts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${data?.message}`
        );
      }

      console.log("✅ Project saved:", data);
    } catch (error) {
      console.error("❌ Error saving project:", error);
    }
  };

  const exportXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");

    // Merge A1 and B1
    sheet.mergeCells("A1:B1");

    const firstColumn = sheet.getColumn(1);
    firstColumn.width = 50;

    // Add header row with styling
    const headerCell = sheet.getCell("A1");
    headerCell.value = "Name & Age";
    headerCell.font = { bold: true, size: 40 };
    headerCell.alignment = { horizontal: "left", vertical: "middle" };

    const cityHeader = sheet.getCell("C1");
    cityHeader.value = "City";
    cityHeader.font = { bold: true };
    cityHeader.alignment = { horizontal: "center" };

    // Add data
    const data = [
      ["Alice", 30, "New York"],
      ["Bob", 25, "Los Angeles"],
      ["Charlie", 28, "Chicago"],
    ];

    data.forEach((row, idx) => {
      sheet.addRow(row);
    });

    // Export to blob (browser)
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "styled.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
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
        <button
          className="bg-gray-800 text-white m-1 p-2 rounded shadow-md hover:bg-gray-600 cursor-pointer"
          onClick={handleSaveProject}
        >
          <IoSaveSharp />
        </button>
        <button
          className="bg-gray-800 text-white m-1 p-2 rounded shadow-md hover:bg-gray-600 cursor-pointer"
          onClick={exportXLSX}
        >
          <BsFiletypeXlsx />
        </button>

        <ImportModel
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onShadeImport={handleShadeFileChange}
          onBaseplateImport={handleBaseplateJsonChange}
          onShedBaseplateImport={handleShedBaseplateDxfChange}
        />
      </div>
    </div>
  );
};
