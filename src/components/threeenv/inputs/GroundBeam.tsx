import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import columnStore from "../../../stores/ColumnStore";
import configStore from "../../../stores/ConfigStore";
import { useState } from "react";

export const GroundBeam = observer(() => {
  const [beamHeight, setBeamHeight] = useState(
    configStore.shed3D.heights.GROUND_BEAM
  );
  const [beamHeightDimention, setBeamHeightDimention] = useState(
    configStore.shed3D.heights.GB_Z_HEIGHT
  ); // [Dimention]
  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Ground Beam</h1>
      <h2 className="text-md font-semibold">Coping Beam</h2>
      <form className="space-y-2">
        <h1 className="text-md font-semi-Bold mt-3 ">Size</h1>

        <div className="flex gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.cornerLength}
            onChange={() => {}}
          />
          <InputNumber
            label="width:"
            value={columnStore.cornerWidth}
            onChange={() => {}}
          />
        </div>

        <h1 className="text-md font-semi-Bold ">Ring </h1>
        <div className="flex gap-2">
          <InputNumber
            label="#"
            value={columnStore.verticalLength}
            onChange={() => {}}
          />
          <InputNumber
            label="C/C"
            value={columnStore.verticalWidth}
            onChange={() => {}}
          />
        </div>
        <h1 className="text-md font-semi-Bold">Main Ref </h1>
        <div className="flex gap-2">
          <InputNumber
            label="#"
            value={columnStore.verticalLength}
            onChange={() => {}}
          />
          <InputNumber
            label="C/C"
            value={columnStore.verticalWidth}
            onChange={() => {}}
          />
        </div>
      </form>
      <div className="flex gap-2">
        <InputNumber
          label="Position:"
          value={beamHeight * 1000}
          onChange={(newHeight: number) => {
            configStore.update3DHeights({ GROUND_BEAM: newHeight / 1000 });
            setBeamHeight(newHeight / 1000);
          }}
        />
        <InputNumber
          label="Height :"
          value={beamHeightDimention * 1000}
          onChange={(newHeight: number) => {
            configStore.update3DHeights({ GB_Z_HEIGHT: newHeight / 1000 });
            setBeamHeightDimention(newHeight / 1000);
          }}
        />
      </div>
    </div>
  );
});
