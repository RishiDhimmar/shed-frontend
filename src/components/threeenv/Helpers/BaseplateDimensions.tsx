// import InputNumber from "./InputNumber";
// import baseplateStore from "../../../stores/BasePlateStore";
// import { observer } from "mobx-react-lite";
// import { BaseplateType } from "../../../stores/BasePlateStore";

// interface BaseplateDimensionsProps {
//   type: BaseplateType;
// }

// const BaseplateDimensions = observer(({ type }: BaseplateDimensionsProps) => {
//   const config = baseplateStore.config[type];

//   return (
//     <>
//       <div className="flex gap-2">
//         <InputNumber
//           label="Length:"
//           value={config.length}
//           onChange={(newLength: number) =>
//             baseplateStore.setLength(type, newLength)
//           }
//         />
//         <InputNumber
//           label="Width:"
//           value={config.width}
//           onChange={(newWidth: number) =>
//             baseplateStore.setWidth(type, newWidth)
//           }
//         />
//       </div>
//       <div className="flex gap-4">
//         {config.offsetX !== undefined && (
//           <InputNumber
//             label="OffsetX:"
//             value={config.offsetX}
//             onChange={(newOffsetX: number) =>
//               baseplateStore.setOffsetX(type, newOffsetX)
//             }
//           />
//         )}
//         {config.offsetY !== undefined && (
//           <InputNumber
//             label="OffsetY:"
//             value={config.offsetY}
//             onChange={(newOffsetY: number) =>
//               baseplateStore.setOffsetY(type, newOffsetY)
//             }
//           />
//         )}
//       </div>
//     </>
//   );
// });

// export default BaseplateDimensions;

import { useState } from "react";
import InputNumber from "./InputNumber";
import baseplateStore from "../../../stores/BasePlateStore";
import { observer } from "mobx-react-lite";
import { BaseplateType } from "../../../stores/BasePlateStore";
import { IoIosArrowDropdown } from "react-icons/io";

interface BaseplateDimensionsProps {
  type: BaseplateType;
}

// Presets for each baseplate type
const baseplatePresets: Record<
  BaseplateType,
  {
    name: string;
    length: number;
    width: number;
    offsetX?: number;
    offsetY?: number;
  }[]
> = {
  corner: [
    {
      name: "Small (0.3 x 0.3)",
      length: 0.3,
      width: 0.3,
      offsetX: 0.01,
      offsetY: 0.05,
    },
    {
      name: "Default (0.5 x 0.5)",
      length: 0.5,
      width: 0.5,
      offsetX: 0.01,
      offsetY: 0.05,
    },
  ],
  horizontal: [
    { name: "Default (0.55 x 0.3)", length: 0.55, width: 0.3, offsetX: 0.01 },
    { name: "Large (0.7 x 0.4)", length: 0.7, width: 0.4, offsetX: 0.01 },
  ],
  vertical: [
    { name: "Default (0.3 x 0.25)", length: 0.3, width: 0.25, offsetY: 0.01 },
    { name: "Tall (0.4 x 0.25)", length: 0.4, width: 0.25, offsetY: 0.01 },
  ],
};

const BaseplateDimensions = observer(({ type }: BaseplateDimensionsProps) => {
  const config = baseplateStore.config[type];
  const [showDropdown, setShowDropdown] = useState(false);
  const [, setSelectedPreset] = useState<string | null>(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handleSelect = async (
    preset: (typeof baseplatePresets)[BaseplateType][number]
  ) => {
    const successLength = baseplateStore.setLength(type, preset.length);
    const successWidth = baseplateStore.setWidth(type, preset.width);

    let successOffsetX = true;
    let successOffsetY = true;

    if (preset.offsetX !== undefined) {
      successOffsetX = baseplateStore.setOffsetX(type, preset.offsetX);
    }

    if (preset.offsetY !== undefined) {
      successOffsetY = baseplateStore.setOffsetY(type, preset.offsetY);
    }

    if (successLength && successWidth && successOffsetX && successOffsetY) {
      setSelectedPreset(preset.name);
      setShowDropdown(false);
    } else {
      setSelectedPreset(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-md font-medium mt-4 mb-2 capitalize">
          {type} Baseplate
        </h1>
        <div className="relative">
          <div
            className="flex  items-center gap-1 cursor-pointer text-sm "
            onClick={toggleDropdown}
          >
            <IoIosArrowDropdown size={16} />
          </div>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white  shadow-md rounded-md z-10">
              {baseplatePresets[type].map((preset) => (
                <div
                  key={preset.name}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(preset)}
                >
                  {preset.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <InputNumber
          label="Length:"
          value={config.length}
          onChange={(newLength: number) =>
            baseplateStore.setLength(type, newLength)
          }
        />
        <InputNumber
          label="Width:"
          value={config.width}
          onChange={(newWidth: number) =>
            baseplateStore.setWidth(type, newWidth)
          }
        />
      </div>

      <div className="flex gap-4">
        {config.offsetX !== undefined && (
          <InputNumber
            label="OffsetX:"
            value={config.offsetX}
            onChange={(newOffsetX: number) =>
              baseplateStore.setOffsetX(type, newOffsetX)
            }
          />
        )}
        {config.offsetY !== undefined && (
          <InputNumber
            label="OffsetY:"
            value={config.offsetY}
            onChange={(newOffsetY: number) =>
              baseplateStore.setOffsetY(type, newOffsetY)
            }
          />
        )}
      </div>
    </>
  );
});

export default BaseplateDimensions;
