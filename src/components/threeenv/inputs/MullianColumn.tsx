import { observer } from "mobx-react-lite";

export const MullionColumn = observer(() => {
  return (
    <div className=" p-4">
      <h1 className="text-xl font-bold mb-4">Mullion Column</h1>
      <p className="text-gray-700">
        The mullion column dimensions are determined based on the thickness of
        the wall. Adjust the wall thickness to modify the mullion size
        accordingly.
      </p>
    </div>
  );
});
