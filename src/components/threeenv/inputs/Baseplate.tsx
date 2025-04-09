// import { observer } from "mobx-react-lite";
// import baseplateStore from "../../../stores/BasePlateStore";
// import BaseplateDimensions from "../Helpers/BaseplateDimensions";
// import InputNumber from "../Helpers/InputNumber";

// export const BaseplateInput = observer(() => {
//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">Baseplate Input</h1>
//       <div className="flex-col gap-4">
//         <InputNumber
//           label="Ideal Horizontal Distance:"
//           value={baseplateStore.idealHorizontalDistance}
//           onChange={(newLength: number) =>
//             baseplateStore.setIdealHorizontalDistance(newLength)
//           }
//         />
//         <InputNumber
//           label="Ideal Vertical Distance:"
//           value={baseplateStore.idealVerticalDistance}
//           onChange={(newLength: number) =>
//             baseplateStore.setIdealVerticalDistance(newLength)
//           }
//         />
//       </div>
//       <div className="flex-col gap-4">
//         <h1 className="text-md font-medium mb-4 ">Corner Baseplate</h1>
//         <BaseplateDimensions type="corner" />
//       </div>
//       <div className="flex-col gap-4">
//         <h1 className="text-md font-medium mb-4">Horizontal Baseplate</h1>
//         <BaseplateDimensions type="horizontal" />
//       </div>
//       <div className="flex-col gap-4">
//         <h1 className="text-md font-medium mb-4">Vertical Baseplate</h1>
//         <BaseplateDimensions type="vertical" />
//       </div>
//     </div>
//   );
// });

import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import BaseplateDimensions from "../Helpers/BaseplateDimensions";
import InputNumber from "../Helpers/InputNumber";
import { IoIosArrowDropdown } from "react-icons/io";
import { useState } from "react";

export const BaseplateInput = observer(() => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBaseplate, setSelectedBaseplate] = useState<string | null>(
    null
  );

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSelect = (label: string) => {
    setSelectedBaseplate(label);
    setShowDropdown(false);

    // Set static values like in Shade component
    if (label === "Baseplate 1") {
      baseplateStore.setIdealHorizontalDistance(8);
      baseplateStore.setIdealVerticalDistance(4);
    } else if (label === "Baseplate 2") {
      baseplateStore.setIdealHorizontalDistance(3);
      baseplateStore.setIdealVerticalDistance(5);
    }
  };

  return (
    <div className="p-6">
      <div className="flex gap-3 items-center relative mb-4">
        <h1 className="text-xl font-bold">
          Baseplate Input {selectedBaseplate && `- ${selectedBaseplate}`}
        </h1>
        <IoIosArrowDropdown
          size={20}
          className="cursor-pointer"
          onClick={toggleDropdown}
        />
        {showDropdown && (
          <div className="absolute top-8 left-20 bg-white shadow-md rounded p-2 z-10">
            <div
              className="cursor-pointer hover:bg-gray-200 p-1"
              onClick={() => handleSelect("Baseplate 1")}
            >
              Baseplate 1
            </div>
            <div
              className="cursor-pointer hover:bg-gray-200 p-1"
              onClick={() => handleSelect("Baseplate 2")}
            >
              Baseplate 2
            </div>
          </div>
        )}
      </div>

      <div className="flex-col gap-4">
        <InputNumber
          label="Ideal Horizontal Distance:"
          value={baseplateStore.idealHorizontalDistance}
          onChange={(val: number) =>
            baseplateStore.setIdealHorizontalDistance(val)
          }
        />
        <InputNumber
          label="Ideal Vertical Distance:"
          value={baseplateStore.idealVerticalDistance}
          onChange={(val: number) =>
            baseplateStore.setIdealVerticalDistance(val)
          }
        />
      </div>

      {["corner", "horizontal", "vertical"].map((type) => (
        <div className="flex-col gap-4" key={type}>
          <h1 className="text-md font-medium mt-4 mb-2 capitalize">
            {type} Baseplate
          </h1>
          <BaseplateDimensions type={type as any} />
        </div>
      ))}
    </div>
  );
});
