import { useRef, useState } from "react";

interface ImportModelProps {
  isOpen: boolean;
  onClose: () => void;
  onShadeImport: (file: File) => void;
  onBaseplateImport: (file: File) => void;
}

const ImportModel = ({
  isOpen,
  onClose,
  onShadeImport,
  onBaseplateImport,
}: ImportModelProps) => {
  const [selectedType, setSelectedType] = useState<
    "shade" | "baseplate" | "combination" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleBoxClick = (type: "shade" | "baseplate" | "combination") => {
    setSelectedType(type);
    setSelectedFile(null); // reset file when switching
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleImport = () => {
    if (!selectedFile || !selectedType) return;

    switch (selectedType) {
      case "shade":
        onShadeImport(selectedFile);
        break;
      case "baseplate":
        onBaseplateImport(selectedFile);
        break;
      case "combination":
        // Add combination handler if needed
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".dxf"
        onChange={handleFileChange}
      />

      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Import</h2>
        </div>

        <div className="flex flex-col p-6 gap-2">
          <div className="flex gap-2  h-15">
            <div
              className={`border-2 w-full  flex justify-center items-center cursor-pointer ${
                selectedType === "shade"
                  ? "border-gray-600 font-semibold"
                  : "border-gray-300"
              }`}
              onClick={() => handleBoxClick("shade")}
            >
              Shade
            </div>
            <div
              className={`border-2 w-full flex justify-center items-center cursor-pointer ${
                selectedType === "baseplate"
                  ? "border-gray-600 font-semibold"
                  : "border-gray-300"
              }`}
              onClick={() => handleBoxClick("baseplate")}
            >
              Baseplate
            </div>
            <div
              className={`border-2 w-full flex justify-center items-center cursor-pointer ${
                selectedType === "combination"
                  ? "border-gray-600  font-semibold"
                  : "border-gray-300"
              }`}
              onClick={() => handleBoxClick("combination")}
            >
              Combination
            </div>
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-600 text-center mt-2">
              Selected File:{" "}
              <span className="font-medium">{selectedFile.name}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFile}
            onClick={handleImport}
            className="px-4 py-2 bg-gray-800 text-white rounded  "
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModel;
