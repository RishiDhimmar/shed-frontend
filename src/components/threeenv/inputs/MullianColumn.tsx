import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import mullionColumnStore from "../../../stores/MullianColumnStore";

export const MullionColumn = observer(() => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6 ">Shade Input</h1>
      <form className="space-y-4">
        <InputNumber
          label="Length:"
          value={mullionColumnStore.mullionLength}
          onChange={(newHeight: number) =>
            mullionColumnStore.setMullionLength(newHeight)
          }
        />
        <InputNumber
          label="Width:"
          value={mullionColumnStore.mullionWidth}
          onChange={(newWidth: number) =>
            mullionColumnStore.setMullionWidth(newWidth)
          }
        />
      </form>
    </div>
  );
});
