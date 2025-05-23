import { makeAutoObservable, toJS } from "mobx";

import {
  convertToPointObjects,
  divideLineIntoEqualParts,
  generateBiggerPolygonAtSomeOffset,
  generateSymmetricPoints,
  getBounds,
  traceAllPolygonsWithRays,
} from "../utils/PolygonUtils";
import {
  calculateBoundingBoxArea,
  getRectanglePoints,
  isPointInPolygon,
} from "../utils/GeometryUtils";
import {
  distanceBetPoints,
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
import uiStore from "./UIStore";

class DxfStore {
  candidatePolygons = [];
  // externalWallPolygon = [-375, -500, 375, -500, 375, 500, -375, 500];
  externalWallPolygon = getRectanglePoints(12000, 24000).flatMap((p) => [
    p[0],
    p[1],
  ]);
  // externalWallPolygon = [
  //   -37500,
  //   -50000, // 1. bottom-left
  //   50000,
  //   -50000, // 2. bottom-right
  //   50000,
  //   0, // 3. cut up to bottom of notch
  //   0,
  //   0, // 4. left of notch
  //   0,
  //   50000, // 5. top of vertical leg
  //   -37500,
  //   50000, // 6. top-left
  // ];

  externalWallPoints = convertToPointObjects(this.externalWallPolygon);
  internalWallPolygon = null; // Changed from [] to null for proper initial state
  intersectingPolygons = [];
  rays = [];
  firstBasePlatePolygon = null; // Changed from [] to null
  data = [];

  constructor() {
    makeAutoObservable(this);
    console.log("External wall polygon", toJS(this.externalWallPolygon));
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
    columnStore.generateColumnsInputs(baseplateStore.groups);
    columnStore.generateColumnPolygons(baseplateStore.groups);
    foundationStore.generateFoundations();
    foundationStore.generateFoundationInputs();
    mullionColumnStore.calculateMullionColumns();
  }

  getCandidatePolygons() {
    return this.candidatePolygons;
  }

  getExternalWallPolygon() {
    return this.externalWallPolygon;
  }

  // Convert array [x1, y1, x2, y2, ...] to [{x: x1, y: y1}, {x: x2, y: y2}, ...]

  filterCandidatePolygons() {
    if (!this.externalWallPolygon || this.externalWallPolygon.length < 6) {
      console.warn("External wall polygon is invalid");
      return;
    }

    const externalPointsObj = convertToPointObjects(this.externalWallPolygon);

    this.candidatePolygons = this.candidatePolygons.filter((polygon) => {
      return isPolygonInsidePolygon(externalPointsObj, polygon);
    });
  }

  calculateInnerPolygons() {
    if (!this.externalWallPolygon || this.externalWallPolygon.length < 6) {
      console.warn("External wall polygon is invalid");
      return null;
    }

    const externalPointsObj = convertToPointObjects(this.externalWallPolygon);

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
        uiStore.toggleVisibility("lines");
        uiStore.toggleVisibility("circles");
        uiStore.toggleVisibility("annotation");
        // uiStore.toggleVisibility("polygons");

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

    const externalPoints = convertToPointObjects(this.externalWallPolygon);
    const internalPoints = convertToPointObjects(this.internalWallPolygon);

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

  placeBaseplates(
    idealHorizontalDistance = baseplateStore.idealHorizontalDistance * 1000 ||
      6000,
    idealVerticalDistance = baseplateStore.idealVerticalDistance * 1000 || 7000
  ) {
    const bounds = getBounds(convertToPointObjects(this.externalWallPolygon));
    console.log(bounds);
    this.candidatePolygons = [];
    this.internalWallPolygon = [];
    baseplateStore.reset();
    columnStore.reset();
    foundationStore.reset();

    const baseplateWidth = 550;
    const baseplateHeight = 330;

    const offsetX = 75 + 550 / 2 + 250;
    const offsetY = 75 + 330 / 2 + 250;

    const colStartX = bounds.minX + offsetX;
    const colEndX = bounds.maxX - offsetX;
    const rowStartY = bounds.minY + offsetY;
    const rowEndY = bounds.maxY - offsetY;

    const xPositions = generateSymmetricPoints(
      colStartX,
      colEndX,
      idealHorizontalDistance
    );
    const yPositions = generateSymmetricPoints(
      rowStartY,
      rowEndY,
      idealVerticalDistance
    );

    const bspPoints = [];

    for (const x of xPositions) {
      for (const y of yPositions) {
        bspPoints.push({ x, y });
      }
    }

    console.log("Baseplate centers:", bspPoints);

    this.candidatePolygons = bspPoints.map((pt) =>
      getRectanglePoints(baseplateWidth, baseplateHeight, [pt.x, pt.y]).map(
        (p) => ({
          x: p[0],
          y: p[1],
          z: 0,
        })
      )
    );

    this.candidatePolygons.push(
      generateBiggerPolygonAtSomeOffset(
        convertToPointObjects(this.externalWallPolygon).map((p) => ({
          x: p.x,
          y: p.y,
          z: 0,
        })),
        -250
      )
    );

    this.filterCandidatePolygons();
    this.calculateInnerPolygons();
    this.calculateFirstBasePlatePolygon();
    this.recursiveRaycastingFromPolygon();
    baseplateStore.generateLabels();
    baseplateStore.processBasePlates();
    console.log(toJS(baseplateStore.groups));
    columnStore.generateColumnsInputs(baseplateStore.groups);
    console.log(toJS(columnStore.columnInputs));
    columnStore.generateColumnPolygons(baseplateStore.groups);
    foundationStore.generateFoundationInputs();
    foundationStore.generateFoundations();
    mullionColumnStore.calculateMullionColumns();
  }
}

const dxfStore = new DxfStore();
export default dxfStore;
