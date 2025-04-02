import { handleSaveProject } from "./handleSaveProject";

export default function Save() {
  return (
    <button
      className="bg-white px-3 py-2 rounded-md shadow-md hover:bg-gray-300 cursor-pointer"
      onClick={handleSaveProject}
    >
      Save
    </button>
  );
}
