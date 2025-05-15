import { makeAutoObservable, runInAction } from "mobx";

export type currentComponentType =
  | "plot"
  | "shade"
  | "baseplate"
  | "column"
  | "foundation"
  | "mullionColumn"
  | "groundBeam"
  | "circles"
  | "lines"
  | "polygons"
  | "texts"
  | "ellipses";

export type TemplateType =
  | "baseplate"
  | "column"
  | "foundation"
  | "groundBeam"
  | "shed";

interface TemplateDimensions {
  length: string | number;
  width: string | number;
  thickness: string | number;
}

// For baseplate specific dimensions

// For shade specific dimensions
export interface ShadeTemplateDimensions {
  length: number;
  width: number;
  thickness: number;
}

interface BaseplateTemplateDimensions {
  idealHorizontalDistance: number;
  idealVerticalDistance: number;
}
export interface Template {
  id: number;
  name: string;
  type: string;
  dimensions:
    | TemplateDimensions
    | ShadeTemplateDimensions
    | BaseplateTemplateDimensions
    | null;
  createdAt: string;
}

// Updated interfaces for standards with options

export interface ShadeTemplateOptions {
  lengthOptions: number[];
  widthOptions: number[];
  thicknessOptions: number[];
}

export interface BaseplateTemplateOptions {
  idealHorizontalDistanceOptions: number[];
  idealVerticalDistanceOptions: number[];
}

export interface Standard {
  id: number;
  name: string;
  type: string;
  dimensions: ShadeTemplateOptions | BaseplateTemplateOptions | null;
  createdAt: string;
}

class UIStore {
  currentComponent: currentComponentType = "plot";
  isSidebarOpen = false;
  useStandardInputs = false;
  // Set initial visibility: true means visible.
  visibility = {
    plot: true,
    shade: true,
    baseplate: true,
    column: true,
    foundation: true,
    mullionColumn: true,
    groundBeam: true,
    circles: true,
    lines: true,
    polygons: true,
    annotation: true,
  };
  isDimensionsVisible: boolean = false;

  isModified = false;

  screenshotFn: () => void = () => {};
  pdfExportFn: () => void = () => {};

  templates: Template[] = [];
  standards: Standard[] = [];
  polygons: number[][][] = [];
  data = [];

  constructor() {
    makeAutoObservable(this);
  }

  addTemplate(template: Omit<Template, "id" | "createdAt">) {
    this.templates.push({
      ...template,
      id: this.templates.length + 1,
      createdAt: new Date().toLocaleDateString(),
    });
    this.setModified(true);
  }

  addStandard(standard: Omit<Standard, "id" | "createdAt">) {
    runInAction(() => {
      this.standards.push({
        ...standard,
        id: this.standards.length + 1,
        createdAt: new Date().toLocaleDateString(),
      });
    });

    this.setModified(true);
  }

  getTemplatesByType(type: TemplateType): Template[] {
    return this.templates.filter((template) => template.type === type);
  }

  getStandardsByType(type: string): Standard[] {
    return this.standards.filter((standard) => standard.type === type);
  }

  setCurrentComponent(component: currentComponentType) {
    this.currentComponent = component;
  }

  toggleVisibility(component: keyof typeof this.visibility) {
    this.visibility[component] = !this.visibility[component];
  }

  toggleAllLayoutVisibility() {
    const allHidden = Object.values(this.visibility).every((v) => !v);
    for (const key in this.visibility) {
      this.visibility[key as keyof typeof this.visibility] = allHidden; // if all are hidden, show all, else hide all
    }
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
    this.screenshotFn = fn;
  }

  setPdfExportFn(fn: () => void) {
    this.pdfExportFn = fn;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  toggleStandardInputs() {
    this.useStandardInputs = !this.useStandardInputs;
  }

  setSidebarOpen(open: boolean) {
    this.isSidebarOpen = open;
  }
  setPolygons(polygons: number[][][]) {
    this.polygons = polygons;
  }
}

const uiStore = new UIStore();
export default uiStore;
