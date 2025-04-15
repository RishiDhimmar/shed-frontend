import { useEffect, useState } from "react";
import uiStore, { Standard } from "../../stores/UIStore";

const AddStandardModel = ({
  onClose,
  standardToEdit,
}: {
  onClose: () => void;
  standardToEdit?: Standard | null;
}) => {
  const [standardName, setStandardName] = useState("");
  const [standardType, setStandardType] = useState("");

  // Updated: use comma-separated input values instead of arrays
  const [lengthInput, setLengthInput] = useState("");
  const [widthInput, setWidthInput] = useState("");
  const [thicknessInput, setThicknessInput] = useState("");

  const [horizontalDistance, setHorizontalDistance] = useState("");
  const [verticalDistance, setVerticalDistance] = useState("");

  // Populate form fields when editing an existing standard
  useEffect(() => {
    if (standardToEdit) {
      setStandardName(standardToEdit.name);
      setStandardType(standardToEdit.type);

      if (standardToEdit.type === "shed" && standardToEdit.dimensions) {
        const dimensions = standardToEdit.dimensions as {
          lengthOptions: number[];
          widthOptions: number[];
          thicknessOptions: number[];
        };

        setLengthInput(dimensions.lengthOptions.join(", "));
        setWidthInput(dimensions.widthOptions.join(", "));
        setThicknessInput(dimensions.thicknessOptions.join(", "));
      } else if (
        standardToEdit.type === "baseplate" &&
        standardToEdit.dimensions
      ) {
        const dimensions = standardToEdit.dimensions as {
          idealHorizontalDistanceOptions: number[];
          idealVerticalDistanceOptions: number[];
        };

        setHorizontalDistance(
          dimensions.idealHorizontalDistanceOptions[0]?.toString() || ""
        );
        setVerticalDistance(
          dimensions.idealVerticalDistanceOptions[0]?.toString() || ""
        );
      }
    }
  }, [standardToEdit]);

  const handleSubmit = () => {
    const parseValues = (input: string) =>
      input
        .split(",")
        .map((val) => val.trim())
        .filter((val) => val !== "")
        .map(parseFloat);

    const filteredLengths = parseValues(lengthInput);
    const filteredWidths = parseValues(widthInput);
    const filteredThicknesses = parseValues(thicknessInput);

    const newStandard: Omit<Standard, "id" | "createdAt"> = {
      name: standardName,
      type: standardType,
      dimensions:
        standardType === "shed"
          ? {
              lengthOptions: filteredLengths,
              widthOptions: filteredWidths,
              thicknessOptions: filteredThicknesses,
            }
          : {
              idealHorizontalDistanceOptions: [parseFloat(horizontalDistance)],
              idealVerticalDistanceOptions: [parseFloat(verticalDistance)],
            },
    };
    if (standardToEdit) {
      uiStore.editStandard(standardToEdit.id, newStandard);
    } else {
      uiStore.addStandard(newStandard);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-1/2 max-w-md max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Add New Standard</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard Name
            </label>
            <input
              type="text"
              value={standardName}
              onChange={(e) => setStandardName(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard Type
            </label>
            <select
              value={standardType}
              onChange={(e) => setStandardType(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="shed">Shed</option>
              <option value="baseplate">Baseplate</option>
            </select>
          </div>

          {standardType === "shed" && (
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Shed Dimensions</h4>
              <p className="text-xs text-gray-500 mb-3">
                Enter multiple values separated by commas (e.g., 2.0, 2.5, 3.0)
              </p>

              <div className="flex gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="text"
                    value={lengthInput}
                    onChange={(e) => setLengthInput(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Width (m)
                  </label>
                  <input
                    type="text"
                    value={widthInput}
                    onChange={(e) => setWidthInput(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Thickness (m)
                  </label>
                  <input
                    type="text"
                    value={thicknessInput}
                    onChange={(e) => setThicknessInput(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {standardType === "baseplate" && (
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Baseplate Dimensions</h4>
              <p className="text-xs text-gray-500 mb-3">
                Enter multiple values separated by commas (e.g., 2.0, 2.5, 3.0)
              </p>

              <div className="flex gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Ideal Horizontal Distance (m)
                  </label>
                  <input
                    type="text"
                    value={horizontalDistance}
                    onChange={(e) => setHorizontalDistance(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Ideal Vertical Distance (m)
                  </label>
                  <input
                    type="text"
                    value={verticalDistance}
                    onChange={(e) => setVerticalDistance(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!standardName || !standardType}
            className={`px-4 py-2 rounded ${
              !standardName || !standardType
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStandardModel;
