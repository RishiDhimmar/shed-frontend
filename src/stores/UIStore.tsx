import { makeAutoObservable } from "mobx";

export type currentComponentType =
  | "plot"
  | "shade"
  | "baseplate"
  | "column"
  | "foundation"
  | "mullionColumn"
  | "groundBeam";

class UIStore {
  currentComponent: currentComponentType = "plot";
  // Set initial visibility: true means visible.
  visibility = {
    plot: true,
    shade: true,
    baseplate: true,
    column: true,
    foundation: true,
    mullionColumn: true,
    groundBeam: true,
  };
  isDimensionsVisible : boolean = false;

  isModified = false;

  screenshotFn: () => void = () => {};
  pdfExportFn: () => void = () => {console.log("first")};

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentComponent(component: currentComponentType) {
    this.currentComponent = component;
  }

  toggleVisibility(component: keyof typeof this.visibility) {
    this.visibility[component] = !this.visibility[component];
  }

  setDimensionsVisibility(visible: boolean) {
    this.isDimensionsVisible = visible;
  }

  toggleDimensionsVisibility() {
    this.isDimensionsVisible = !this.isDimensionsVisible;
  }

  setModified(modified: boolean) {
    this.isModified = modified;
  }

  setScreenshotFn(fn: () => void) {
    console.log("hii")
    this.screenshotFn = fn;
  }

  setPdfExportFn(fn: () => void) {
    this.pdfExportFn = fn;
  }
}

const uiStore = new UIStore();
export default uiStore;
