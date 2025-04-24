import * as data from "./data.json";
import * as data2 from "./data2.json";
import * as data3 from "./data3.json";
import * as data4 from "./data4.json";
import * as data5 from "./data5.json";
import * as data6 from "./data6.json";
import uiStore from "../../../stores/uiStore";
import { observer } from "mobx-react-lite";

const dataMap = { data, data2, data3, data4, data5, data6 };
const ShedSelector = observer(() => {
  return (
    <>
      <div className="flex flex-col w-50">
        {Object.keys(dataMap).map((key) => (
          <button
            key={key}
            onClick={() => uiStore.setActiveKey(key)}
            style={{
              display: "block",
              margin: "0.5rem 0",
              backgroundColor: uiStore.activeKey === key ? "#ccc" : "#fff",
              padding: "0.5rem",
              border: "1px solid #aaa",
              width: "100%",
              cursor: "pointer",
            }}
          >
            {key}.json
          </button>
        ))}
      </div>
    </>
  );
});

export default ShedSelector;
