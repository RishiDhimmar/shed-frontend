import { observer } from "mobx-react-lite";
import baseplateStore, { BaseplateType } from "../../../stores/BasePlateStore";
import uiStore, { Template } from "../../../stores/UIStore";
import InputNumber from "../Helpers/InputNumber";
import { IoIosArrowDropdown } from "react-icons/io";
import { useState } from "react";
import BaseplateDimensions from "../Helpers/BaseplateDimensions";

export const BaseplateInput = observer(() => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBaseplate, setSelectedBaseplate] = useState<string | null>(
    null
  );

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Only get templates of type "baseplate"

  const handleSelectTemplate = (template: Template) => {
    setSelectedBaseplate(template.name);
    setShowDropdown(false);

    const dims = template.dimensions as any;

    baseplateStore.setIdealHorizontalDistance(dims.idealHorizontalDistance);
    baseplateStore.setIdealVerticalDistance(dims.idealVerticalDistance);
  };

  const baseplateTemplates = uiStore.getTemplatesByType("baseplate");

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        {baseplateStore.groups.map((group) => (
          <div key={group.name} className="space-y-1">
            <div className="text-sm">{group.name}</div>
            <div className="grid grid-cols-5 gap-2">
              {group.basePlates.map((bs) => (
                <div
                  key={bs.id}
                  className="inline-flex items-center justify-center text-center p-2 text-sm text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 rounded"
                >
                  {bs.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center justify-content-between relative mb-4">
        <h1 className="text-xl font-bold">
          Baseplate Input {selectedBaseplate && `-${selectedBaseplate}`}
        </h1>

        <IoIosArrowDropdown
          size={20}
          className="cursor-pointer"
          onClick={toggleDropdown}
        />
        {showDropdown && (
          <div className="absolute top-8 left-40 bg-white shadow-md rounded p-2 z-10 w-full">
            {baseplateTemplates.map((template) => {
              const dims = template.dimensions as any;
              return (
                <div
                  key={template.id}
                  className="cursor-pointer hover:bg-gray-200 p-1"
                  onClick={() => handleSelectTemplate(template)}
                >
                  {`${template.name} (${dims.idealHorizontalDistance} × ${dims.idealVerticalDistance})`}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 items-center text-bold relative mb-2">
        Distances
        <IoIosArrowDropdown size={20} className="cursor-pointer" />
      </div>

      {/* Distance Inputs */}
      <div className="flex-col gap-4">
        <InputNumber
          label="Ideal Horizontal Distance:"
          value={baseplateStore.idealHorizontalDistance}
          onChange={(val: number) =>
            baseplateStore.setIdealHorizontalDistance(val)
          }
          standardType="baseplate"
          dimensionField="horizontalDistance"
        />
        <InputNumber
          label="Ideal Vertical Distance:"
          value={baseplateStore.idealVerticalDistance}
          onChange={(val: number) =>
            baseplateStore.setIdealVerticalDistance(val)
          }
          standardType="baseplate"
          dimensionField="verticalDistance"
        />
      </div>

      {["corner", "horizontal", "vertical"].map((type) => (
        <div className="flex-col gap-4" key={type}>
          <BaseplateDimensions type={type as BaseplateType} />
        </div>
      ))}
    </div>
  );
});
