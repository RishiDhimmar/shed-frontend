import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
// import foundationStore, {
//   FoundationType,
// } from "../../../stores/FoundationStore";
import { PiMinusCircle } from "react-icons/pi";
import { SetStateAction, useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { BiSolidDownArrow, BiSolidUpArrow } from "react-icons/bi";
interface Foundation {
  id: number;
  name: string;
}

const Foundation = observer(() => {
  const [foundationGroups, setFoundationGroups] = useState<
    {
      id: number;
      name: string;
      foundations: any[];
      formValues: { [key: string]: number };
    }[]
  >([]);

  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

  const [openFormIndex, setOpenFormIndex] = useState(null);

  const foundations = ["F1", "F2", "F3", "F4", "F5", "f6"];

  const groups = [
    { label: "P.C.C Size", keys: ["pccWidth", "pccLength"] },
    { label: "R.C.C Size", keys: ["RccBf", "rccLf"] },
    { label: "Depth", keys: ["depthD", "depthd"] },
    { label: "Short Bar", keys: ["shortBarCount", "shortBarSpacing"] },
    { label: "Long Bar", keys: ["longBarCount", "longBarSpacing"] },
  ];

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

  const addNewFoundationGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: ` Foundation ${foundationGroups.length + 1}`,
      foundations: [],
      formValues: {} as { [key: string]: number },
    };

    // Initialize form values for all fields
    groups.forEach((group) => {
      group.keys.forEach((key) => {
        newGroup.formValues[key] = 0;
      });
    });
    setFoundationGroups([...foundationGroups, newGroup]);
    setActiveGroupIndex(foundationGroups.length);
  };

  const addFoundation = (foundation: Foundation) => {
    if (activeGroupIndex !== null) {
      const updatedGroups = [...foundationGroups];
      updatedGroups[activeGroupIndex].foundations.push(foundation);
      setFoundationGroups(updatedGroups);
    }
  };

  const removeLastFoundation = (groupIndex: number, event: any) => {
    event.stopPropagation();
    if (foundationGroups[groupIndex].foundations.length > 0) {
      const updatedGroups = [...foundationGroups];
      updatedGroups[groupIndex].foundations.pop();
      setFoundationGroups(updatedGroups);
      if (
        updatedGroups[groupIndex].foundations.length === 0 &&
        openFormIndex === groupIndex
      ) {
        setOpenFormIndex(null);
      }
    }
  };

  // Function to remove an entire foundation group
  const removeFoundationGroup = (groupIndex: number, event: any) => {
    event.stopPropagation();

    const updatedGroups = [...foundationGroups];
    updatedGroups.splice(groupIndex, 1);
    setFoundationGroups(updatedGroups);

    // Adjust active group index if needed
    if (activeGroupIndex !== null && activeGroupIndex >= updatedGroups.length) {
      setActiveGroupIndex(
        updatedGroups.length > 0 ? updatedGroups.length - 1 : null
      );
    }

    // Close form if the open form was in the deleted group
    if (openFormIndex === groupIndex) {
      setOpenFormIndex(null);
    }
  };

  const removeSpecificFoundation = (
    groupIndex: number,
    foundationIndex: number,
    event: any
  ) => {
    event.stopPropagation();
    const updatedGroups = [...foundationGroups];
    updatedGroups[groupIndex].foundations.splice(foundationIndex, 1);
    setFoundationGroups(updatedGroups);

    // Close form if there are no foundations left in that group
    if (
      updatedGroups[groupIndex].foundations.length === 0 &&
      openFormIndex === groupIndex
    ) {
      setOpenFormIndex(null);
    }
  };

  const getAllSelectedFoundations = () => {
    return foundationGroups.flatMap((group) => group.foundations);
  };

  // Function to select a group as active
  const selectGroup = (index: number) => {
    setActiveGroupIndex(index);
  };

  // Function to toggle form visibility
  const toggleForm = (index: number, event: any) => {
    event.stopPropagation();
    if (foundationGroups[index].foundations.length > 0) {
      setOpenFormIndex(
        (openFormIndex === index ? null : index) as SetStateAction<null>
      );
    }
  };

  // Function to update form values
  const updateFormValue = (groupIndex: number, key: string, value: number) => {
    const updatedGroups = [...foundationGroups];
    updatedGroups[groupIndex].formValues[key] = value;
    setFoundationGroups(updatedGroups);
  };

  return (
    <div className="p-6 z-0">
      <h1 className="text-lg font-bold mb-2">Foundation Parameters</h1>

      <div className="flex justify-between items-center">
        <h2 className="mt-4 font-semibold"> Foundations</h2>
        <button
          className="mt-4 text-s text-black hover:bg-gray-300 rounded"
          onClick={addNewFoundationGroup}
        >
          + Add
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {foundations.map((foundation) => {
          const isSelected = getAllSelectedFoundations().includes(foundation);
          const isActive = activeGroupIndex !== null && !isSelected;

          return (
            <div
              key={foundation}
              className={`border border-gray-300 w-full flex items-center justify-center rounded py-2 
        ${
          isActive
            ? "hover:bg-gray-400 cursor-pointer"
            : "opacity-50 bg-gray-100"
        }`}
              onClick={() => isActive && addFoundation(foundation)}
            >
              {foundation}
            </div>
          );
        })}
      </div>

      {/* Foundation Groups */}
      <div className="mt-6">
        {foundationGroups.length > 0 ? (
          foundationGroups.map((group, groupIndex) => (
            <div key={group.id} className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{group.name}</h3>
                <div className="flex gap-0.5 items-center">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => removeLastFoundation(groupIndex, e)}
                  >
                    <PiMinusCircle size={18} />
                  </button>
                  <button
                    className={`p-1 ${
                      group.foundations.length > 0
                        ? "text-gray-500 hover:text-gray-700 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={(e) => toggleForm(groupIndex, e)}
                    disabled={group.foundations.length === 0}
                  >
                    {openFormIndex === groupIndex ? (
                      <BiSolidUpArrow size={18} />
                    ) : (
                      <BiSolidDownArrow size={18} />
                    )}
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700 "
                    onClick={(e) => removeFoundationGroup(groupIndex, e)}
                    title="Delete foundation group"
                  >
                    <MdDeleteOutline size={18} />
                  </button>
                </div>
              </div>

              <div
                className={`border rounded-md p-3 ${
                  activeGroupIndex === groupIndex
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                onClick={() => selectGroup(groupIndex)}
              >
                <div className="flex flex-col gap-3">
                  {group.foundations.length > 0 ? (
                    group.foundations.map((foundation, index) => (
                      <div
                        key={index}
                        className="border border-gray-300 w-full flex justify-around   rounded py-2"
                      >
                        <div>{foundation}</div>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={(e) =>
                            removeSpecificFoundation(groupIndex, index, e)
                          }
                          title="Remove foundation"
                        >
                          <PiMinusCircle size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 ">
                      No foundations selected
                    </div>
                  )}
                </div>
              </div>

              {/* Form for the current group */}
              {openFormIndex === groupIndex && (
                <div className="mt-2 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="space-y-4">
                    {groups.map((formGroup) => (
                      <div key={formGroup.label} className="space-y-1">
                        <div className="text-sm font-medium">
                          {formGroup.label}
                        </div>
                        <div className="flex gap-2">
                          {formGroup.keys.map((key) => (
                            <InputNumber
                              key={key}
                              label={LABEL_MAP[key] || key}
                              value={group.formValues[key]}
                              onChange={(v) =>
                                updateFormValue(groupIndex, key, v)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="mt-4 text-gray-500 text-center border border-dashed border-gray-300 rounded-md p-6">
            Click "Add Group" to create foundation group
          </div>
        )}
      </div>
    </div>
  );
});

export default Foundation;
