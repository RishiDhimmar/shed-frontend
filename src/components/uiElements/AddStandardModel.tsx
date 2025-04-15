// // AddTemplateModal.jsx
// import { useState } from "react";
// import uiStore, { Standard } from "../../stores/UIStore";
// import { IoMdAdd, IoMdRemove } from "react-icons/io";

// const AddStandardModel = ({ onClose }: { onClose: () => void }) => {
//   const [standardName, setStandardName] = useState("");
//   const [standardType, setStandardType] = useState("");

//   const [length, setLength] = useState("");
//   const [width, setWidth] = useState("");
//   const [thickness, setThickness] = useState("");
//   const [horizontalDistance, setHorizontalDistance] = useState("");
//   const [VerticalDistance, setVerticalDistance] = useState("");

//   const handleSubmit = () => {
//     const newStandard: Omit<Standard, "id" | "createdAt"> = {
//       name: standardName,
//       type: standardType,
//       dimensions:
//         standardType === "shed"
//           ? { length, width, thickness }
//           : {
//               idealHorizontalDistance: parseFloat(horizontalDistance),
//               idealVerticalDistance: parseFloat(VerticalDistance),
//             },
//     };
//     uiStore.addTemplate(newStandard);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-40">
//       <div className="bg-white rounded-lg p-6 w-1/2 max-w-md">
//         <h3 className="text-lg font-medium mb-4">Add New Standard</h3>

//         <div className="space-y-4 mb-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Standard Name
//             </label>
//             <input
//               type="text"
//               value={standardName}
//               onChange={(e) => setStandardName(e.target.value)}
//               className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Standard Type
//             </label>
//             <select
//               value={standardType}
//               onChange={(e) => setStandardType(e.target.value)}
//               className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Type</option>
//               <option value="shed">Shed</option>
//               <option value="baseplate">Baseplate</option>
//             </select>
//           </div>

//           {standardType === "shed" && (
//             <div className="p-4 border rounded bg-gray-50">
//               <h4 className="text-sm font-medium mb-2">Shed Dimensions</h4>
//               <div className="grid grid-cols-3 gap-3">
//                 <div>
//                   <label className="block text-xs text-gray-500 mb-1">
//                     Length (m)
//                   </label>
//                   <input
//                     type="number"
//                     value={length}
//                     onChange={(e) => setLength(e.target.value)}
//                     className="w-full p-2 border rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-gray-500 mb-1">
//                     Width (m)
//                   </label>
//                   <input
//                     type="number"
//                     value={width}
//                     onChange={(e) => setWidth(e.target.value)}
//                     className="w-full p-2 border rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-gray-500 mb-1">
//                     Thickness (m)
//                   </label>
//                   <input
//                     type="number"
//                     value={thickness}
//                     onChange={(e) => setThickness(e.target.value)}
//                     className="w-full p-2 border rounded"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {standardType === "baseplate" && (
//             <div className="p-4 border rounded bg-gray-50">
//               <h4 className="text-sm font-medium mb-2">Baseplate Dimensions</h4>
//               <div className="flex gap-3">
//                 <div>
//                   <label className="block text-xs text-gray-500 mb-1">
//                     Ideal horizontal Distance
//                   </label>
//                   <input
//                     type="number"
//                     value={horizontalDistance}
//                     onChange={(e) => setHorizontalDistance(e.target.value)}
//                     className="w-full p-2 border rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-gray-500 mb-1">
//                     Vertical Distance
//                   </label>
//                   <input
//                     type="number"
//                     value={VerticalDistance}
//                     onChange={(e) => setVerticalDistance(e.target.value)}
//                     className="w-full p-2 border rounded"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={!standardName || !standardName}
//             className={`px-4 py-2 rounded ${
//               !standardName || !standardName
//                 ? "bg-blue-300 cursor-not-allowed"
//                 : "bg-blue-500 hover:bg-blue-600 text-white"
//             }`}
//           >
//             Submit
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddStandardModel;

import { useState } from "react";
import uiStore, { Standard } from "../../stores/UIStore";

const AddStandardModel = ({ onClose }: { onClose: () => void }) => {
  const [standardName, setStandardName] = useState("");
  const [standardType, setStandardType] = useState("");

  // Updated: use comma-separated input values instead of arrays
  const [lengthInput, setLengthInput] = useState("");
  const [widthInput, setWidthInput] = useState("");
  const [thicknessInput, setThicknessInput] = useState("");

  const [horizontalDistance, setHorizontalDistance] = useState("");
  const [verticalDistance, setVerticalDistance] = useState("");

  const handleSubmit = () => {
    const parseValues = (input: string) =>
      input
        .split(",")
        .map((val) => val.trim())
        .filter((val) => val !== "")
        .map(parseFloat);

    const filteredLengths = parseValues(lengthInput);
    const filteredWidths = parseValues(widthInput);
    const filteredThicknesses = parseValues(thicknessInput);

    const newStandard: Omit<Standard, "id" | "createdAt"> = {
      name: standardName,
      type: standardType,
      dimensions:
        standardType === "shed"
          ? {
              lengthOptions: filteredLengths,
              widthOptions: filteredWidths,
              thicknessOptions: filteredThicknesses,
            }
          : {
              idealHorizontalDistanceOptions: [parseFloat(horizontalDistance)],
              idealVerticalDistanceOptions: [parseFloat(verticalDistance)],
            },
    };
    console.log(newStandard);

    uiStore.addStandard(newStandard);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-1/2 max-w-md max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Add New Standard</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard Name
            </label>
            <input
              type="text"
              value={standardName}
              onChange={(e) => setStandardName(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard Type
            </label>
            <select
              value={standardType}
              onChange={(e) => setStandardType(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="shed">Shed</option>
              <option value="baseplate">Baseplate</option>
            </select>
          </div>

          {standardType === "shed" && (
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Shed Dimensions</h4>
              <p className="text-xs text-gray-500 mb-3">
                Enter multiple values separated by commas (e.g., 2.0, 2.5, 3.0)
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="text"
                    value={lengthInput}
                    onChange={(e) => setLengthInput(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Width (m)
                  </label>
                  <input
                    type="text"
                    value={widthInput}
                    onChange={(e) => setWidthInput(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Thickness (m)
                  </label>
                  <input
                    type="text"
                    value={thicknessInput}
                    onChange={(e) => setThicknessInput(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {standardType === "baseplate" && (
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Baseplate Dimensions</h4>
              <p className="text-xs text-gray-500 mb-3">
                Enter multiple values separated by commas (e.g., 2.0, 2.5, 3.0)
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Ideal Horizontal Distance (m)
                  </label>
                  <input
                    type="text"
                    value={horizontalDistance}
                    onChange={(e) => setHorizontalDistance(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Ideal Vertical Distance (m)
                  </label>
                  <input
                    type="text"
                    value={verticalDistance}
                    onChange={(e) => setVerticalDistance(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!standardName || !standardType}
            className={`px-4 py-2 rounded ${
              !standardName || !standardType
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStandardModel;
