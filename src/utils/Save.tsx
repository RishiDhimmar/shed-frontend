import { handleSaveProject } from "./handleSaveProject";

export default function Save() {
  return (
    <button
      className="bg-gray-300 px-3 py-2 rounded-md shadow-md hover:bg-gray-400 cursor-pointer w-28"
      onClick={handleSaveProject}
    >
      Save
    </button>
  );
}
