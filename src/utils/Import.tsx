// // import { useRef } from "react";
// // import wallStore from "../stores/WallStore";
// // import { BACKEND_URL } from "../Constants";
// // import baseplateStore from "../stores/BasePlateStore";
// // import processBaseplates from "./processBaseplateDXFData";

// // export const Import = () => {
// //   const shadeInputRef = useRef<HTMLInputElement | null>(null);
// //   const baseplateInputRef = useRef<HTMLInputElement | null>(null);

// //   const handleShadeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!e.target.files) return;
// //     const file = e.target.files[0];
// //     if (!file) return;

// //     const formData = new FormData();
// //     formData.append("dxfFile", file);

// //     try {
// //       const response = await fetch(`${BACKEND_URL}api/dxf/upload-dxf`, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }

// //       const data = await response.json();
// //       wallStore.processWallData(data);
// //       console.log("Parsed Shade DXF Data:", data);
// //     } catch (error) {
// //       console.error("Error uploading shade file:", error);
// //     }
// //   };

// //   const handleBaseplateJsonChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!e.target.files) return;
// //     const file = e.target.files[0];
// //     if (!file) return;

// //     const formData = new FormData();
// //     formData.append("dxfFile", file);

// //     try {
// //       const response = await fetch(
// //        BACKEND_URL + "api/dxf/upload-dxf",
// //         {
// //           method: "POST",
// //           body: formData,
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }

// //       const jsonData = await response.json();
// //       console.log(jsonData);

// //       // Clean up previous baseplates
// //       baseplateStore.clearBaseplates(); // ✅ clear the previous baseplates before processing
// //       wallStore.clearWallData();        // ✅ if needed, clear walls too

// //       processBaseplates(jsonData);

// //       console.log("✅ Baseplate JSON imported via API:", jsonData);
// //     } catch (error) {
// //       console.error("❌ Error uploading baseplate JSON file:", error);
// //     } finally {
// //       // reset file input
// //       if (baseplateInputRef.current) {
// //         baseplateInputRef.current.value = "";
// //       }
// //     }
// //   };

// //   return (
// //     <div className="w-full">
// //       {/* Hidden Inputs */}
// //       <input
// //         type="file"
// //         ref={shadeInputRef}
// //         className="hidden"
// //         accept=".dxf"
// //         onChange={handleShadeFileChange}
// //       />
// //       <input
// //         type="file"
// //         ref={baseplateInputRef}
// //         className="hidden"
// //         accept=".dxf"
// //         onChange={handleBaseplateJsonChange}
// //       />

// //       {/* Buttons */}
// //       <div className="flex">
// //         <button
// //           className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
// //           onClick={() => shadeInputRef.current?.click()}
// //         >
// //           Import Shade
// //         </button>
// //         <button
// //           className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
// //           onClick={() => baseplateInputRef.current?.click()}
// //         >
// //           Import Baseplate
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// import { useRef } from "react";
// import wallStore from "../stores/WallStore";
// import { BACKEND_URL } from "../Constants";
// import baseplateStore from "../stores/BasePlateStore";
// import processBaseplates from "./processBaseplateDXFData";

// export const Import = () => {
//   const shadeInputRef = useRef<HTMLInputElement | null>(null);
//   const baseplateInputRef = useRef<HTMLInputElement | null>(null);
//   const combinedInputRef = useRef<HTMLInputElement | null>(null); // Ref for combined DXF file

//   const handleShadeFileChange = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (!e.target.files) return;
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("dxfFile", file);

//     try {
//       const response = await fetch(`${BACKEND_URL}api/dxf/upload-dxf`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();
//       wallStore.processWallData(data);
//       console.log("Parsed Shade DXF Data:", data);
//     } catch (error) {
//       console.error("Error uploading shade file:", error);
//     }
//   };

//   const handleBaseplateJsonChange = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (!e.target.files) return;
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("dxfFile", file);

//     try {
//       const response = await fetch(BACKEND_URL + "api/dxf/upload-dxf", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const jsonData = await response.json();
//       console.log(jsonData);

//       // Clean up previous baseplates
//       baseplateStore.clearBaseplates(); // ✅ clear the previous baseplates before processing
//       wallStore.clearWallData(); // ✅ if needed, clear walls too

//       processBaseplates(jsonData);

//       console.log("✅ Baseplate JSON imported via API:", jsonData);
//     } catch (error) {
//       console.error("❌ Error uploading baseplate JSON file:", error);
//     } finally {
//       // reset file input
//       if (baseplateInputRef.current) {
//         baseplateInputRef.current.value = "";
//       }
//     }
//   };

//   const handleCombinedFileChange = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (!e.target.files) return;
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("dxfFile", file);

//     try {
//       const response = await fetch(BACKEND_URL + "api/dxf/upload-dxf", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const jsonData = await response.json();
//       console.log(jsonData);

//       // Clean up previous data
//       baseplateStore.clearBaseplates();
//       wallStore.clearWallData();

//       // Process both baseplates and shed data from the combined file
//       processBaseplates(jsonData); // Assuming you will handle the combined data in this function

//       console.log("✅ Combined DXF imported via API:", jsonData);
//     } catch (error) {
//       console.error("❌ Error uploading combined DXF file:", error);
//     } finally {
//       if (combinedInputRef.current) {
//         combinedInputRef.current.value = "";
//       }
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* Hidden Inputs */}
//       <input
//         type="file"
//         ref={shadeInputRef}
//         className="hidden"
//         accept=".dxf"
//         onChange={handleShadeFileChange}
//       />
//       <input
//         type="file"
//         ref={baseplateInputRef}
//         className="hidden"
//         accept=".dxf"
//         onChange={handleBaseplateJsonChange}
//       />
//       <input
//         type="file"
//         ref={combinedInputRef} // Combined file input
//         className="hidden"
//         accept=".dxf"
//         onChange={handleCombinedFileChange} // New handler
//       />

//       {/* Buttons */}
//       <div>
//         <div className="flex">
//           <button
//             className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
//             onClick={() => shadeInputRef.current?.click()}
//           >
//             Import Shade
//           </button>
//           <button
//             className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
//             onClick={() => baseplateInputRef.current?.click()}
//           >
//             Import Baseplate
//           </button>
//         </div>
//         <button
//           className="bg-gray-800 text-white m-1 p-2 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
//           onClick={() => combinedInputRef.current?.click()} // Trigger combined input
//         >
//           Import Combined DXF (Baseplates & Shed)
//         </button>
//       </div>
//     </div>
//   );
// };

import { useRef } from "react";
import wallStore from "../stores/WallStore";
import { BACKEND_URL } from "../Constants";
import baseplateStore from "../stores/BasePlateStore";
import processBaseplates from "./processBaseplateDXFData";
// import processShedData from "./processShedDXFData";  // Add a function to process shed data

export const Import = () => {
  const shadeInputRef = useRef<HTMLInputElement | null>(null);
  const baseplateInputRef = useRef<HTMLInputElement | null>(null);
  const combinedInputRef = useRef<HTMLInputElement | null>(null); // Ref for combined DXF file

  const handleShadeFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("dxfFile", file);

    try {
      const response = await fetch(`${BACKEND_URL}api/dxf/upload-dxf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      wallStore.processWallData(data);
      console.log("Parsed Shade DXF Data:", data);
    } catch (error) {
      console.error("Error uploading shade file:", error);
    }
  };

  const handleBaseplateJsonChange = async (
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

      // Clean up previous baseplates
      baseplateStore.clearBaseplates();
      wallStore.clearWallData();

      



      processBaseplates(jsonData);

      console.log("✅ Baseplate JSON imported via API:", jsonData);
    } catch (error) {
      console.error("❌ Error uploading baseplate JSON file:", error);
    } finally {
      if (baseplateInputRef.current) {
        baseplateInputRef.current.value = "";
      }
    }
  };

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
  };

  return (
    <div className="w-full">
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={shadeInputRef}
        className="hidden"
        accept=".dxf"
        onChange={handleShadeFileChange}
      />
      <input
        type="file"
        ref={baseplateInputRef}
        className="hidden"
        accept=".dxf"
        onChange={handleBaseplateJsonChange}
      />
      <input
        type="file"
        ref={combinedInputRef} // Combined file input
        className="hidden"
        accept=".dxf"
        onChange={handleCombinedFileChange} // New handler for combined DXF
      />

      {/* Buttons */}
      <div>
        <div className="flex">
          <button
            className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
            onClick={() => shadeInputRef.current?.click()}
          >
            Import Shade
          </button>
          <button
            className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
            onClick={() => baseplateInputRef.current?.click()}
          >
            Import Baseplate
          </button>
        </div>
        <button
          className="bg-gray-800 text-white m-1 rounded shadow-md hover:bg-gray-600 cursor-pointer w-full text-sm"
          onClick={() => combinedInputRef.current?.click()} // Trigger combined input
        >
          Import Combined DXF (Baseplates & Shed)
        </button>
      </div>
    </div>
  );
};
