// // TemplatesManagement.jsx
// import { useState } from "react";
// import { observer } from "mobx-react-lite";
// import uiStore, { Standard } from "../../stores/UIStore";

// import { useNavigate } from "react-router-dom";
// import AddStandardModel from "./AddStandardModel";

// // Add templates functionality to UIStore if it doesn't exist
// if (!("standards" in uiStore)) {
//   const store = uiStore as any;
//   store.standards = [];
//   store.addStandard = function (standard: Omit<Standard, "id" | "createdAt">) {
//     this.standards.push({
//       ...standard,
//       id: this.standards.length + 1,
//       createdAt: new Date().toLocaleDateString(),
//     });
//     this.standards.push(newStandard);
//   };
// }

// type StandardManagementProps = {
//   onClose: () => void;
// };

// const StandardManagement = observer(({ onClose }: StandardManagementProps) => {
//   const navigate = useNavigate();
//   const [showAddStandardModal, setShowAddStandardModal] = useState(false);

//   return (
//     <div className=" w-full  bg-white  flex flex-col">
//       <div className="p-6 flex-1 overflow-auto ">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">STANDARDS</h1>
//           <button
//             onClick={() => setShowAddStandardModal(true)}
//             className="bg-gray-800 text-white px-4 py-2 cursor-pointer rounded hover:bg-gray-600"
//           >
//             ADD STANDARD
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-3 px-4 border text-left">Sr No</th>
//                 <th className="py-3 px-4 border text-left">Standard Name</th>
//                 <th className="py-3 px-4 border text-left">Standard Type</th>
//                 <th className="py-3 px-4 border text-left">Created At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {uiStore.standards &&
//                 uiStore.standards.map((standard, index) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     <td className="py-2 px-4 border">{standard.id}</td>
//                     <td className="py-2 px-4 border">{standard.name}</td>
//                     <td className="py-2 px-4 border">{standard.type}</td>
//                     <td className="py-2 px-4 border">{standard.createdAt}</td>
//                   </tr>
//                 ))}
//               {(!uiStore.standards || uiStore.standards.length === 0) && (
//                 <tr>
//                   <td
//                     colSpan={4}
//                     className="py-4 px-4 border text-center text-gray-500"
//                   >
//                     No standards found. Add a standard to get started.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="p-4 border-t-1 bg-gray-50 flex justify-end">
//         <button
//           onClick={() => {
//             navigate("/app/listView");
//             {
//               onClose();
//             }
//           }}
//           className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
//         >
//           Close
//         </button>
//       </div>

//       {showAddStandardModal && (
//         <AddStandardModel onClose={() => setShowAddStandardModal(false)} />
//       )}
//     </div>
//   );
// });

// export default StandardManagement;

import { useState } from "react";
import { observer } from "mobx-react-lite";
import uiStore, { Standard } from "../../stores/UIStore";
import { useNavigate } from "react-router-dom";
import AddStandardModel from "./AddStandardModel";

// Add standards functionality to uiStore if it doesn't exist
if (!("standards" in uiStore)) {
  const store = uiStore as any;
  store.standards = [];
  store.addStandard = function (standard: Omit<Standard, "id" | "createdAt">) {
    const newStandard = {
      ...standard,
      id: this.standards.length + 1,
      createdAt: new Date().toLocaleDateString(),
    };
    this.standards.push(newStandard);
  };
}

type StandardManagementProps = {
  onClose: () => void;
};

const StandardManagement = observer(({ onClose }: StandardManagementProps) => {
  const navigate = useNavigate();
  const [showAddStandardModal, setShowAddStandardModal] = useState(false);

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="p-6 flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">STANDARDS</h1>
          <button
            onClick={() => setShowAddStandardModal(true)}
            className="bg-gray-800 text-white px-4 py-2 cursor-pointer rounded hover:bg-gray-600"
          >
            ADD STANDARD
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border text-left">Sr No</th>
                <th className="py-3 px-4 border text-left">Standard Name</th>
                <th className="py-3 px-4 border text-left">Standard Type</th>
                <th className="py-3 px-4 border text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {uiStore.standards &&
                uiStore.standards.map((standard, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{standard.id}</td>
                    <td className="py-2 px-4 border">{standard.name}</td>
                    <td className="py-2 px-4 border">{standard.type}</td>
                    <td className="py-2 px-4 border">{standard.createdAt}</td>
                  </tr>
                ))}
              {(!uiStore.standards || uiStore.standards.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 px-4 border text-center text-gray-500"
                  >
                    No standards found. Add a standard to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50 flex justify-end">
        <button
          onClick={() => {
            navigate("/app/listView");
            onClose();
          }}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>

      {showAddStandardModal && (
        <AddStandardModel onClose={() => setShowAddStandardModal(false)} />
      )}
    </div>
  );
});

export default StandardManagement;
