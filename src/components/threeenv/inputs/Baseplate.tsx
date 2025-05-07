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
  const [modifyMode, setModifyMode] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedBaseplatesToAdd, setSelectedBaseplatesToAdd] = useState<{
    [groupName: string]: string;
  }>({});

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleSelectTemplate = (template: Template) => {
    setSelectedBaseplate(template.name);
    setShowDropdown(false);
    const dims = template.dimensions as any;
    baseplateStore.setIdealHorizontalDistance(dims.idealHorizontalDistance);
    baseplateStore.setIdealVerticalDistance(dims.idealVerticalDistance);
  };

  const handleBaseplateChange = (groupName: string, baseplateId: string) => {
    setSelectedBaseplatesToAdd((prev) => ({
      ...prev,
      [groupName]: baseplateId,
    }));
  };

  const baseplateTemplates = uiStore.getTemplatesByType("baseplate");

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        {baseplateStore.groups.map((group) => (
          <div key={group.name} className="space-y-1 border rounded p-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold">{group.name}</div>
              {modifyMode && (
                <button
                  className="text-red-600 text-xs hover:underline"
                  onClick={() => baseplateStore.deleteGroup(group.name)}
                >
                  Delete Group
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {group.basePlates?.map((bs) => (
                <div
                  key={bs.id}
                  className="inline-flex items-center justify-between text-sm text-gray-900 ring-1 ring-gray-300 rounded px-2 py-1"
                >
                  {bs.label}
                  {modifyMode && (
                    <button
                      className="ml-2 text-red-500 text-xs cursor-pointer"
                      onClick={() =>
                        baseplateStore.removeBaseplateFromGroup(
                          group.name,
                          bs.label
                        )
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {modifyMode && (
              <div className="flex gap-2 mt-2">
                <select
                  className="border rounded p-1 flex-1"
                  value={selectedBaseplatesToAdd[group.name] || ""}
                  onChange={(e) =>
                    handleBaseplateChange(group.name, e.target.value)
                  }
                >
                  <option value="">Select baseplate</option>
                  {baseplateStore.basePlates.map((bs) => (
                    <option key={bs.id} value={bs.id}>
                      {bs.label}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => {
                    const selectedId = selectedBaseplatesToAdd[group.name];
                    if (selectedId) {
                      baseplateStore.addBaseplateToGroup(
                        group.name,
                        selectedId
                      );
                      handleBaseplateChange(group.name, "");
                    }
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        ))}

        {modifyMode && (
          <div className="space-y-2 border-t pt-4">
            <div className="text-sm font-semibold">Create New Group</div>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="New Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-4 py-1 rounded mt-1"
              onClick={() => {
                if (newGroupName.trim()) {
                  baseplateStore.addGroup({
                    name: newGroupName,
                    basePlates: [],
                  });
                  setNewGroupName("");
                }
              }}
            >
              Create Group
            </button>
          </div>
        )}

        <div className="pt-4">
          <button
            className="bg-gray-300 p-2 rounded-md shadow-md hover:bg-gray-400 cursor-pointer w-full"
            onClick={() => setModifyMode(!modifyMode)}
          >
            {modifyMode ? "Done Modifying Groups" : "Modify Groups"}
          </button>
        </div>
      </div>

      {/* Template dropdown and distances */}
      <div className="flex gap-3 items-center justify-content-between relative mb-4 mt-6">
        <h1 className="text-xl font-bold">
          Baseplate Input {selectedBaseplate && ` - ${selectedBaseplate}`}
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
        Distances <IoIosArrowDropdown size={20} className="cursor-pointer" />
      </div>

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
