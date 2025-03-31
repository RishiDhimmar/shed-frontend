import { observer } from "mobx-react-lite";
import wallStore from "../../../stores/WallStore";
import InputNumber from "../Helpers/InputNumber";

export const Shade = observer(() => {
  return (
    <div className="bg-white p-8 rounded shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Shade Input</h1>
      <form className="space-y-4">
        <InputNumber
          label="Height:"
          value={wallStore.height}
          onChange={(newHeight: number) => wallStore.setHeight(newHeight)}
        />
        <InputNumber
          label="Width:"
          value={wallStore.width}
          onChange={(newWidth: number) => wallStore.setWidth(newWidth)}
        />
        <InputNumber
          label="Thickness:"
          value={wallStore.wallThickness}
          onChange={(newThickness: number) =>
            wallStore.setWallThickness(newThickness)
          }
        />
      </form>
    </div>
  );
});
