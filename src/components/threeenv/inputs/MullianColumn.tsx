import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import mullionColumnStore from "../../../stores/MullianColumnStore";
import wallStore from "../../../stores/WallStore";
import configStore from "../../../stores/ConfigStore";
import { useState } from "react";

export const MullionColumn = observer(() => {
  const [mullionHeight, setMullionHeight] = useState(
    configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT
  );
  return (
    <div className=" p-6">
      <h1 className="text-lg font-bold mb-4">Mullion Column</h1>
      <form className="space-y-2">
        <h1 className="text-md font-medium ">Size</h1>

        <div className="flex gap-2">
          <InputNumber
            label="Length:"
            value={wallStore.wallThickness}
            onChange={() => {}}
            disabled
          />
          <InputNumber
            label="width:"
            value={wallStore.wallThickness}
            onChange={() => {}}
            disabled
          />
        </div>

        {/* <h1 className="text-md font-medium ">Main Ref</h1>
        <hr className=" text-gray-200"></hr>
        <h1 className="  ">First </h1>
        <div className="flex gap-2">
          <InputNumber
            label="#:"
            value={mullionColumnStore.main1}
            onChange={(newLength: number) => {
              () => {};
            }}
          />
          <InputNumber
            label="C/C:"
            value={mullionColumnStore.mainCc}
            onChange={(newHeight: number) =>
            () => {}
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
        </div> */}
      </form>
      <InputNumber
        label="Height:"
        value={mullionHeight * 1000}
        onChange={(newHeight: number) => {
          configStore.update3DHeights({
            MULLION_COLUMNS_Z_HEIGHT: newHeight / 1000,
          });
          setMullionHeight(newHeight/1000);
        }}
      />
    </div>
  );
});
