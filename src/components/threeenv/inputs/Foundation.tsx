import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import foundationStore, {
  FoundationType,
} from "../../../stores/FoundationStore";
import { useState } from "react";
import columnStore from "../../../stores/ColumnStore";
import { toJS } from "mobx";
import { Shed3DConfig } from "../../../Constants";
import configStore from "../../../stores/ConfigStore";

// Key-label mapping for UI readability
const LABEL_MAP: { [key: string]: string } = {
  RccBf: "RCC Width",
  rccLf: "RCC Length",
  pccWidth: "PCC Width",
  pccLength: "PCC Length",
  depthD: "Depth (D)",
  depthd: "Depth (d)",
  shortBarCount: "Short Bar Count",
  shortBarSpacing: "Short Bar Space",
  longBarCount: "Long Bar Count",
  longBarSpacing: "Long Bar Space",
};

const Foundation = observer(() => {
  const groups = [
    { label: "P.C.C Size", keys: ["pccWidth", "pccLength"] },
    { label: "R.C.C Size", keys: ["RccBf", "rccLf"] },
    { label: "Depth", keys: ["depthD", "depthd"] },
    { label: "Short Bar", keys: ["shortBarCount", "shortBarSpacing"] },
    { label: "Long Bar", keys: ["longBarCount", "longBarSpacing"] },
  ];

  const [modifyMode, setModifyMode] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFoundationsToAdd, setSelectedFoundationsToAdd] = useState<{
    [groupName: string]: string;
  }>({});
  const [frustumHeight, setFrustumHeight] = useState(
    Shed3DConfig.heights.FRUSTUM * 1000
  );
  const [rccHeight, setRccHeight] = useState(Shed3DConfig.heights.RCC * 1000);
  const handleFoundationChange = (groupName: string, columnId: string) => {
    setSelectedFoundationsToAdd((prev) => ({
      ...prev,
      [groupName]: columnId,
    }));
  };

  return (
    <div className="p-6 z-0">
      <h1 className="text-lg font-bold mb-2">Foundation Parameters</h1>
      {foundationStore.groups.map((group) => (
        <div key={group.name} className="my-2 border rounded p-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold">{group.name}</div>
            {modifyMode && (
              <button
                className="text-red-600 text-xs hover:underline"
                onClick={() => foundationStore.deleteGroup(group.name)}
              >
                Delete Group
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {group.foundations?.map((bs) => (
              <div
                key={bs.id}
                className="inline-flex items-center justify-between text-sm text-gray-900 ring-1 ring-gray-300 rounded px-2 py-1"
              >
                {bs?.label ? bs.label : "No Label"}
                {modifyMode && (
                  <button
                    className="ml-2 text-red-500 text-xs cursor-pointer"
                    onClick={() =>
                      foundationStore.removeFoundationFromGroup(
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
                value={selectedFoundationsToAdd[group.name] || ""}
                onChange={(e) =>
                  handleFoundationChange(group.name, e.target.value)
                }
              >
                <option value="">Select Foundation</option>
                {foundationStore.foundations
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
                  const selectedId = selectedFoundationsToAdd[group.name];
                  if (selectedId) {
                    foundationStore.addFoundationToGroup(
                      group.name,
                      selectedId
                    );
                    handleFoundationChange(group.name, "");
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
                foundationStore.addGroup({
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
      <form className="space-y-4">
        {Object.keys(foundationStore.foundationInputs).map((grp) => (
          <>
            <div className="text-sm">{grp}</div>
            <div className="flex  gap-2">
              <InputNumber
                label="+x Offset:"
                value={foundationStore.foundationInputs[grp]["+x"]}
                onChange={(newLength: number) => {
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["+x"]: newLength,
                    },
                  });
                }}
              />
              <InputNumber
                label="-y Offset:"
                value={foundationStore.foundationInputs[grp]["+y"]}
                onChange={(newHeight: number) => {
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["+y"]: newHeight,
                    },
                  });
                }}
              />
            </div>
            <div className="flex  gap-2">
              <InputNumber
                label="-x Offset:"
                value={foundationStore.foundationInputs[grp]["-x"]}
                onChange={(newLength: number) => {
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["-x"]: newLength,
                    },
                  });
                }}
              />
              <InputNumber
                label="+y Offset:"
                value={foundationStore.foundationInputs[grp]["-y"]}
                onChange={(newHeight: number) =>
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["-y"]: newHeight,
                    },
                  })
                }
              />
            </div>
          </>
        ))}
        {/*<input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Frustum Height"
          value={frustumHeight}
          onChange={(e) => {
            const val = Number(e.target.value);
            setFrustumHeight(val);
            configStore.update3DHeights({ FRUSTUM: val / 1000 });
          }}
        />*/}
        <InputNumber
          label="Frustum Height :"
          value={frustumHeight}
          onChange={(newHeight: number) => {
            setFrustumHeight(newHeight);
            configStore.update3DHeights({ FRUSTUM: newHeight / 1000 });
          }}
        />
        <InputNumber
          label="RCC Height : "
          value={rccHeight}
          onChange={(newHeight: number) => {
            setRccHeight(newHeight);
            configStore.update3DHeights({ RCC: newHeight / 1000 });
          }}
        />
      </form>
      {/*}
      <form className="space-y-2">
        {Object.entries(foundationStore.values).map(([type, params]) => (
          <div key={type}>
            <h2 className="text-md font-semibold mb-3">
              {type.charAt(0).toUpperCase() + type.slice(1)} Foundation
            </h2>
            <div className="space-y-1">
              {groups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="text-sm ">{group.label}</div>
                  <div className="flex gap-2">
                    {group.keys.map((key) => (
                      <InputNumber
                        key={key}
                        label={LABEL_MAP[key] || key} // Use mapped labels for UI
                        value={params[key as keyof typeof params]}
                        onChange={(v) =>
                          foundationStore.setParameter(
                            type as FoundationType,
                            key as keyof typeof params,
                            v
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
      */}
    </div>
  );
});

export default Foundation;
