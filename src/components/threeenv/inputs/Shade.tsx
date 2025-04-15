import { observer } from "mobx-react-lite";
import wallStore from "../../../stores/WallStore";
import InputNumber from "../Helpers/InputNumber";
import { IoIosArrowDropdown } from "react-icons/io";
import { useState } from "react";
import uiStore, { Template } from "../../../stores/UIStore";

export const Shade = observer(() => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedShed, setSelectedShed] = useState<string | null>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedShed(template.name);
    setShowDropdown(false);

    const dims = template.dimensions as any;

    wallStore.setHeight(dims.height ?? dims.length); // depending on format
    wallStore.setWidth(dims.width);
    wallStore.setWallThickness(dims.thickness ?? 0.5); // or handle thickness better
  };

  const shedTemplates = uiStore.getTemplatesByType("shed");

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
          <div className="absolute top-8 left-20 bg-white shadow-md rounded p-2 z-50">
            {shedTemplates.map((template) => {
              const dims = template.dimensions as any;
              return (
                <div
                  key={template.id}
                  className="cursor-pointer hover:bg-gray-200 p-1"
                  onClick={() => handleSelectTemplate(template)}
                >
                  {`${template.name} (${dims.height ?? dims.length} × ${
                    dims.width
                  })`}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <form className="space-y-4">
        <InputNumber
          label="Height:"
          value={wallStore.height}
          onChange={(newHeight: number) => wallStore.setHeight(newHeight)}
          standardType="shed"
          dimensionField="length"
        />
        <InputNumber
          label="Width:"
          value={wallStore.width}
          onChange={(newWidth: number) => wallStore.setWidth(newWidth)}
          standardType="shed"
          dimensionField="width"
        />
        <InputNumber
          label="Thickness: "
          value={wallStore.wallThickness}
          onChange={(newThickness: number) =>
            wallStore.setWallThickness(newThickness)
          }
          standardType="shed"
          dimensionField="thickness"
        />
      </form>
    </div>
  );
});
