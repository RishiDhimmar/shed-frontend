// stores/LayerStore.ts
import { makeAutoObservable } from "mobx";
import { BACKEND_URL } from "../Constants";

export interface DxfEntity {
  type: string;
  layer: string;
  [key: string]: any;
}

class LayerStore {
  selectedLayer: string = "";
  entities: DxfEntity[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedLayer(layer: string) {
    this.selectedLayer = layer;
  }

  setEntities(entities: DxfEntity[]) {
    this.entities = entities;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  async uploadDxf(file: File) {
    if (!file) return;

    const formData = new FormData();
    formData.append("dxfFile", file);
    formData.append("layerName", this.selectedLayer);

    try {
      this.setLoading(true);
      this.setError(null);

      const res = await fetch(BACKEND_URL + "api/dxf/upload-dxf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} - ${text}`);
      }

      const data = await res.json();
      this.setEntities(data.entities || []);
    } catch (err: any) {
      this.setError(err.message);
      this.setEntities([]);
    } finally {
      this.setLoading(false);
    }
  }
}

const layerStore = new LayerStore();
export default layerStore;
