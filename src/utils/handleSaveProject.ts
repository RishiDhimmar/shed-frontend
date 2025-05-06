import { saveAs } from "file-saver";
import { toJS } from "mobx";
import basePlotStore from "../stores/BasePlotStore";
import baseplateStore from "../stores/BasePlateStore";
import columnStore from "../stores/ColumnStore";
import foundationStore from "../stores/FoundationStore";
import wallStore from "../stores/WallStore";
import mullionColumnStore from "../stores/MullianColumnStore";
import uiStore from "../stores/UIStore";

export const handleSaveProject = () => {
  const projectData = {
    basePlot: toJS(basePlotStore),
    wall: toJS(wallStore),
    baseplate: toJS(baseplateStore),
    column: toJS(columnStore),
    foundation: toJS(foundationStore),
    mullionColumn: toJS(mullionColumnStore),
    groundBeam: toJS(basePlotStore),
    circles: (uiStore.data.curves || []).filter((c) => c.type === "CIRCLE"),
    lines: uiStore.data.lines || [],
    polygons: uiStore.data.polygons || [],
    texts: uiStore.data.texts || [],
  };

  const jsonBlob = new Blob([JSON.stringify(projectData, null, 2)], {
    type: "application/json",
  });
  saveAs(jsonBlob, "project_data.json");

  uiStore.isModified = false;
};
