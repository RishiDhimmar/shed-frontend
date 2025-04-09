// import { observer } from "mobx-react-lite";
// import wallStore from "../../../stores/WallStore";
// import InputNumber from "../Helpers/InputNumber";
// import { IoIosArrowDropdown } from "react-icons/io";
// import { useState } from "react";

// export const Shade = observer(() => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [, setSelectedShed] = useState<string | null>(null);
//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };
//   const handleSelect = (shade: string) => {
//     setSelectedShed(shade);
//     setShowDropdown(false);
//   };
//   return (
//     <div className="p-6">
//       <div className="flex gap-3 items-center">
//         <h1 className="text-xl font-bold mb-4">Shed Input</h1>
//         <IoIosArrowDropdown
//           size={20}
//           className="mb-4 cursor-pointer"
//           onClick={toggleDropdown}
//         />
//         {showDropdown && (
//           <div className="absolute top-30 left-105 bg-white shadow-md rounded p-2 z-10">
//             <div
//               className="cursor-pointer hover:bg-gray-200 p-1"
//               onClick={() => handleSelect("Shade 1")}
//             >
//               Shade 1
//             </div>
//             <div
//               className="cursor-pointer hover:bg-gray-200 p-1"
//               onClick={() => handleSelect("Shade 2")}
//             >
//               Shade 2
//             </div>
//           </div>
//         )}
//       </div>
//       <form className="space-y-4">
//         <InputNumber
//           label="Height:"
//           value={wallStore.height}
//           onChange={(newHeight: number) => wallStore.setHeight(newHeight)}
//         />
//         <InputNumber
//           label="Width:"
//           value={wallStore.width}
//           onChange={(newWidth: number) => wallStore.setWidth(newWidth)}
//         />
//         <InputNumber
//           label="Thickness:"
//           value={wallStore.wallThickness}
//           onChange={(newThickness: number) =>
//             wallStore.setWallThickness(newThickness)
//           }
//         />
//       </form>
//     </div>
//   );
// });

import { observer } from "mobx-react-lite";
import wallStore from "../../../stores/WallStore";
import InputNumber from "../Helpers/InputNumber";
import { IoIosArrowDropdown } from "react-icons/io";
import { useState } from "react";

export const Shade = observer(() => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedShed, setSelectedShed] = useState<string | null>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSelect = (shade: string) => {
    setSelectedShed(shade);
    setShowDropdown(false);

    // Set static values based on selected shade
    if (shade === "Shade 1") {
      wallStore.setHeight(50);
      wallStore.setWidth(60);
      wallStore.setWallThickness(0.5);
    } else if (shade === "Shade 2") {
      wallStore.setHeight(60);
      wallStore.setWidth(40);
      wallStore.setWallThickness(0.8);
    }
  };

  return (
    <div className="p-6">
      <div className="flex gap-3 items-center relative">
        <h1 className="text-xl font-bold mb-4">
          Shed Input {selectedShed && `- ${selectedShed}`}
        </h1>
        <IoIosArrowDropdown
          size={20}
          className="mb-4 cursor-pointer"
          onClick={toggleDropdown}
        />
        {showDropdown && (
          <div className="absolute top-8 left-20 bg-white shadow-md rounded p-2 z-10">
            <div
              className="cursor-pointer hover:bg-gray-200 p-1"
              onClick={() => handleSelect("Shade 1")}
            >
              Shade 1
            </div>
            <div
              className="cursor-pointer hover:bg-gray-200 p-1"
              onClick={() => handleSelect("Shade 2")}
            >
              Shade 2
            </div>
          </div>
        )}
      </div>
      <form className="space-y-4">
        <InputNumber
          label="Height:"
          value={wallStore.height}
          onChange={(newHeight: number) => wallStore.setHeight(newHeight)}
        />
        <InputNumber
          label="Width:"
          value={wallStore.width}
          onChange={(newWidth: number) => wallStore.setWidth(newWidth)}
        />
        <InputNumber
          label="Thickness:"
          value={wallStore.wallThickness}
          onChange={(newThickness: number) =>
            wallStore.setWallThickness(newThickness)
          }
        />
      </form>
    </div>
  );
});
