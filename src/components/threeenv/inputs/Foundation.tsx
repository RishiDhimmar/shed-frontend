import columnStore from "../../../stores/ColumnStore";
import InputNumber from "../Helpers/InputNumber";

function Foundation() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[300px] max-w-md mx-auto z-10">
      <form className="space-y-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Corner Foundation
        </h1>
        <h3>R.C.C Size</h3>
        <InputNumber
          label="Bf:"
          value={columnStore.cornerWidth}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setCornerLength(newLength);
          }}
        />
        <InputNumber
          label="Lf:"
          value={columnStore.cornerLength}
          onChange={(newHeight: number) =>
            columnStore.setCornerWidth(newHeight)
          }
        />

        <h3>P.C.C Size</h3>
        <InputNumber
          label="Bf:"
          value={columnStore.horizontalLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setHorizontalLength(newLength);
          }}
        />
        <InputNumber
          label="Lf:"
          value={columnStore.horizontalWidth}
          onChange={(newHeight: number) =>
            columnStore.setHorizontalWidth(newHeight)
          }
        />

        <h3>Depth</h3>
        <InputNumber
          label="D:"
          value={columnStore.verticalLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setVerticalLength(newLength);
          }}
        />
        <InputNumber
          label="d:"
          value={columnStore.verticalWidth}
          onChange={(newHeight: number) =>
            columnStore.setVerticalWidth(newHeight)
          }
        />

        <h3>Short Bar</h3>
        <InputNumber
          label="#:"
          value={columnStore.verticalWidth}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setCornerLength(newLength);
          }}
        />
        <InputNumber
          label="C/C:"
          value={columnStore.verticalWidth}
          onChange={(newHeight: number) =>
            columnStore.setCornerWidth(newHeight)
          }
        />
        <h3>Long Bar</h3>
        <InputNumber
          label="#:"
          value={columnStore.verticalLength}
          onChange={(newLength: number) => {
            console.log(newLength);
            columnStore.setCornerLength(newLength);
          }}
        />
        <InputNumber
          label="C/C:"
          value={columnStore.verticalWidth}
          onChange={(newHeight: number) =>
            columnStore.setCornerWidth(newHeight)
          }
        />
      </form>
    </div>
  );
}

export default Foundation;
