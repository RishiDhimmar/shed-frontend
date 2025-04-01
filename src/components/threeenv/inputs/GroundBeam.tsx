import { observer } from "mobx-react-lite";

export const GroundBeam = observer(() => {
  return (
    <div className="bg-white p-8 rounded shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6">Ground Beam</h1>
      <p className="text-gray-700">
        The ground beam follows the same structure and dimensions as the shade.
      </p>
    </div>
  );
});
