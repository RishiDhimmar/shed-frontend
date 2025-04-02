import { observer } from "mobx-react-lite";

export const GroundBeam = observer(() => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ground Beam</h1>
      <p className="text-gray-700">
        The ground beam follows the same structure and dimensions as the shade.
      </p>
    </div>
  );
});
