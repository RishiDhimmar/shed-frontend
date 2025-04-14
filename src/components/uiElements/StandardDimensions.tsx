// StandardDimensions.jsx
import wallStore from "../../stores/WallStore";

interface Shed {
  name: string;
  height: number;
  width: number;
  thickness: number;
}

const StandardDimensions = ({ onClose }: { onClose: () => void }) => {
  // Standard shed dimensions
  const standardSheds = [
    { name: "Small Shed", height: 40, width: 50, thickness: 0.4 },
    { name: "Medium Shed", height: 50, width: 60, thickness: 0.5 },
    { name: "Large Shed", height: 60, width: 80, thickness: 0.6 },
    { name: "Extra Large Shed", height: 80, width: 100, thickness: 0.7 },
  ];

  // Function to apply selected standard shed dimensions directly to the store
  const applyStandardDimensions = (shed: Shed) => {
    wallStore.setHeight(shed.height);
    wallStore.setWidth(shed.width);
    wallStore.setWallThickness(shed.thickness);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg p-6 w-1/2">
        <h3 className="text-lg font-medium mb-4">Standard Wall Dimensions</h3>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">Select a standard size:</p>
          <div className="grid grid-cols-1 gap-3">
            {standardSheds.map((shed) => (
              <button
                key={shed.name}
                onClick={() => applyStandardDimensions(shed)}
                className="px-4 py-3 bg-gray-100 rounded hover:bg-gray-200 text-left flex justify-between items-center"
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{shed.name}</div>
                  <div className="text-sm text-gray-600">
                    Width: {shed.width} • Height: {shed.height} • Thickness:{" "}
                    {shed.thickness}
                  </div>
                </div>
                <div className="text-black mr-2 cursor-pointer hover:text-gray-500">
                  Apply
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StandardDimensions;
