import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import mullionColumnStore from "../../../stores/MullianColumnStore";

export const MullionColumn = observer(() => {
  return (
    <div className=" p-4">
      <h1 className="text-lg font-bold mb-4">Mullion Column</h1>
      <form className="space-y-2">
        <h1 className="text-md font-medium ">Size</h1>

        <div className="flex gap-2">
          <InputNumber
            label="Length:"
            value={mullionColumnStore.mullionLength}
            // onChange={(newLength: number) => {
            //   mullionColumnStore.setMullionLength(newLength);
            // }}
          />
          <InputNumber
            label="width:"
            value={mullionColumnStore.mullionWidth}
            // onChange={(newHeight: number) =>
            //   mullionColumnStore.setMullionWidth(newHeight)
            // }
          />
        </div>

        <h1 className="text-md font-medium ">Main Ref</h1>
        <hr className=" text-gray-200"></hr>
        <h1 className="  ">First </h1>
        <div className="flex gap-2">
          <InputNumber
            label="#:"
            value={mullionColumnStore.main1}
            onChange={(newLength: number) => {
              mullionColumnStore.setMain1(newLength);
            }}
          />
          <InputNumber
            label="C/C:"
            value={mullionColumnStore.mainCc}
            onChange={(newHeight: number) =>
              mullionColumnStore.setMainCc(newHeight)
            }
          />
        </div>
        <h1 className="text-md font-medium ">Ring : </h1>
        <div className="flex gap-2">
          <InputNumber
            label="#:"
            value={mullionColumnStore.ring1}
            onChange={(newLength: number) => {
              mullionColumnStore.setRing1(newLength);
            }}
          />
          <InputNumber
            label="C/C:"
            value={mullionColumnStore.ringCc}
            onChange={(newHeight: number) =>
              mullionColumnStore.setRingCc(newHeight)
            }
          />
        </div>
      </form>
    </div>
  );
});
