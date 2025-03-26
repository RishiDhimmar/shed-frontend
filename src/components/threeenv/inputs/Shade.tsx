import { observer } from "mobx-react-lite";
import wallStore from "../../../stores/WallStore";



export const Shade = observer(() => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Shade Input</h1>
      <form className="space-y-4">
        <input
          type="number"
          placeholder="Length of shade (in meters)"
          value={wallStore.height}
          onChange={(e) => wallStore.setHeight(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Width of shade (in meters)"
          value={wallStore.width}
          onChange={(e) => wallStore.setWidth(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Thickness of shade"
          value={wallStore.wallThickness}
          onChange={(e) => wallStore.setWallThickness(Number(e.target.value))}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </form>
    </div>
  );
});
