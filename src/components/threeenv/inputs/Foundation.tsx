import { observer } from "mobx-react-lite";

import InputNumber from "../Helpers/InputNumber";
import foundationStore from "../../../stores/FoundationStore";

export const Foundation = observer(() => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <form className="space-y-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Corner Foundation
        </h1>
        <h3>R.C.C Size</h3>
        <InputNumber
          label="Bf:"
          value={foundationStore.RccBf}
          onChange={(newLength: number) => {
            console.log(newLength);
            foundationStore.setRccBF(newLength);
          }}
        />
        <InputNumber
          label="Lf:"
          value={foundationStore.rccLf}
          onChange={(newHeight: number) => foundationStore.setRccLf(newHeight)}
        />

        <h3>P.C.C Size</h3>
        <InputNumber
          label="Bf:"
          value={foundationStore.pccWidth}
          onChange={(newLength: number) => {
            console.log(newLength);
            foundationStore.setPccWidth(newLength);
          }}
        />
        <InputNumber
          label="Lf:"
          value={foundationStore.pccLength}
          onChange={(newHeight: number) =>
            foundationStore.setPccLength(newHeight)
          }
        />

        <h3>Depth</h3>
        <InputNumber
          label="D:"
          value={foundationStore.depthD}
          onChange={(newLength: number) => {
            console.log(newLength);
            foundationStore.setDepthD(newLength);
          }}
        />
        <InputNumber
          label="d:"
          value={foundationStore.depthd}
          onChange={(newHeight: number) => foundationStore.setDepthd(newHeight)}
        />

        <h3>Short Bar</h3>
        <InputNumber
          label="#:"
          value={foundationStore.shortBarCount}
          onChange={(newLength: number) => {
            console.log(newLength);
            foundationStore.setShortBarCount(newLength);
          }}
        />
        <InputNumber
          label="C/C:"
          value={foundationStore.shortBarSpacing}
          onChange={(newHeight: number) =>
            foundationStore.setShortBarSpacing(newHeight)
          }
        />
        <h3>Long Bar</h3>
        <InputNumber
          label="#:"
          value={foundationStore.longBarCount}
          onChange={(newLength: number) => {
            console.log(newLength);
            foundationStore.setLongBarCount(newLength);
          }}
        />
        <InputNumber
          label="C/C:"
          value={foundationStore.longBarSpacing}
          onChange={(newHeight: number) =>
            foundationStore.setLongBarSpacing(newHeight)
          }
        />
      </form>
    </div>
  );
});
