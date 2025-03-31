import { makeAutoObservable } from "mobx";

class UIStore {
  currentComponent = "plot";
  // Set initial visibility: true means visible.
  visibility = {
    plot: true,
    shade: true,
    baseplate: true,
    column: true,
    Foundation: true,
    MullionColumn: true,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentComponent(component: string) {
    this.currentComponent = component;
  }

  toggleVisibility(component: keyof typeof this.visibility) {
    this.visibility[component] = !this.visibility[component];
  }
}

const uiStore = new UIStore();
export default uiStore;
