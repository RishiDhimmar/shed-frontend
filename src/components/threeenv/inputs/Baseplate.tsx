import { observer } from "mobx-react-lite";
import baseplateStore from "../../../stores/BasePlateStore";
import BaseplateDimensions from "../Helpers/BaseplateDimensions";
import InputNumber from "../Helpers/InputNumber";

export const BaseplateInput = observer(() => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Baseplate Input</h1>
      <div className="flex-col gap-4">
        <InputNumber
          label="Ideal Horizontal Distance:"
          value={baseplateStore.idealHorizontalDistance}
          onChange={(newLength: number) =>
            baseplateStore.setIdealHorizontalDistance(newLength)
          }
        />
        <InputNumber
          label="Ideal Vertical Distance:"
          value={baseplateStore.idealVerticalDistance}
          onChange={(newLength: number) =>
            baseplateStore.setIdealVerticalDistance(newLength)
          }
        />
      </div>
      <div className="flex-col gap-4">
        <h1 className="text-md font-medium mb-4 ">Corner Baseplate</h1>
        <BaseplateDimensions type="corner" />
      </div>
      <div className="flex-col gap-4">
        <h1 className="text-md font-medium mb-4">Horizontal Baseplate</h1>
        <BaseplateDimensions type="horizontal" />
      </div>
      <div className="flex-col gap-4">
        <h1 className="text-md font-medium mb-4">Vertical Baseplate</h1>
        <BaseplateDimensions type="vertical" />
      </div>
    </div>
  );
});
