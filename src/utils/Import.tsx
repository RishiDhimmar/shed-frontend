import { useState } from "react";
import wallStore from "../stores/WallStore";
import baseplateStore from "../stores/BasePlateStore";
import { BACKEND_URL } from "../Constants";
import processBaseplates from "./processBaseplateDXFData";
import ImportModel from "../components/uiElements/ImportModel";
import { extractAllFromDXF, extractPolygonsFromDXF } from "./DXFUtils";
import uiStore from "../stores/UIStore";
import dxfStore from "../stores/DxfStore";

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
      console.log("Parsed Shade DXF Data:", data);
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
      console.log("✅ Baseplate JSON imported via API:", jsonData);
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
      console.log(jsonData);

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

      console.log("✅ Combined DXF imported via API:", jsonData);
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
  const handleShedBaseplateDxfChange = async (file: File) => {
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

      // const externalWallLines = jsonData.entities.filter(
      //   (line: any) => line.layer === "ExternalWall"
      // );
      // const internalWallLines = jsonData.entities.filter(
      //   (line: any) => line.layer === "InternalWall"
      // );

      // externalWallLines[0].vertices.forEach((vertex: any) => {
      //   vertex.x = vertex.x / 1000;
      //   vertex.y = vertex.y / 1000;
      //   vertex.z = 0;
      // });

      // internalWallLines[0].vertices.forEach((vertex: any) => {
      //   vertex.x = vertex.x / 1000;
      //   vertex.y = vertex.y / 1000;
      //   vertex.z = 0;
      // });

      // wallStore.processWallData({
      //   entities: [externalWallLines[0], internalWallLines[0]],
      // });
      // processBaseplates(jsonData);
      console.log(jsonData)
      const polygons = extractPolygonsFromDXF(jsonData);
      console.log(extractAllFromDXF(jsonData));
      uiStore.data = extractAllFromDXF(jsonData);
      uiStore.setPolygons(polygons);
      console.log(polygons);
      dxfStore.setCandidatePolygons(uiStore.data.polygons);
      // console.log("Polygons:", polygons);

      console.log("✅ Baseplate DXF imported via API:", jsonData);
    } catch (error) {
      console.error("❌ Error uploading baseplate DXF file:", error);
    }
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
