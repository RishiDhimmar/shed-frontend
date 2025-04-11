// import { observer } from "mobx-react-lite";
// import baseplateStore from "../../../stores/BasePlateStore";
// import BaseplateDimensions from "../Helpers/BaseplateDimensions";
// import InputNumber from "../Helpers/InputNumber";
// import { IoIosArrowDropdown } from "react-icons/io";
// import { useState } from "react";
// import { BaseplateType } from "../../../stores/BasePlateStore";

// // Full baseplate input presets
// const baseplatePresets: Record<
//   string,
//   {
//     label: string;
//     idealHorizontalDistance: number;
//     idealVerticalDistance: number;
//     configs: Record<
//       BaseplateType,
//       {
//         width: number;
//         length: number;
//         offsetX?: number;
//         offsetY?: number;
//       }
//     >;
//   }
// > = {
//   baseplate1: {
//     label: "Baseplate 1",
//     idealHorizontalDistance: 8,
//     idealVerticalDistance: 4,
//     configs: {
//       corner: { width: 0.5, length: 0.5, offsetX: 0.01, offsetY: 0.05 },
//       horizontal: { width: 0.3, length: 0.55, offsetX: 0.01 },
//       vertical: { width: 0.25, length: 0.3, offsetY: 0.01 },
//     },
//   },
//   baseplate2: {
//     label: "Baseplate 2",
//     idealHorizontalDistance: 3,
//     idealVerticalDistance: 5,
//     configs: {
//       corner: { width: 0.4, length: 0.4, offsetX: 0.02, offsetY: 0.03 },
//       horizontal: { width: 0.35, length: 0.6, offsetX: 0.015 },
//       vertical: { width: 0.3, length: 0.35, offsetY: 0.015 },
//     },
//   },
// };

// export const BaseplateInput = observer(() => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedBaseplate, setSelectedBaseplate] = useState<string | null>(
//     null
//   );

//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };

//   const handleSelect = (key: string) => {
//     const preset = baseplatePresets[key];
//     if (!preset) return;

//     setSelectedBaseplate(preset.label);
//     setShowDropdown(false);

//     // Apply global distances
//     baseplateStore.setIdealHorizontalDistance(preset.idealHorizontalDistance);
//     baseplateStore.setIdealVerticalDistance(preset.idealVerticalDistance);

//     // Apply baseplate type-specific configs
//     for (const type of Object.keys(preset.configs) as BaseplateType[]) {
//       const { width, length, offsetX, offsetY } = preset.configs[type];
//       baseplateStore.setLength(type, length);
//       baseplateStore.setWidth(type, width);

//       if (offsetX !== undefined) {
//         baseplateStore.setOffsetX(type, offsetX);
//       }

//       if (offsetY !== undefined) {
//         baseplateStore.setOffsetY(type, offsetY);
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex gap-3 items-center relative mb-4">
//         <h1 className="text-xl font-bold">
//           Baseplate Input {selectedBaseplate && `- ${selectedBaseplate}`}
//         </h1>
//       </div>

//       <div className="flex gap-3 items-center text-bold relative mb-2">
//         Presets
//         <IoIosArrowDropdown
//           size={20}
//           className="cursor-pointer"
//           onClick={toggleDropdown}
//         />
//         {showDropdown && (
//           <div className="absolute top-8 left-20 bg-white shadow-md rounded p-2 z-10">
//             {Object.entries(baseplatePresets).map(([key, preset]) => (
//               <div
//                 key={key}
//                 className="cursor-pointer hover:bg-gray-200 p-1"
//                 onClick={() => handleSelect(key)}
//               >
//                 {preset.label}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="flex-col gap-4">
//         <InputNumber
//           label="Ideal Horizontal Distance:"
//           value={baseplateStore.idealHorizontalDistance}
//           onChange={(val: number) =>
//             baseplateStore.setIdealHorizontalDistance(val)
//           }
//         />
//         <InputNumber
//           label="Ideal Vertical Distance:"
//           value={baseplateStore.idealVerticalDistance}
//           onChange={(val: number) =>
//             baseplateStore.setIdealVerticalDistance(val)
//           }
//         />
//       </div>

//       {["corner", "horizontal", "vertical"].map((type) => (
//         <div className="flex-col gap-4" key={type}>
//           <h1 className="text-md font-medium mt-4 mb-2 capitalize">
//             {type} Baseplate
//           </h1>
//           <BaseplateDimensions type={type as BaseplateType} />
//         </div>
//       ))}
//     </div>
//   );
// });

import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import BaseplateDimensions from "../Helpers/BaseplateDimensions";
import InputNumber from "../Helpers/InputNumber";
import { IoIosArrowDropdown } from "react-icons/io";
import { useState } from "react";
import { BaseplateType } from "../../../stores/BasePlateStore";
import uiStore, {
  BaseplateTemplateDimensions,
  Template,
} from "../../../stores/UIStore";

// Dimension presets with labels
const dimensionPresets: Record<
  string,
  {
    label: string;
    configs: Record<
      BaseplateType,
      {
        width: number;
        length: number;
        offsetX?: number;
        offsetY?: number;
      }
    >;
  }
> = {
  compact: {
    label: "Baseplate 1",
    configs: {
      corner: { width: 0.4, length: 0.4, offsetX: 0.015, offsetY: 0.02 },
      horizontal: { width: 0.3, length: 0.5, offsetX: 0.01 },
      vertical: { width: 0.2, length: 0.25, offsetY: 0.015 },
    },
  },
  spacious: {
    label: "Baseplate 2",
    configs: {
      corner: { width: 0.6, length: 0.6, offsetX: 0.02, offsetY: 0.03 },
      horizontal: { width: 0.4, length: 0.65, offsetX: 0.02 },
      vertical: { width: 0.35, length: 0.4, offsetY: 0.02 },
    },
  },
};

// Distance presets (dynamic labels)
const distancePresets = [
  { label: "8 × 4", horizontal: 8, vertical: 4 },
  { label: "3 × 5", horizontal: 3, vertical: 5 },
];

export const BaseplateInput = observer(() => {
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showDimensionDropdown, setShowDimensionDropdown] = useState(false);

  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);

  const toggleDistanceDropdown = () => {
    setShowDistanceDropdown(!showDistanceDropdown);
  };

  const toggleDimensionDropdown = () => {
    setShowDimensionDropdown(!showDimensionDropdown);
  };

  const handleDistancePreset = (horizontal: number, vertical: number) => {
    setSelectedDistance(`${horizontal} × ${vertical}`);
    setShowDistanceDropdown(false);
    baseplateStore.setIdealHorizontalDistance(horizontal);
    baseplateStore.setIdealVerticalDistance(vertical);
  };

  const handleDimensionPreset = (key: string) => {
    const preset = dimensionPresets[key];
    if (!preset) return;

    setShowDimensionDropdown(false);

    for (const type of Object.keys(preset.configs) as BaseplateType[]) {
      const { width, length, offsetX, offsetY } = preset.configs[type];
      baseplateStore.setLength(type, length);
      baseplateStore.setWidth(type, width);

      if (offsetX !== undefined) baseplateStore.setOffsetX(type, offsetX);
      if (offsetY !== undefined) baseplateStore.setOffsetY(type, offsetY);
    }
  };

  const handleTemplatePreset = (template: Template) => {
    setShowDimensionDropdown(false);

    const dimensions = template.dimensions as BaseplateTemplateDimensions;
    if (!dimensions) return;

    for (const type of Object.keys(dimensions) as BaseplateType[]) {
      const config = dimensions[type];
      if (!config) continue;

      baseplateStore.setLength(type, config.length);
      baseplateStore.setWidth(type, config.width);
      if (config.offsetX !== undefined)
        baseplateStore.setOffsetX(type, config.offsetX);
      if (config.offsetY !== undefined)
        baseplateStore.setOffsetY(type, config.offsetY);
    }
  };

  const baseplateTemplates = uiStore.getTemplatesByType("baseplate");

  return (
    <div className="p-6">
      <div className="flex gap-3 items-center justify-content-between relative mb-4">
        <h1 className="text-xl font-bold">Baseplate Input</h1>

        <IoIosArrowDropdown
          size={20}
          className="cursor-pointer"
          onClick={toggleDimensionDropdown}
        />
        {showDimensionDropdown && (
          <div className="absolute top-8 left-40 bg-white shadow-md rounded p-2 z-10 w-full">
            {/* Existing hardcoded dimension presets */}
            {Object.entries(dimensionPresets).map(([key, preset]) => (
              <div
                key={key}
                className="cursor-pointer hover:bg-gray-200 p-1"
                onClick={() => handleDimensionPreset(key)}
              >
                {preset.label}
              </div>
            ))}

            {/* Dynamic template list */}
            {baseplateTemplates.map((template) => (
              <div
                key={template.id}
                className="cursor-pointer hover:bg-gray-100 p-1 text-sm text-blue-600"
                onClick={() => handleTemplatePreset(template)}
              >
                {template.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Distances Preset */}
      <div className="flex gap-3 items-center text-bold relative mb-2">
        Distances {selectedDistance && `- ${selectedDistance}`}
        <IoIosArrowDropdown
          size={20}
          className="cursor-pointer"
          onClick={toggleDistanceDropdown}
        />
        {showDistanceDropdown && (
          <div className="absolute top-8 left-20 bg-white shadow-md rounded p-2 z-10">
            {distancePresets.map((preset, index) => (
              <div
                key={index}
                className="cursor-pointer hover:bg-gray-200 p-1"
                onClick={() =>
                  handleDistancePreset(preset.horizontal, preset.vertical)
                }
              >
                {preset.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Distance Inputs */}
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

      {/* Editable Inputs for Each Baseplate */}
      {["corner", "horizontal", "vertical"].map((type) => (
        <div className="flex-col gap-4" key={type}>
          <BaseplateDimensions type={type as BaseplateType} />
        </div>
      ))}
    </div>
  );
});
