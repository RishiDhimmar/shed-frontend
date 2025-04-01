import { observer } from "mobx-react-lite";

export const MullionColumn = observer(() => {
  return (
    <div className="bg-white p-8 rounded shadow-xl w-[300px] max-w-md ml-2 z-10">
      <h1 className="text-2xl font-bold mb-6">Mullion Column</h1>
      <p className="text-gray-700">
        The mullion column dimensions are determined based on the thickness of
        the wall. Adjust the wall thickness to modify the mullion size
        accordingly.
      </p>
    </div>
  );
});
