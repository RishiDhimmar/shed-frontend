import { makeAutoObservable } from "mobx";

class UIStore {
  currentComponent = "plot";

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentComponent(component: string) {
    this.currentComponent = component;
  }
}

const uiStore = new UIStore();
export default uiStore;
