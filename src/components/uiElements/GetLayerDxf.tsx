// import React, { useState } from "react";
// import { BACKEND_URL } from "../../Constants";

// function GetLayerDxf() {
//   const [file, setFile] = useState(null);
//   const [layerName, setLayerName] = useState("");
//   const [entities, setEntities] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleExport = async () => {
//     if (!file) {
//       alert("Please upload a DXF file first.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("dxfFile", file);
//     formData.append("layerName", layerName);

//     try {
//       setLoading(true);
//       const response = await fetch(
//         "http://localhost:3000/" + "api/dxf/upload-dxf",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const data = await response.json();
//       if (response.ok) {
//         setEntities(data.entities);
//         console.log("Entities:", data.entities);
//       } else {
//         console.error("Error:", data.error);
//         alert(data.error);
//       }
//     } catch (error) {
//       console.error("Upload failed:", error);
//       alert("Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative w-full space-y-2">
//       <input
//         type="file"
//         accept=".dxf"
//         onChange={(e) => setFile(e.target.files[0])}
//         className="block w-full text-sm text-gray-500"
//       />
//       <input
//         type="text"
//         placeholder="Enter Layer Name (optional)"
//         value={layerName}
//         onChange={(e) => setLayerName(e.target.value)}
//         className="block w-full text-sm p-2 border border-gray-300 rounded"
//       />
//       <button
//         className="bg-gray-800 py-2 text-white rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
//         onClick={handleExport}
//         disabled={loading}
//       >
//         {loading ? "Processing..." : "Export"}
//       </button>
//     </div>
//   );
// }

// export default GetLayerDxf;

// import  { useState } from "react";
// import { observer } from "mobx-react-lite";
// import layerStore from "../../stores/LayerStore";

// const GetLayerDxf = observer(() => {
//   const [file, setFile] = useState<File | null>(null);

//   const handleUpload = () => {
//     if (!file) {
//       alert("Please select a DXF file");
//       return;
//     }
//     layerStore.uploadDxf(file);
//   };

//   return (
//     <div className="relative w-full space-y-2">
//       <input
//         type="file"
//         accept=".dxf"
//         onChange={(e) => setFile(e.target.files?.[0] || null)}
//         className="block w-full text-sm text-gray-500"
//       />
//       <input
//         type="text"
//         placeholder="Enter Layer Name (optional)"
//         value={layerStore.selectedLayer}
//         onChange={(e) => layerStore.setSelectedLayer(e.target.value)}
//         className="block w-full text-sm p-2 border border-gray-300 rounded"
//       />
//       <button
//         className="bg-gray-800 py-2 text-white rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
//         onClick={handleUpload}
//         disabled={layerStore.isLoading}
//       >
//         {layerStore.isLoading ? "Processing..." : "Export"}
//       </button>

//       {layerStore.error && (
//         <p className="text-red-500 text-sm">{layerStore.error}</p>
//       )}
//     </div>
//   );
// });

// export default GetLayerDxf;

import { useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import layerStore from "../../stores/LayerStore";

const GetLayerDxf = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a DXF file before exporting.");
      return;
    }
    layerStore.uploadDxf(file);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 border rounded-lg shadow-sm bg-white">
      <input
        type="file"
        accept=".dxf"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button
        onClick={triggerFileDialog}
        className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 text-sm"
      >
        {file ? `Selected: ${file.name}` : "Select DXF File"}
      </button>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layer Name (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g., Ground Floor"
          value={layerStore.selectedLayer}
          onChange={(e) => layerStore.setSelectedLayer(e.target.value)}
          className="block w-full text-sm p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <button
        className="w-full bg-gray-300  text-sm py-2 rounded hover:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleUpload}
        disabled={layerStore.isLoading}
      >
        {layerStore.isLoading ? "Processing..." : "Upload & Export"}
      </button>

      {layerStore.error && (
        <p className="text-red-600 text-sm">{layerStore.error}</p>
      )}
    </div>
  );
});

export default GetLayerDxf;
