import { useNavigate } from "react-router-dom";
interface CreateProjectPopupProps {
  isOpen: boolean;
  onClose: () => void;
}


const CreateProjectPopup = ({ isOpen, onClose }: CreateProjectPopupProps) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Create Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name*
            </label>
            <input
              type="text"
              placeholder="Premier PEB Engineering System"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Sejpur, Ahmedabad"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer name
            </label>
            <input
              type="text"
              placeholder="Vinayak Shah"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            <div className="flex">
              <button
                type="button"
                className="bg-gray-600 text-white px-4 py-2"
              >
                Choose File
              </button>
              <input
                type="text"
                value="Logo.png"
                readOnly
                className="flex-grow p-2 border border-gray-300 border-l-0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-blue-900"
              onClick={() => navigate("/project")}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPopup;
