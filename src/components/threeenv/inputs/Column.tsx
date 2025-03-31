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
          value={columnStore.cornerLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setCornerLength(newLength);
          }}
        />
        <InputNumber
          label="width:"
          value={columnStore.cornerWidth}
          onChange={(newHeight: number) =>
            columnStore.setCornerWidth(newHeight)
          }
        />
        <h1 className="text-2xl font-bold mb-6 text-center">
          Horizontal Column
        </h1>
        <InputNumber
          label="Length:"
          value={columnStore.horizontalLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setHorizontalLength(newLength);
          }}
        />
        <InputNumber
          label="width:"
          value={columnStore.horizontalWidth}
          onChange={(newHeight: number) =>
            columnStore.setHorizontalWidth(newHeight)
          }
        />
        <h1 className="text-2xl font-bold mb-6 text-center">
          Vertical Column{" "}
        </h1>
        <InputNumber
          label="Length:"
          value={columnStore.verticalLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setVerticalLength(newLength);
          }}
        />
        <InputNumber
          label="width:"
          value={columnStore.verticalWidth}
          onChange={(newHeight: number) =>
            columnStore.setVerticalWidth(newHeight)
          }
        />
      </form>
    </div>
  );
});
