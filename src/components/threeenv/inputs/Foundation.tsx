import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import foundationStore, {
  FoundationType,
} from "../../../stores/FoundationStore";

const Foundation = observer(() => {
  // Define groups with labels and keys that should appear side by side
  const groups = [
    { label: "R.C.C Size", keys: ["RccBf", "rccLf"] },
    { label: "P.C.C Size", keys: ["pccWidth", "pccLength"] },
    { label: "Depth", keys: ["depthD", "depthd"] },
    { label: "Short Bar", keys: ["shortBarCount", "shortBarSpacing"] },
    { label: "Long Bar", keys: ["longBarCount", "longBarSpacing"] },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Foundation Parameters</h1>
      <form className="space-y-6">
        {Object.entries(foundationStore.values).map(([type, params]) => (
          <div key={type}>
            <h2 className="text-md font-semibold mb-4 mt-6">
              {type.charAt(0).toUpperCase() + type.slice(1)} Foundation
            </h2>
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <div className="text-sm font-semibold">{group.label}</div>
                  <div className="flex gap-2">
                    {group.keys.map((key) => (
                      <InputNumber
                        key={key}
                        label={key}
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
    </div>
  );
});

export default Foundation;
