// import InputNumber from "./InputNumber";
// import baseplateStore from "../../../stores/BasePlateStore";
// import { observer } from "mobx-react-lite";

// const BaseplateDimensions = observer(({ type }: any)  => {
//   const config = baseplateStore.config[type]
//   return (
//     <>
//       <InputNumber
//         label="Length:"
//         value={config.length}
//         onChange={(newLength: number) =>
//           baseplateStore.setLength(type, newLength)
//         }
//       />
//       <InputNumber
//         label="Width:"
//         value={config?.width}
//         onChange={(newLength: number) =>
//           baseplateStore.setWidth(type, newLength)
//         }
//       />
//       {config?.offsetX != undefined && (
//         <InputNumber
//           label="OffsetX:"
//           value={config?.offsetX}
//           onChange={(newLength: number) =>
//             baseplateStore.setOffsetX(type, newLength)
//           }
//         />
//       )}

//       {config?.offsetY != undefined && (
//         <InputNumber
//           label="OffsetY:"
//           value={config?.offsetY}
//           onChange={(newLength: number) =>
//             baseplateStore.setOffsetY(type, newLength)
//           }
//         />
//       )}
//     </>
//   );
// })

// export default BaseplateDimensions;
import InputNumber from "./InputNumber";
import baseplateStore from "../../../stores/BasePlateStore";
import { observer } from "mobx-react-lite";
import { BaseplateType } from "../../../stores/BasePlateStore";

interface BaseplateDimensionsProps {
  type: BaseplateType;
}

const BaseplateDimensions = observer(({ type }: BaseplateDimensionsProps) => {
  const config = baseplateStore.config[type];

  return (
    <>
      <InputNumber
        label="Length:"
        value={config.length}
        onChange={(newLength: number) => baseplateStore.setLength(type, newLength)}
      />
      <InputNumber
        label="Width:"
        value={config.width}
        onChange={(newWidth: number) => baseplateStore.setWidth(type, newWidth)}
      />
      {config.offsetX !== undefined && (
        <InputNumber
          label="OffsetX:"
          value={config.offsetX}
          onChange={(newOffsetX: number) => baseplateStore.setOffsetX(type, newOffsetX)}
        />
      )}
      {config.offsetY !== undefined && (
        <InputNumber
          label="OffsetY:"
          value={config.offsetY}
          onChange={(newOffsetY: number) => baseplateStore.setOffsetY(type, newOffsetY)}
        />
      )}
    </>
  );
});

export default BaseplateDimensions;
