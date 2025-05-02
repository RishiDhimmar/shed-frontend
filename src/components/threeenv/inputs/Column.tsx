import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import columnStore from "../../../stores/ColumnStore";
import basePlotStore from "../../../stores/BasePlotStore";
import baseplateStore from "../../../stores/BasePlateStore";

export const Column = observer(() => {
  return (
    <div className=" p-6">
      <h1 className="text-lg font-bold mb-4 "> Column Inputs</h1>
      <form className="space-y-4">
        {Array.from(baseplateStore.groups.values()).map((bs) => (
          <>
            {console.log(bs)}
            <div className="text-sm">{bs.name}</div>
            <div className="flex  gap-2">
              <InputNumber
                label="+x Offset:"
                value={columnStore.columnInputs[bs.type]["+x"]}
                onChange={(newLength: number) => {
                  columnStore.setColumnInputs({
                    ...columnStore.columnInputs,
                    [bs.type]: {
                      ...columnStore.columnInputs[bs.type],
                      ["+x"]: newLength,
                    },
                  });
                }}
              />
              <InputNumber
                label="-y Offset:"
                value={columnStore.columnInputs[bs.type]["+y"]}
                onChange={(newHeight: number) =>
                  columnStore.setColumnInputs({
                    ...columnStore.columnInputs,
                    [bs.type]: {
                      ...columnStore.columnInputs[bs.type],
                      ["+y"]: newHeight,
                    },
                  })
                }
              />
            </div>
            <div className="flex  gap-2">
              <InputNumber
                label="-x Offset:"
                value={columnStore.columnInputs[bs.type]["-x"]}
                onChange={(newLength: number) =>
                  columnStore.setColumnInputs({
                    ...columnStore.columnInputs,
                    [bs.type]: {
                      ...columnStore.columnInputs[bs.type],
                      ["-x"]: newLength,
                    },
                  })
                }
              />
              <InputNumber
                label="+y Offset:"
                value={columnStore.columnInputs[bs.type]["-y"]}
                onChange={(newHeight: number) =>
                  columnStore.setColumnInputs({
                    ...columnStore.columnInputs,
                    [bs.type]: {
                      ...columnStore.columnInputs[bs.type],
                      ["-y"]: newHeight,
                    },
                  })
                }
              />
            </div>
          </>
        ))}
        <h1 className="text-md font-medium mb-4 ">Corner Column</h1>

        <div className="flex  gap-2">
          <InputNumber
            label="Length:"
            value={columnStore.cornerLength}
            onChange={(newLength: number) => {
              columnStore.setCornerLength(newLength);
            }}
            disabled={true}
          />
          <InputNumber
            label="width:"
            value={columnStore.cornerWidth}
            onChange={(newHeight: number) =>
              columnStore.setCornerWidth(newHeight)
            }
            disabled={true}
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
            disabled={true}
          />
          <InputNumber
            label="width:"
            value={columnStore.horizontalWidth}
            onChange={(newHeight: number) =>
              columnStore.setHorizontalWidth(newHeight)
            }
            disabled={true}
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
            disabled={true}
          />
          <InputNumber
            label="width:"
            value={columnStore.verticalWidth}
            onChange={(newHeight: number) =>
              columnStore.setVerticalWidth(newHeight)
            }
            disabled={true}
          />
        </div>
        <InputNumber
          label="InnerOffset:"
          value={columnStore.internalOffset}
          onChange={(newLength: number) => {
            columnStore.setInternalOffset(newLength);
          }}
          // disabled = {true}
        />
      </form>
    </div>
  );
});
