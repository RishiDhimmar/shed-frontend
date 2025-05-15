import { handleSaveProject } from "../../../utils/handleSaveProject";

function SaveButton() {
  return (
    <>
      <button
        className="btn btn-primary cursor-pointer bg-white  mx-3 px-3 py-2 text-black"
        onClick={() => handleSaveProject()}
      >
        Save
      </button>
    </>
  );
}

export default SaveButton;
