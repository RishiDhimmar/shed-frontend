import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import columnStore from "../../../stores/ColumnStore";

export const Column = observer(() => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Column input</h1>
      <form className="space-y-4">
        <InputNumber
          label="Length:"
          value={columnStore.length}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setLength(newLength);
          }}
        />
        <InputNumber
          label="width:"
          value={columnStore.width}
          onChange={(newHeight: number) => columnStore.setWidth(newHeight)}
        />
      </form>
    </div>
  );
});
