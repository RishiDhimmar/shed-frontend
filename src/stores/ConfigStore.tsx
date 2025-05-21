// stores/configStore.ts
import { makeAutoObservable } from "mobx";

class ConfigStore {
  backendUrl: string = "http://localhost:3000/";

  shed2D = {
    strokeWidth: {
      WALLS: 5,
      BASE_PLATES: 5,
      COLUMNS: 5,
      FOUNDATIONS: 5,
      MULLION_COLUMNS: 5,
    },
  };

  shed3D = {
    heights: {
      BASE_PLATES: 1.9 + 0.6,
      COLUMNS: 1.9 + 0.6,
      FOUNDATIONS: 0.1,
      MULLION_COLUMNS_Z_HEIGHT: 4,
      FRUSTUM: 0.370,
      RCC: 0.23,
      GROUND_BEAM: 1.9 - 0.6,
      GB_Z_HEIGHT : 0.6,
      PLINTH: 1.9 + 0.6,
    },
  };

  constructor() {
    makeAutoObservable(this);
  }

  update3DHeights(newHeights: Partial<typeof this.shed3D.heights>) {
    this.shed3D.heights = { ...this.shed3D.heights, ...newHeights };
  }

  setBackendUrl(url: string) {
    this.backendUrl = url;
  }
}

const configStore = new ConfigStore();
export default configStore;
