import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import columnStore from "../../../stores/ColumnStore";

export const Column = observer(() => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <form className="space-y-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Corner Column</h1>
        <InputNumber
          label="Length:"
          value={columnStore.ColumnLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setCornerLength(newLength);
          }}
        />
        <InputNumber
          label="width:"
          value={columnStore.ColumnWidth}
          onChange={(newHeight: number) =>
            columnStore.setCornerWidth(newHeight)
          }
        />
        <h1 className="text-2xl font-bold mb-6 text-center">
          Horizontal Column
        </h1>
        <InputNumber
          label="Length:"
          value={columnStore.HorizontalLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setHorizontalLength(newLength);
          }}
        />
        <InputNumber
          label="width:"
          value={columnStore.HorizontalWidth}
          onChange={(newHeight: number) =>
            columnStore.setHorizontalWidth(newHeight)
          }
        />
        <h1 className="text-2xl font-bold mb-6 text-center">
          Vertical Column{" "}
        </h1>
        <InputNumber
          label="Length:"
          value={columnStore.VerticalLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setVerticalLength(newLength);
          }}
        />
        <InputNumber
          label="width:"
          value={columnStore.VerticalWidth}
          onChange={(newHeight: number) =>
            columnStore.setVerticalWidth(newHeight)
          }
        />
      </form>
    </div>
  );
});
