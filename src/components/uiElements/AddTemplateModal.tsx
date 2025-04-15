// AddTemplateModal.jsx
import { useEffect, useState } from "react";
import uiStore, { Template } from "../../stores/UIStore";
import { motion } from "framer-motion";

const AddTemplateModal = ({
  onClose,
  templateToEdit = null,
}: {
  onClose: () => void;
  templateToEdit?: Template | null;
}) => {
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [horizontalDistance, setHorizontalDistance] = useState("");
  const [verticalDistance, setVerticalDistance] = useState("");

  // Populate form when editing an existing template
  useEffect(() => {
    if (templateToEdit) {
      setTemplateName(templateToEdit.name);
      setTemplateType(templateToEdit.type);

      if (templateToEdit.type === "shed" && templateToEdit.dimensions) {
        const dimensions = templateToEdit.dimensions as {
          length: string;
          width: string;
          thickness: string;
        };
        setLength(dimensions.length);
        setWidth(dimensions.width);
        setThickness(dimensions.thickness);
      } else if (
        templateToEdit.type === "baseplate" &&
        templateToEdit.dimensions
      ) {
        const dimensions = templateToEdit.dimensions as {
          idealHorizontalDistance: number;
          idealVerticalDistance: number;
        };
        setHorizontalDistance(dimensions.idealHorizontalDistance.toString());
        setVerticalDistance(dimensions.idealVerticalDistance.toString());
      }
    }
  }, [templateToEdit]);

  const handleSubmit = () => {
    const newTemplate: Omit<Template, "id" | "createdAt"> = {
      name: templateName,
      type: templateType,
      dimensions:
        templateType === "shed"
          ? { length, width, thickness }
          : {
              idealHorizontalDistance: parseFloat(horizontalDistance),
              idealVerticalDistance: parseFloat(verticalDistance),
            },
    };

    if (templateToEdit) {
      uiStore.editTemplate(templateToEdit.id, newTemplate);
    } else {
      uiStore.addTemplate(newTemplate);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-[999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h3 className="text-lg font-medium mb-4">Add New Template</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type
            </label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="shed">Shed</option>
              <option value="baseplate">Baseplate</option>
            </select>
          </div>

          {templateType === "shed" && (
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Shed Dimensions</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Width (m)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Thickness (m)
                  </label>
                  <input
                    type="number"
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {templateType === "baseplate" && (
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Baseplate Dimensions</h4>
              <div className="flex gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Ideal horizontal Distance
                  </label>
                  <input
                    type="number"
                    value={horizontalDistance}
                    onChange={(e) => setHorizontalDistance(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Vertical Distance
                  </label>
                  <input
                    type="number"
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
            disabled={!templateName || !templateType}
            className={`px-4 py-2 rounded ${
              !templateName || !templateType
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTemplateModal;
