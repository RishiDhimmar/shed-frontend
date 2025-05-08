import { makeAutoObservable } from "mobx";

import { traceAllPolygonsWithRays } from "../utils/PolygonUtils";
import {
  calculateBoundingBoxArea,
  isPointInPolygon
} from "../utils/GeometryUtils";
import {
  findClosestPointOnPolygon,
  findClosestPolygon,
  findClosestSmallerPolygon,
  isPolygonInsidePolygon,
} from "../components/canvas2d/Polygon";
import wallStore from "./WallStore";
import baseplateStore from "./BasePlateStore";
import columnStore from "./ColumnStore";
import foundationStore from "./FoundationStore";
import mullionColumnStore from "./MullianColumnStore";

class DxfStore {
  candidatePolygons = [];
  externalWallPolygon = [];
  internalWallPolygon = null; // Changed from [] to null for proper initial state
  intersectingPolygons = [];
  rays = [];
  firstBasePlatePolygon = null; // Changed from [] to null
  data = [];

  constructor() {
    makeAutoObservable(this);
  }

  setCandidatePolygons(polygons) {
    this.candidatePolygons = polygons;
  }

  setExternalWallPolygon(polygon) {
    this.externalWallPolygon = polygon;
    this.filterCandidatePolygons();
    this.calculateInnerPolygons();
    this.calculateFirstBasePlatePolygon();
    this.recursiveRaycastingFromPolygon();
    baseplateStore.generateLabels();
    baseplateStore.processBasePlates();
    columnStore.generateColumnPolygons();
    foundationStore.generateFoundations();
    mullionColumnStore.calculateMullionColumns();
  }

  getCandidatePolygons() {
    return this.candidatePolygons;
  }

  getExternalWallPolygon() {
    return this.externalWallPolygon;
  }

  // Convert array [x1, y1, x2, y2, ...] to [{x: x1, y: y1}, {x: x2, y: y2}, ...]
  convertToPointObjects(flatArray) {
    const points = [];
    for (let i = 0; i < flatArray.length; i += 2) {
      points.push({
        x: flatArray[i],
        y: flatArray[i + 1],
      });
    }
    return points;
  }

  filterCandidatePolygons() {
    if (!this.externalWallPolygon || this.externalWallPolygon.length < 6) {
      console.warn("External wall polygon is invalid");
      return;
    }

    const externalPointsObj = this.convertToPointObjects(
      this.externalWallPolygon
    );

    this.candidatePolygons = this.candidatePolygons.filter((polygon) => {
      return isPolygonInsidePolygon(externalPointsObj, polygon);
    });
  }

  calculateInnerPolygons() {
    if (!this.externalWallPolygon || this.externalWallPolygon.length < 6) {
      console.warn("External wall polygon is invalid");
      return null;
    }

    const externalPointsObj = this.convertToPointObjects(
      this.externalWallPolygon
    );

    const computedInternalPolygons = this.candidatePolygons.filter((poly) => {
      return poly.every((pt) => isPointInPolygon(pt, externalPointsObj));
    });

    if (computedInternalPolygons.length > 0) {
      const largest = computedInternalPolygons.reduce((max, poly) => {
        const area = calculateBoundingBoxArea(poly);
        const maxArea = max ? calculateBoundingBoxArea(max) : 0;
        return area > maxArea ? poly : max;
      }, null);

      if (largest) {
        const flatArray = largest.flatMap((p) => [p.x, p.y, 0]);
        this.internalWallPolygon = flatArray;

        wallStore.wallThickness = Math.abs(
          this.externalWallPolygon[0] - this.internalWallPolygon[0]
        );
        wallStore.externalWallPoints = this.externalWallPolygon;
        wallStore.internalWallPoints = this.internalWallPolygon;
        console.log("Calculated wall thickness:", wallStore.wallThickness);

        return flatArray;
      }
    }

    return null;
  }

  calculateFirstBasePlatePolygon() {
    if (
      !this.externalWallPolygon ||
      this.externalWallPolygon.length < 2 ||
      !this.internalWallPolygon ||
      this.candidatePolygons.length === 0
    ) {
      console.warn("Missing required data for base plate calculation");
      return null;
    }

    const referencePoint = {
      x: this.externalWallPolygon[0],
      y: this.externalWallPolygon[1],
    };

    const internalWallPointObjects = [];
    for (let i = 0; i < this.internalWallPolygon.length; i += 3) {
      internalWallPointObjects.push({
        x: this.internalWallPolygon[i],
        y: this.internalWallPolygon[i + 1],
      });
    }

    const result = findClosestSmallerPolygon(
      referencePoint,
      this.candidatePolygons,
      internalWallPointObjects,
      { distanceTolerance: 100, areaTolerance: 0 }
    );

    if (result && result.polygon) {
      this.firstBasePlatePolygon = result.polygon;
      return result.polygon;
    } else {
      console.warn("No suitable smaller polygon found");
      return null;
    }
  }
  recursiveRaycastingFromPolygon() {
    const { rays, allIntersectingPolygons } = traceAllPolygonsWithRays(
      this.firstBasePlatePolygon,
      this.candidatePolygons
    );
    this.rays = rays;

    const filteredPolygons = allIntersectingPolygons.filter((poly, i) => {
      for (let j = 0; j < allIntersectingPolygons.length; j++) {
        const otherPoly = allIntersectingPolygons[j];
        const isContained = poly.every((pt) => isPointInPolygon(pt, otherPoly));
        if (isContained) {
          const polyArea = calculateBoundingBoxArea(poly);
          const otherPolyArea = calculateBoundingBoxArea(otherPoly);
          if (polyArea < otherPolyArea) {
            return false;
          }
        }
      }
      return true;
    });
    this.intersectingPolygons = filteredPolygons;
  }
  distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateWallThickness() {
    if (!this.externalWallPolygon || !this.internalWallPolygon) {
      console.warn("Wall polygons are not properly initialized");
      return null;
    }

    const externalPoints = this.convertToPointObjects(this.externalWallPolygon);
    const internalPoints = this.convertToPointObjects(this.internalWallPolygon);

    const thicknesses = internalPoints.map((internalPt) => {
      const closestExternal = findClosestPointOnPolygon(
        internalPt,
        externalPoints
      );
      return this.distance(internalPt, closestExternal);
    });

    if (thicknesses.length === 0) return null;

    const averageThickness =
      thicknesses.reduce((sum, val) => sum + val, 0) / thicknesses.length;
    return averageThickness;
  }
}

const dxfStore = new DxfStore();
export default dxfStore;
