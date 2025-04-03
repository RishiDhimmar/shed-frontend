import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import columnStore from "../../../stores/ColumnStore";

export const GroundBeam = observer(() => {
  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Ground Beam</h1>
      <h2 className="text-md font-semibold">Coping Beam</h2>
      <form className="space-y-2">
        <h1 className="text-md font-semi-Bold mt-3 ">Size</h1>

        <div className="flex gap-2">
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

        <h1 className="text-md font-semi-Bold ">Ring </h1>
        <div className="flex gap-2">
          <InputNumber
            label="#"
            value={columnStore.verticalLength}
            onChange={(newLength: number) => {
              columnStore.setVerticalLength(newLength);
            }}
          />
          <InputNumber
            label="C/C"
            value={columnStore.verticalWidth}
            onChange={(newHeight: number) =>
              columnStore.setVerticalWidth(newHeight)
            }
          />
        </div>
        <h1 className="text-md font-semi-Bold">Main Ref </h1>
        <div className="flex gap-2">
          <InputNumber
            label="#"
            value={columnStore.verticalLength}
            onChange={(newLength: number) => {
              columnStore.setVerticalLength(newLength);
            }}
          />
          <InputNumber
            label="C/C"
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
