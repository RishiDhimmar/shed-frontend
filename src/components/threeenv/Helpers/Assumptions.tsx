import uiStore from "../../../stores/UIStore";
import {
  baseplateAssumptions,
  columnAssumptions,
  foundationAssumptions,
  groundBeamAssumptions,
  mullionColumnAssumptions,
  plotAssumptions,
  shadeAssumptions,
} from "../../assumptions/assumptionsInfo";
import { observer } from "mobx-react-lite";

export const Assumptions = observer(() => {
  return (
    <div className="text-sm w-full max-w-md bg-white p-4 shadow-lg rounded-md mt-2">
      <div className="text-lg font-bold text-center mb-2">Assumptions</div>
      <div className="text-sm w-full max-w-md">
        {uiStore.currentComponent === "plot" && plotAssumptions}
        {uiStore.currentComponent === "shade" && shadeAssumptions}
        {uiStore.currentComponent === "baseplate" && baseplateAssumptions}
        {uiStore.currentComponent === "column" && columnAssumptions}
        {uiStore.currentComponent === "foundation" && foundationAssumptions}
        {uiStore.currentComponent === "mullionColumn" &&
          mullionColumnAssumptions}
        {uiStore.currentComponent === "groundBeam" && groundBeamAssumptions}
      </div>
    </div>
  );
});
