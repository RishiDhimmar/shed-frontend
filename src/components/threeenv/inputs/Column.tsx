import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import columnStore from "../../../stores/ColumnStore";
import basePlotStore from "../../../stores/BasePlotStore";
import baseplateStore from "../../../stores/BasePlateStore";
import { useState } from "react";
import { toJS } from "mobx";

export const Column = observer(() => {
  const [modifyMode, setModifyMode] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedColumnsToAdd, setSelectedColumnsToAdd] = useState<{
    [groupName: string]: string;
  }>({});
  const handleColumnChange = (groupName: string, columnId: string) => {
    setSelectedColumnsToAdd((prev) => ({
      ...prev,
      [groupName]: columnId,
    }));
  };
  return (
    <div className=" p-6">
      <h1 className="text-lg font-bold mb-4 "> Column Inputs</h1>
      <div className="gap-2">
        {columnStore.polygons.map((group) => (
          <div key={group.name} className="my-3 border rounded p-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold">{group.name}</div>
              {modifyMode && (
                <button
                  className="text-red-600 text-xs hover:underline"
                  onClick={() => columnStore.deleteGroup(group.name)}
                >
                  Delete Group
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {group.columns?.map((bs) => (
                <div
                  key={bs.id}
                  className="inline-flex items-center justify-between text-sm text-gray-900 ring-1 ring-gray-300 rounded px-2 py-1"
                >
                  {bs?.label ? bs.label : "No Label"}
                  {modifyMode && (
                    <button
                      className="ml-2 text-red-500 text-xs cursor-pointer"
                      onClick={() =>
                        columnStore.removeColumnFromGroup(group.name, bs.label)
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              </div>
              <input
                type="number"
                className="border rounded p-1 flex-1 my-2 w-full"
                value={group.hEdgeWires}
                onChange={(e) =>
                  columnStore.sethEdgeWires(group.name, e.target.value)
                }
              />
              <input
                type="number"
                className="border rounded p-1 flex-1 w-full"
                value={group.vEdgeWires}
                onChange={(e) =>
                  columnStore.setvEdgeWires(group.name, e.target.value)
                }
              />

            {modifyMode && (
              <div className="flex gap-2 mt-2">
                <select
                  className="border rounded p-1 flex-1"
                  value={selectedColumnsToAdd[group.name] || ""}
                  onChange={(e) =>
                    handleColumnChange(group.name, e.target.value)
                  }
                >
                  <option value="">Select Column</option>
                  {columnStore.columns
                    .filter((bs) => bs.group === null)
                    .slice()
                    .sort((a, b) => {
                      const numA = parseInt(a.label.replace(/\D/g, ""), 10);
                      const numB = parseInt(b.label.replace(/\D/g, ""), 10);
                      return numA - numB;
                    })
                    .map((bs) => (
                      <option key={bs.id} value={bs.id}>
                        {bs.label}
                      </option>
                    ))}
                </select>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => {
                    const selectedId = selectedColumnsToAdd[group.name];
                    if (selectedId) {
                      columnStore.addColumnToGroup(group.name, selectedId);
                      handleColumnChange(group.name, "");
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
                  columnStore.addGroup({
                    name: newGroupName,
                    columns: [],
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

      <form className="space-y-4">
        {columnStore.columnInputs &&
          Object.keys(columnStore.columnInputs).map((bs) => (
            <>
              <div className="text-sm">{bs}</div>
              <div className="flex  gap-2">
                <InputNumber
                  label="+x Offset:"
                  value={columnStore.columnInputs[bs]["+x"]}
                  onChange={(newLength: number) => {
                    columnStore.setColumnInputs({
                      ...columnStore.columnInputs,
                      [bs]: {
                        ...columnStore.columnInputs[bs],
                        ["+x"]: newLength,
                      },
                    });
                  }}
                />
                <InputNumber
                  label="-y Offset:"
                  value={columnStore.columnInputs[bs]["+y"]}
                  onChange={(newHeight: number) => {
                    columnStore.setColumnInputs({
                      ...columnStore.columnInputs,
                      [bs]: {
                        ...columnStore.columnInputs[bs],
                        ["+y"]: newHeight,
                      },
                    });
                  }}
                />
              </div>
              <div className="flex  gap-2">
                <InputNumber
                  label="-x Offset:"
                  value={columnStore.columnInputs[bs]["-x"]}
                  onChange={(newLength: number) => {
                    columnStore.setColumnInputs({
                      ...columnStore.columnInputs,
                      [bs]: {
                        ...columnStore.columnInputs[bs],
                        ["-x"]: newLength,
                      },
                    });
                  }}
                />
                <InputNumber
                  label="+y Offset:"
                  value={columnStore.columnInputs[bs]["-y"]}
                  onChange={(newHeight: number) =>
                    columnStore.setColumnInputs({
                      ...columnStore.columnInputs,
                      [bs]: {
                        ...columnStore.columnInputs[bs],
                        ["-y"]: newHeight,
                      },
                    })
                  }
                />
              </div>
            </>
          ))}
        {/*
        <h1 className="text-md font-medium mb-4 ">Corner Column</h1>

        <div className="flex  gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.cornerLength}
            onChange={(newLength: number) => {
              columnStore.setCornerLength(newLength);
            }}
            disabled={true}
          />
          <InputNumber
            label="width:"
            value={columnStore.cornerWidth}
            onChange={(newHeight: number) =>
              columnStore.setCornerWidth(newHeight)
            }
            disabled={true}
          />
        </div>
        <h1 className="text-md font-medium mb-4 ">Horizontal Column</h1>
        <div className="flex gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.horizontalLength}
            onChange={(newLength: number) => {
              columnStore.setHorizontalLength(newLength);
            }}
            disabled={true}
          />
          <InputNumber
            label="width:"
            value={columnStore.horizontalWidth}
            onChange={(newHeight: number) =>
              columnStore.setHorizontalWidth(newHeight)
            }
            disabled={true}
          />
        </div>
        <h1 className="text-md font-medium mb-4">Vertical Column </h1>
        <div className="flex gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.verticalLength}
            onChange={(newLength: number) => {
              columnStore.setVerticalLength(newLength);
            }}
            disabled={true}
          />
          <InputNumber
            label="width:"
            value={columnStore.verticalWidth}
            onChange={(newHeight: number) =>
              columnStore.setVerticalWidth(newHeight)
            }
            disabled={true}
          />
        </div>
        <InputNumber
          label="InnerOffset:"
          value={columnStore.internalOffset}
          onChange={(newLength: number) => {
            columnStore.setInternalOffset(newLength);
          }}
          // disabled = {true}
        />
      </form>
      */}
      </form>
    </div>
  );
});
