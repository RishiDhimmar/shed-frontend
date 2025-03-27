import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import BaseplateDimensions from "../Helpers/BaseplateDimensions";
import InputNumber from "../Helpers/InputNumber";

export const BaseplateInput = observer(() => {
  return (
    <div className="flex flex-col gap-4 overflow-y-scroll h-[calc(100vh-100px)] px-4 bg-white p-8 rounded-2xl shadow-xl w-[300px]  z-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Baseplate Input</h1>
      <div className="flex-col gap-4">
        <InputNumber
          label="Ideal Horizontal Distance:"
          value={baseplateStore.config.idealHorizontalDistance}
          onChange={(newLength: number) =>
            baseplateStore.setIdealHorizontalDistance(newLength)
          }
        />
        <InputNumber
          label="Ideal Vertical Distance:"
          value={baseplateStore.config.idealVerticalDistance}
          onChange={(newLength: number) =>
            baseplateStore.setIdealVerticalDistance(newLength)
          }
        />
      </div>
      <div className="flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Corner Baseplate
        </h1>
        <BaseplateDimensions type="corner" />
      </div>
      <div className="flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Horizontal Baseplate
        </h1>
        <BaseplateDimensions type="horizontal" />
      </div>
      <div className="flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Vertical Baseplate
        </h1>
        <BaseplateDimensions type="vertical" />
      </div>
    </div>
  );
});
