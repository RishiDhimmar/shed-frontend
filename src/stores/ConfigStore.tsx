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
      MULLION_COLUMNS_Z_HEIGHT: 3,
      FRUSTUM: 0.37,
      RCC: 0.23,
      GROUND_BEAM: 2.1 - 0.3 - 0.3,
      GB_Z_HEIGHT: 0.6,
      PLINTH: 1.9 + 0.6 + 0.075,
      PLINTH_Z_HEIGHT: 0.15,
      PLASTER_THICKNESS: 0.1,
      COPING_BEAM_HEIGHT: 0.15,
    },
  };
  RINGS = {
    COLUMNS: {
      gap: 250 / 1000,
      diameter: 8 / 1000,
      offset : 40 / 1000
    },
    MULLION_COLUMNS: {
      gap: 150 / 1000,
      diameter: 8 / 1000,
    },
    GROUND_BEAM: {
      gap: 150 / 1000,
      diameter: 8 / 1000,
    }
  };

  constructor() {
    makeAutoObservable(this);
  }

  update3DHeights(newHeights: Partial<typeof this.shed3D.heights>) {
    this.shed3D.heights = { ...this.shed3D.heights, ...newHeights };
  }

  updateRings(newRings: Partial<typeof this.RINGS>) {
    this.RINGS = { ...this.RINGS, ...newRings };
  }

  setBackendUrl(url: string) {
    this.backendUrl = url;
  }
}

const configStore = new ConfigStore();
export default configStore;
