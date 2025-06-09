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
import { toJS } from "mobx";
import { handleExcelQuantityCalculation } from "./handleExcelQuantityCalculation";
import { items } from "./sheetItems";
import { exportXLSX } from "./exportXlsx";

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

  // const exportXLSX = async () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet("Sheet1");

  //   // Set column widths
  //   sheet.getColumn(1).width = 40; // Particulars
  //   sheet.getColumn(2).width = 10; // Nos
  //   sheet.getColumn(3).width = 10; // Length
  //   sheet.getColumn(4).width = 10; // Breadth
  //   sheet.getColumn(5).width = 10; // Depth
  //   sheet.getColumn(6).width = 15; // Content/Area
  //   sheet.getColumn(7).width = 10; // Unit

  //   let rowIndex = 1;

  //   handleExcelQuantityCalculation();

  //   // Helper function to add item section
  //   const addItemSection = (
  //     itemNo,
  //     date,
  //     particulars,
  //     measurements,
  //     total,
  //     unit
  //   ) => {
  //     // Header
  //     sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
  //     const headerCell = sheet.getCell(`A${rowIndex}`);
  //     headerCell.value = "CPWA-1";
  //     headerCell.font = { bold: true, size: 10 };
  //     headerCell.alignment = { horizontal: "center" };
  //     rowIndex++;

  //     console.log(rowIndex);

  //     sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
  //     const pageCell = sheet.getCell(`A${rowIndex}`);
  //     pageCell.value = `Page No :- ${
  //       itemNo <= 3 ? "02" : itemNo <= 6 ? "04" : "05"
  //     }`;
  //     pageCell.font = { bold: true };
  //     pageCell.alignment = { horizontal: "right" };
  //     rowIndex++;

  //     const dateCell = sheet.getCell(`A${rowIndex}`);
  //     dateCell.value = date;
  //     dateCell.font = { bold: true };
  //     dateCell.alignment = { horizontal: "left" };
  //     rowIndex++;

  //     sheet.mergeCells(`A${rowIndex}:A${rowIndex + 1}`);
  //     const particularsHeader = sheet.getCell(`A${rowIndex}`);
  //     particularsHeader.value = "Particulars";
  //     particularsHeader.font = { bold: true };
  //     particularsHeader.alignment = {
  //       horizontal: "center",
  //       vertical: "middle",
  //     };

  //     sheet.mergeCells(`B${rowIndex}:E${rowIndex}`);
  //     const detailHeader = sheet.getCell(`B${rowIndex}`);
  //     detailHeader.value = "Details of Actual Measurement";
  //     detailHeader.font = { bold: true };
  //     detailHeader.alignment = { horizontal: "center", vertical: "middle" };

  //     sheet.mergeCells(`F${rowIndex}:F${rowIndex + 1}`);
  //     const areaHeader = sheet.getCell(`F${rowIndex}`);
  //     areaHeader.value = "Content/Area";
  //     areaHeader.font = { bold: true };
  //     areaHeader.alignment = { horizontal: "center", vertical: "middle" };

  //     sheet.mergeCells(`G${rowIndex}:G${rowIndex + 1}`);
  //     const unitHeader = sheet.getCell(`G${rowIndex}`);
  //     unitHeader.value = "Unit";
  //     unitHeader.font = { bold: true };
  //     unitHeader.alignment = { horizontal: "center", vertical: "middle" };
  //     rowIndex++;

  //     sheet.getCell(`B${rowIndex}`).value = "No.";
  //     sheet.getCell(`C${rowIndex}`).value = "Length";
  //     sheet.getCell(`D${rowIndex}`).value = "Breadth";
  //     sheet.getCell(`E${rowIndex}`).value = "Depth";
  //     [
  //       sheet.getCell(`B${rowIndex}`),
  //       sheet.getCell(`C${rowIndex}`),
  //       sheet.getCell(`D${rowIndex}`),
  //       sheet.getCell(`E${rowIndex}`),
  //     ].forEach((cell) => {
  //       cell.font = { bold: true };
  //       cell.alignment = { horizontal: "center", vertical: "middle" };
  //     });
  //     rowIndex++;

  //     sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
  //     const itemCell = sheet.getCell(`A${rowIndex}`);
  //     itemCell.value = `Item No :- ${itemNo},`;
  //     itemCell.font = { bold: true };
  //     itemCell.alignment = { horizontal: "left", vertical: "middle" };
  //     sheet.getCell(`G${rowIndex}`).value = unit;
  //     sheet.getCell(`G${rowIndex}`).font = { bold: true };
  //     sheet.getCell(`G${rowIndex}`).alignment = {
  //       horizontal: "center",
  //       vertical: "middle",
  //     };
  //     rowIndex++;

  //     // Add particulars description
  //     sheet.getCell(`A${rowIndex}`).value = particulars;
  //     sheet.getCell(`A${rowIndex}`).font = { bold: true };
  //     rowIndex++;

  //     // Add measurement rows
  //     measurements.forEach((m) => {
  //       sheet.getCell(`A${rowIndex}`).value = m.description || "";
  //       sheet.getCell(`B${rowIndex}`).value = m.nos || "";
  //       sheet.getCell(`C${rowIndex}`).value = m.length || "";
  //       sheet.getCell(`D${rowIndex}`).value = m.breadth || "";
  //       sheet.getCell(`E${rowIndex}`).value = m.depth || "";
  //       sheet.getCell(`F${rowIndex}`).value = m.area || "";
  //       rowIndex++;
  //     });

  //     // Add empty row
  //     rowIndex++;

  //     // Add total row
  //     sheet.mergeCells(`D${rowIndex}:E${rowIndex}`);
  //     const totalLabelCell = sheet.getCell(`D${rowIndex}`);
  //     totalLabelCell.value = "Total";
  //     totalLabelCell.font = { bold: true };
  //     totalLabelCell.alignment = { horizontal: "center", vertical: "middle" };

  //     const totalValueCell = sheet.getCell(`F${rowIndex}`);
  //     totalValueCell.value = total;
  //     totalValueCell.font = { bold: true };
  //     totalValueCell.alignment = { horizontal: "right", vertical: "middle" };

  //     const unitCell = sheet.getCell(`G${rowIndex}`);
  //     unitCell.value = unit;
  //     unitCell.font = { bold: true };
  //     unitCell.alignment = { horizontal: "center", vertical: "middle" };
  //     rowIndex++;

  //     // Add signature row
  //     sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
  //     const signCell = sheet.getCell(`A${rowIndex}`);
  //     signCell.value =
  //       "Measurement Recorded by Contractor or Authorised Representative with dated sign";
  //     signCell.alignment = { horizontal: "center" };
  //     rowIndex += 2;
  //   };

  //   // Data for all items
  //   // const items = [
  //   //   {
  //   //     itemNo: 1,
  //   //     date: "20/02/2018",
  //   //     particulars: "EXCAVATION upto 8' depth from N.G.L",
  //   //     measurements: [],
  //   //     total: 0.0,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 2,
  //   //     date: "20/02/2018",
  //   //     particulars: "RUBBLE SOLLING at plinth lvl",
  //   //     measurements: [
  //   //       {
  //   //         description: "soling for grade slab",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 21.23,
  //   //         depth: 0.2,
  //   //         area: 219.09,
  //   //       },
  //   //     ],
  //   //     total: 219.09,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 3,
  //   //     date: "20/02/2018",
  //   //     particulars: "450mm dia Pile - 7 mt depth from FGL - labour for pile",
  //   //     measurements: [
  //   //       {
  //   //         description: "doble pile",
  //   //         nos: 2,
  //   //         length: 28.0,
  //   //         depth: 7.0,
  //   //         area: 392.0,
  //   //       },
  //   //       {
  //   //         description: "single pile",
  //   //         nos: 1,
  //   //         length: 9.0,
  //   //         depth: 7.0,
  //   //         area: 63.0,
  //   //       },
  //   //       {
  //   //         description: "tripal pile",
  //   //         nos: 3,
  //   //         length: 8.0,
  //   //         depth: 7.0,
  //   //         area: 168.0,
  //   //       },
  //   //     ],
  //   //     total: 623.0,
  //   //     unit: "rmt",
  //   //   },
  //   //   {
  //   //     itemNo: 4,
  //   //     date: "15/03/2023",
  //   //     particulars: "PCC - M10 grade - (1:3:6)",
  //   //     measurements: [
  //   //       {
  //   //         description: "PCC for GB horizontal",
  //   //         nos: 8,
  //   //         length: 21.23,
  //   //         breadth: 0.38,
  //   //         depth: 0.1,
  //   //         area: 6.454,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 4,
  //   //         length: 5.5,
  //   //         breadth: 0.38,
  //   //         depth: 0.1,
  //   //         area: 0.836,
  //   //       },
  //   //       {
  //   //         description: "vartical",
  //   //         nos: 8,
  //   //         length: 5.7,
  //   //         breadth: 0.38,
  //   //         depth: 0.1,
  //   //         area: 1.733,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 8,
  //   //         length: 5.7,
  //   //         breadth: 0.38,
  //   //         depth: 0.1,
  //   //         area: 1.733,
  //   //       },
  //   //       {
  //   //         description: "intarnal vertical",
  //   //         nos: 11,
  //   //         length: 5.7,
  //   //         breadth: 0.38,
  //   //         depth: 0.1,
  //   //         area: 2.383,
  //   //       },
  //   //       {
  //   //         description: "Shed area PCC for trimix",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 21.23,
  //   //         depth: 0.1,
  //   //         area: 109.55,
  //   //       },
  //   //     ],
  //   //     total: 122.68,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 5,
  //   //     date: "28/02/2018",
  //   //     particulars: "Back filling with available excavated earth",
  //   //     measurements: [],
  //   //     total: 0.0,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 6,
  //   //     date: "28/02/2018",
  //   //     particulars: "Filling with good soil brought from outiside",
  //   //     measurements: [
  //   //       {
  //   //         description: "",
  //   //         nos: 0,
  //   //         length: 51.6,
  //   //         breadth: 21.23,
  //   //         depth: 0.15,
  //   //         area: 0.0,
  //   //       },
  //   //     ],
  //   //     total: 0.0,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 7,
  //   //     date: "15/03/2023",
  //   //     particulars: "M25 concrete for Pile - 6.4 mt length",
  //   //     measurements: [
  //   //       {
  //   //         description: "double pile",
  //   //         nos: 8,
  //   //         length: 7.0,
  //   //         breadth: 0.16,
  //   //         depth: 6.4,
  //   //         area: 56.97,
  //   //       },
  //   //       {
  //   //         description: "single",
  //   //         nos: 1,
  //   //         length: 9.0,
  //   //         breadth: 0.16,
  //   //         depth: 6.4,
  //   //         area: 9.16,
  //   //       },
  //   //       {
  //   //         description: "tripal pile",
  //   //         nos: 3,
  //   //         length: 8.0,
  //   //         breadth: 0.16,
  //   //         depth: 6.4,
  //   //         area: 24.42,
  //   //       },
  //   //     ],
  //   //     total: 90.55,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 8,
  //   //     date: "15/03/2023",
  //   //     particulars:
  //   //       "RCC ground beam and pile cap- M25 grade (Including formwork)",
  //   //     measurements: [
  //   //       {
  //   //         description: "horizontal",
  //   //         nos: 8,
  //   //         length: 21.23,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 17.578,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 4,
  //   //         length: 5.5,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 2.277,
  //   //       },
  //   //       {
  //   //         description: "vartical",
  //   //         nos: 8,
  //   //         length: 5.7,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 4.72,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 8,
  //   //         length: 5.7,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 4.72,
  //   //       },
  //   //       {
  //   //         description: "intarnal vertical",
  //   //         nos: 11,
  //   //         length: 5.7,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 6.489,
  //   //       },
  //   //       {
  //   //         description: "pile cap double",
  //   //         nos: 28,
  //   //         length: 2.0,
  //   //         breadth: 0.6,
  //   //         depth: 0.75,
  //   //         area: 25.2,
  //   //       },
  //   //       {
  //   //         description: "single",
  //   //         nos: 9,
  //   //         length: 0.6,
  //   //         breadth: 0.45,
  //   //         depth: 0.6,
  //   //         area: 1.46,
  //   //       },
  //   //       {
  //   //         description: "tripal",
  //   //         nos: 8,
  //   //         length: 3.0,
  //   //         breadth: 0.6,
  //   //         depth: 0.75,
  //   //         area: 10.8,
  //   //       },
  //   //     ],
  //   //     total: 73.24,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 9,
  //   //     date: "15/03/2023",
  //   //     particulars:
  //   //       "RCC column from plinth lvl to 1st slab (4.2mt ht)- M25 grade (Including formwork)",
  //   //     measurements: [
  //   //       {
  //   //         description: "C1",
  //   //         nos: 4,
  //   //         length: 0.3,
  //   //         breadth: 0.6,
  //   //         depth: 3.75,
  //   //         area: 2.7,
  //   //       },
  //   //       {
  //   //         description: "C2",
  //   //         nos: 14,
  //   //         length: 0.38,
  //   //         breadth: 0.38,
  //   //         depth: 3.75,
  //   //         area: 7.58,
  //   //       },
  //   //       {
  //   //         description: "C3",
  //   //         nos: 4,
  //   //         length: 0.38,
  //   //         breadth: 0.6,
  //   //         depth: 3.75,
  //   //         area: 3.42,
  //   //       },
  //   //       {
  //   //         description: "C4",
  //   //         nos: 4,
  //   //         length: 0.38,
  //   //         breadth: 0.6,
  //   //         depth: 3.75,
  //   //         area: 3.42,
  //   //       },
  //   //       {
  //   //         description: "C5",
  //   //         nos: 4,
  //   //         length: 0.38,
  //   //         breadth: 0.6,
  //   //         depth: 3.75,
  //   //         area: 3.42,
  //   //       },
  //   //       {
  //   //         description: "C6",
  //   //         nos: 6,
  //   //         length: 0.38,
  //   //         breadth: 0.6,
  //   //         depth: 3.75,
  //   //         area: 5.13,
  //   //       },
  //   //     ],
  //   //     total: 25.67,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 10,
  //   //     date: "15/03/2023",
  //   //     particulars:
  //   //       "RCC column and beam for dome above 1st slab (4.2mt ht)- M25 grade (Including formwork)",
  //   //     measurements: [
  //   //       {
  //   //         description: "peripherial column only",
  //   //         nos: 22,
  //   //         length: 0.3,
  //   //         breadth: 0.6,
  //   //         depth: 3.0,
  //   //         area: 11.88,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 51.64,
  //   //         breadth: 0.23,
  //   //         depth: 1.15,
  //   //         area: 13.66,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 51.64,
  //   //         breadth: 0.23,
  //   //         depth: 0.7,
  //   //         area: 8.31,
  //   //       },
  //   //     ],
  //   //     total: 33.85,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 11,
  //   //     date: "15/03/2023",
  //   //     particulars: "Trimix - M25 Grade concrete",
  //   //     measurements: [
  //   //       {
  //   //         description: "Trimix",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 21.23,
  //   //         depth: 0.15,
  //   //         area: 164.32,
  //   //       },
  //   //     ],
  //   //     total: 164.32,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 12,
  //   //     date: "15/03/2023",
  //   //     particulars: "Trimix - labour only with groove/cutting",
  //   //     measurements: [
  //   //       {
  //   //         description: "Trimix",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 21.23,
  //   //         area: 1095.47,
  //   //       },
  //   //     ],
  //   //     total: 1095.47,
  //   //     unit: "smt",
  //   //   },
  //   //   {
  //   //     itemNo: 13,
  //   //     date: "15/03/2023",
  //   //     particulars:
  //   //       "Brick work below plinth and from plinth to 1st slab of 4.2 mt ht",
  //   //     measurements: [
  //   //       {
  //   //         description: "brick below plinth",
  //   //         nos: 2,
  //   //         length: 51.6,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 10.68,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 2,
  //   //         length: 21.23,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 4.39,
  //   //       },
  //   //       {
  //   //         description: "brick above plinth",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 0.23,
  //   //         depth: 3.75,
  //   //         area: 44.51,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 0.23,
  //   //         depth: 2.85,
  //   //         area: 33.82,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 2,
  //   //         length: 16.8,
  //   //         breadth: 0.23,
  //   //         depth: 3.75,
  //   //         area: 28.98,
  //   //       },
  //   //       {
  //   //         description: "compound",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 0.23,
  //   //         depth: 1.12,
  //   //         area: 13.29,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 21.5,
  //   //         breadth: 0.23,
  //   //         depth: 1.12,
  //   //         area: 5.54,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 11.5,
  //   //         breadth: 0.23,
  //   //         depth: 1.12,
  //   //         area: 2.96,
  //   //       },
  //   //       {
  //   //         description: "toilet wall",
  //   //         nos: 3,
  //   //         length: 1.5,
  //   //         breadth: 0.23,
  //   //         depth: 3.0,
  //   //         area: 3.11,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 5.0,
  //   //         breadth: 0.23,
  //   //         depth: 3.0,
  //   //         area: 3.45,
  //   //       },
  //   //     ],
  //   //     total: 150.73,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 14,
  //   //     date: "15/03/2023",
  //   //     particulars: "RCC for beam and slab at 4.2 mt lvl - M 25 grade",
  //   //     measurements: [
  //   //       {
  //   //         description: "horizontal",
  //   //         nos: 7,
  //   //         length: 16.5,
  //   //         breadth: 0.38,
  //   //         depth: 0.45,
  //   //         area: 19.75,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 16.5,
  //   //         breadth: 0.23,
  //   //         depth: 0.6,
  //   //         area: 2.28,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 16.5,
  //   //         breadth: 0.3,
  //   //         depth: 0.6,
  //   //         area: 2.97,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 16.5,
  //   //         breadth: 0.35,
  //   //         depth: 0.6,
  //   //         area: 3.47,
  //   //       },
  //   //       {
  //   //         description: "vertical",
  //   //         nos: 7,
  //   //         length: 40.0,
  //   //         breadth: 0.23,
  //   //         depth: 0.45,
  //   //         area: 28.98,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 7,
  //   //         length: 9.3,
  //   //         breadth: 0.23,
  //   //         depth: 0.6,
  //   //         area: 8.98,
  //   //       },
  //   //       {
  //   //         description: "slab",
  //   //         nos: 1,
  //   //         length: 49.5,
  //   //         breadth: 16.8,
  //   //         depth: 0.23,
  //   //         area: 187.11,
  //   //       },
  //   //     ],
  //   //     total: 253.54,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 15,
  //   //     date: "15/03/2023",
  //   //     particulars: "plaster inner and outer upto 1st slab lvl (double coat)",
  //   //     measurements: [
  //   //       {
  //   //         description: "brick above plinth",
  //   //         nos: 2,
  //   //         length: 51.6,
  //   //         depth: 3.75,
  //   //         area: 387.0,
  //   //       },
  //   //       { description: "", nos: 2, length: 51.6, depth: 2.85, area: 294.12 },
  //   //       { description: "", nos: 4, length: 16.8, depth: 3.75, area: 252.0 },
  //   //       {
  //   //         description: "compound",
  //   //         nos: 2,
  //   //         length: 51.6,
  //   //         depth: 1.12,
  //   //         area: 115.58,
  //   //       },
  //   //       { description: "", nos: 2, length: 21.5, depth: 1.12, area: 48.16 },
  //   //       { description: "", nos: 2, length: 11.5, depth: 1.12, area: 25.76 },
  //   //       {
  //   //         description: "toilet wall",
  //   //         nos: 6,
  //   //         length: 1.5,
  //   //         depth: 3.0,
  //   //         area: 27.0,
  //   //       },
  //   //       { description: "", nos: 2, length: 5.0, depth: 3.0, area: 30.0 },
  //   //       {
  //   //         description: "ceiling plaster",
  //   //         nos: 1,
  //   //         length: 49.3,
  //   //         breadth: 16.8,
  //   //         area: 828.24,
  //   //       },
  //   //     ],
  //   //     total: 2007.86,
  //   //     unit: "smt",
  //   //   },
  //   //   {
  //   //     itemNo: 16,
  //   //     date: "15/03/2023",
  //   //     particulars: "Brick work from 1st slab to gutter lvl",
  //   //     measurements: [
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 51.64,
  //   //         breadth: 0.23,
  //   //         depth: 3.0,
  //   //         area: 35.63,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 51.64,
  //   //         breadth: 0.23,
  //   //         depth: 1.95,
  //   //         area: 23.16,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 2,
  //   //         length: 16.8,
  //   //         breadth: 0.23,
  //   //         depth: 3.0,
  //   //         area: 23.18,
  //   //       },
  //   //     ],
  //   //     total: 81.98,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 17,
  //   //     date: "15/03/2023",
  //   //     particulars:
  //   //       "M25 concrte for Coping beam/lintel beam above brick work and gutter",
  //   //     measurements: [
  //   //       {
  //   //         description: "brick above plinth",
  //   //         nos: 2,
  //   //         length: 51.6,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 3.56,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 2,
  //   //         length: 51.6,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 3.56,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 4,
  //   //         length: 16.8,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 2.32,
  //   //       },
  //   //       {
  //   //         description: "compound",
  //   //         nos: 2,
  //   //         length: 51.6,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 3.56,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 2,
  //   //         length: 21.5,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 1.48,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 2,
  //   //         length: 11.5,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 0.79,
  //   //       },
  //   //       {
  //   //         description: "toilet wall",
  //   //         nos: 3,
  //   //         length: 1.5,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 0.16,
  //   //       },
  //   //       {
  //   //         description: "",
  //   //         nos: 1,
  //   //         length: 5.0,
  //   //         breadth: 0.23,
  //   //         depth: 0.15,
  //   //         area: 0.17,
  //   //       },
  //   //       {
  //   //         description: "gutter",
  //   //         nos: 2,
  //   //         length: 51.64,
  //   //         breadth: 1.2,
  //   //         depth: 0.15,
  //   //         area: 18.59,
  //   //       },
  //   //     ],
  //   //     total: 34.19,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 18,
  //   //     date: "15/03/2023",
  //   //     particulars: "steel - Fe500",
  //   //     measurements: [
  //   //       {
  //   //         description: "plinth area",
  //   //         nos: 1,
  //   //         length: 51.6,
  //   //         breadth: 21.23,
  //   //         depth: 16.14,
  //   //         area: 17680.85,
  //   //       },
  //   //       {
  //   //         description: "Slab area",
  //   //         nos: 1,
  //   //         length: 49.3,
  //   //         breadth: 16.8,
  //   //         depth: 26.9,
  //   //         area: 22279.66,
  //   //       },
  //   //     ],
  //   //     total: 39960.51,
  //   //     unit: "Kg",
  //   //   },
  //   //   {
  //   //     itemNo: 19,
  //   //     date: "15/03/2023",
  //   //     particulars: "U.G. water tank - RCC as per design",
  //   //     measurements: [],
  //   //     total: 0.0,
  //   //     unit: "Lit",
  //   //   },
  //   //   {
  //   //     itemNo: 20,
  //   //     date: "15/03/2023",
  //   //     particulars: "Over head water tank (PVC)",
  //   //     measurements: [],
  //   //     total: 0.0,
  //   //     unit: "Lit",
  //   //   },
  //   //   {
  //   //     itemNo: 21,
  //   //     date: "15/03/2023",
  //   //     particulars: "GP2 grout",
  //   //     measurements: [],
  //   //     total: 0.0,
  //   //     unit: "cft",
  //   //   },
  //   //   {
  //   //     itemNo: 22,
  //   //     date: "15/03/2023",
  //   //     particulars: "Slab at 3 mt height M 25 grade concrete",
  //   //     measurements: [
  //   //       {
  //   //         description: "vertical",
  //   //         nos: 7,
  //   //         length: 3.1,
  //   //         breadth: 0.23,
  //   //         depth: 0.6,
  //   //         area: 4.99,
  //   //       },
  //   //       {
  //   //         description: "horizonatal",
  //   //         nos: 2,
  //   //         length: 21.23,
  //   //         breadth: 0.23,
  //   //         depth: 0.6,
  //   //         area: 9.77,
  //   //       },
  //   //       {
  //   //         description: "Slab area",
  //   //         nos: 1,
  //   //         length: 21.23,
  //   //         breadth: 3.1,
  //   //         depth: 0.15,
  //   //         area: 65.81,
  //   //       },
  //   //     ],
  //   //     total: 80.57,
  //   //     unit: "cmt",
  //   //   },
  //   //   {
  //   //     itemNo: 23,
  //   //     date: "15/03/2023",
  //   //     particulars:
  //   //       "toilet/wash room at gr floor including flooring+dedo+urinal+WC+wash basin otheer fiiting",
  //   //     measurements: [
  //   //       { description: "", nos: 3, length: 1.05, breadth: 1.09, area: 3.42 },
  //   //       { description: "", nos: 1, length: 1.2, breadth: 1.09, area: 1.3 },
  //   //       { description: "", nos: 1, length: 3.7, breadth: 1.5, area: 5.55 },
  //   //     ],
  //   //     total: 10.27,
  //   //     unit: "smt",
  //   //   },
  //   //   {
  //   //     itemNo: 25,
  //   //     date: "15/03/2023",
  //   //     particulars: "electric work toilet/wash room at gr floor",
  //   //     measurements: [],
  //   //     total: 0.0,
  //   //     unit: "sft",
  //   //   },
  //   //   {
  //   //     itemNo: 26,
  //   //     date: "15/03/2023",
  //   //     particulars: "Khar kuva and septic tank in brick work",
  //   //     measurements: [{ description: "", nos: 1, area: 1.0 }],
  //   //     total: 1.0,
  //   //     unit: "no",
  //   //   },
  //   // ];

  //   // Add all items to the sheet
  //   items.forEach((item) => {
  //     addItemSection(
  //       item.itemNo,
  //       item.date,
  //       item.particulars,
  //       item.measurements,
  //       item.total,
  //       item.unit
  //     );
  //   });

  //   // Export to blob
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   const url = window.URL.createObjectURL(blob);

  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "CPWA-1_Measurements.xlsx";
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

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
