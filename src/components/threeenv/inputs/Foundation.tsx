import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import foundationStore, {
  FoundationType,
} from "../../../stores/FoundationStore";

// Key-label mapping for UI readability
const LABEL_MAP: { [key: string]: string } = {
  RccBf: "RCC Width",
  rccLf: "RCC Length",
  pccWidth: "PCC Width",
  pccLength: "PCC Length",
  depthD: "Depth (D)",
  depthd: "Depth (d)",
  shortBarCount: "Short Bar Count",
  shortBarSpacing: "Short Bar Space",
  longBarCount: "Long Bar Count",
  longBarSpacing: "Long Bar Space",
};

const Foundation = observer(() => {
  const groups = [
    { label: "P.C.C Size", keys: ["pccWidth", "pccLength"] },
    { label: "R.C.C Size", keys: ["RccBf", "rccLf"] },
    { label: "Depth", keys: ["depthD", "depthd"] },
    { label: "Short Bar", keys: ["shortBarCount", "shortBarSpacing"] },
    { label: "Long Bar", keys: ["longBarCount", "longBarSpacing"] },
  ];

  return (
    <div className="p-6 z-0">
      <h1 className="text-lg font-bold mb-2">Foundation Parameters</h1>
      <form className="space-y-4">
        {Object.keys(foundationStore.foundationInputs).map((grp) => (
          <>
            <div className="text-sm">{grp}</div>
            <div className="flex  gap-2">
              <InputNumber
                label="+x Offset:"
                value={foundationStore.foundationInputs[grp]["+x"]}
                onChange={(newLength: number) => {
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["+x"]: newLength,
                    },
                  });
                }}
              />
              <InputNumber
                label="-y Offset:"
                value={foundationStore.foundationInputs[grp]["+y"]}
                onChange={(newHeight: number) => {
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["+y"]: newHeight,
                    },
                  });
                }}
              />
            </div>
            <div className="flex  gap-2">
              <InputNumber
                label="-x Offset:"
                value={foundationStore.foundationInputs[grp]["-x"]}
                onChange={(newLength: number) => {
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["-x"]: newLength,
                    },
                  });
                }}
              />
              <InputNumber
                label="+y Offset:"
                value={foundationStore.foundationInputs[grp]["-y"]}
                onChange={(newHeight: number) =>
                  foundationStore.setFoundationInputs({
                    ...foundationStore.foundationInputs,
                    [grp]: {
                      ...foundationStore.foundationInputs[grp],
                      ["-y"]: newHeight,
                    },
                  })
                }
              />
            </div>
          </>
        ))}
      </form>
      {/*}
      <form className="space-y-2">
        {Object.entries(foundationStore.values).map(([type, params]) => (
          <div key={type}>
            <h2 className="text-md font-semibold mb-3">
              {type.charAt(0).toUpperCase() + type.slice(1)} Foundation
            </h2>
            <div className="space-y-1">
              {groups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="text-sm ">{group.label}</div>
                  <div className="flex gap-2">
                    {group.keys.map((key) => (
                      <InputNumber
                        key={key}
                        label={LABEL_MAP[key] || key} // Use mapped labels for UI
                        value={params[key as keyof typeof params]}
                        onChange={(v) =>
                          foundationStore.setParameter(
                            type as FoundationType,
                            key as keyof typeof params,
                            v
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
      */}
    </div>
  );
});

export default Foundation;
