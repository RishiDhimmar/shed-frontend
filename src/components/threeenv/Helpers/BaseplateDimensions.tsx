import React from "react";
import InputNumber from "./InputNumber";
import baseplateStore from "../../../stores/BasePlateStore";
import { observer } from "mobx-react-lite";

const BaseplateDimensions = observer(({ type }: any)  => {
  const config = baseplateStore.config[type]
  return (
    <>
      <InputNumber
        label="Length:"
        value={config.length}
        onChange={(newLength: number) =>
          baseplateStore.setLength(type, newLength)
        }
      />
      <InputNumber
        label="Width:"
        value={config?.width}
        onChange={(newLength: number) =>
          baseplateStore.setWidth(type, newLength)
        }
      />
      {config?.offsetX != undefined && (
        <InputNumber
          label="OffsetX:"
          value={config?.offsetX}
          onChange={(newLength: number) =>
            baseplateStore.setOffsetX(type, newLength)
          }
        />
      )}

      {config?.offsetY != undefined && (
        <InputNumber
          label="OffsetY:"
          value={config?.offsetY}
          onChange={(newLength: number) =>
            baseplateStore.setOffsetY(type, newLength)
          }
        />
      )}
    </>
  );
})

export default BaseplateDimensions;
