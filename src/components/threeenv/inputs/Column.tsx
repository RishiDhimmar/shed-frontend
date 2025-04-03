import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import columnStore from "../../../stores/ColumnStore";

export const Column = observer(() => {
  return (
    <div className=" p-6">
      <h1 className="text-lg font-bold mb-4 "> Column Inputs</h1>
      <form className="space-y-4">
        <h1 className="text-md font-medium mb-4 ">Corner Column</h1>

        <div className="flex  gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.cornerLength}
            onChange={(newLength: number) => {
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
        </div>
        <h1 className="text-md font-medium mb-4 ">Horizontal Column</h1>
        <div className="flex gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.horizontalLength}
            onChange={(newLength: number) => {
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
        </div>
        <h1 className="text-md font-medium mb-4">Vertical Column </h1>
        <div className="flex gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.verticalLength}
            onChange={(newLength: number) => {
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
        </div>
      </form>
    </div>
  );
});
