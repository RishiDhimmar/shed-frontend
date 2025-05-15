import { makeAutoObservable, reaction, runInAction } from "mobx";
import { getRectanglePoints } from "../utils/GeometryUtils";
import wallStore from "./WallStore";
import baseplateStore from "./BasePlateStore";
import uiStore from "./UIStore";
import {
  getRectanglePointsAroundCenter,
  sortPolygon,
} from "../utils/PolygonUtils";
import { label } from "three/tsl";

class MullionColumnStore {
  mullionLength: number = 0;
  mullionWidth: number = 0;
  main1: number = 0;
  mainCc: number = 0;
  ring1: number = 0;
  ringCc: number = 0;

  mullionPositions: number[][][] = []; // Stores rectangle points for each mullion
  mullionDimensions: {
    width: number;
    height: number;
    points: [number, number, number][];
  }[] = [];
  polygons: number[][][] = [];

  constructor() {
    makeAutoObservable(this);

    // Automatically update mullion positions when wall dimensions change
    reaction(
      () => ({
        width: wallStore.width,
        height: wallStore.height,
        thickness: wallStore.wallThickness,
        externalWallPoints: wallStore.externalWallPoints,
      }),
      () => {
        this.calculateMullions();
      },
    );
  }
  setPolygons(polygons) {
    this.polygons = polygons;
  }

  calculateMullions() {
    const { wallThickness, externalWallPoints } = wallStore;

    if (!externalWallPoints.length || wallThickness <= 0) {
      console.warn("Invalid data for mullion calculations");
      return;
    }

    const newMullions: number[][][] = externalWallPoints.map(
      ([x, y], index) => {
        let adjustedX = x;
        let adjustedY = y;

        if (index === 0) {
          adjustedX += wallThickness / 2;
          adjustedY += wallThickness / 2;
        } else if (index === 1) {
          adjustedX -= wallThickness / 2;
          adjustedY += wallThickness / 2;
        } else if (index === 2) {
          adjustedX -= wallThickness / 2;
          adjustedY -= wallThickness / 2;
        } else if (index === 3) {
          adjustedX += wallThickness / 2;
          adjustedY -= wallThickness / 2;
        }

        return getRectanglePoints(wallThickness, wallThickness, [
          adjustedX,
          adjustedY,
        ]);
      },
    );

    const horizontal = baseplateStore.basePlates.filter(
      (plate) => plate.type === "horizontal",
    );
    horizontal.map((plate) => {
      const { x, y } = plate;
      if (plate.wall === "left") {
        newMullions.push(
          getRectanglePoints(wallThickness, wallThickness, [
            x -
              baseplateStore.config[plate.type].length / 2 -
              (baseplateStore.config[plate.type].offsetX ?? 0) -
              wallThickness / 2,
            y,
          ]),
        );
      } else if (plate.wall === "right") {
        newMullions.push(
          getRectanglePoints(wallThickness, wallThickness, [
            x +
              baseplateStore.config[plate.type].length / 2 +
              (baseplateStore.config[plate.type].offsetX ?? 0) +
              wallThickness / 2,
            y,
          ]),
        );
      }
    });

    const vertical = baseplateStore.basePlates.filter(
      (plate) => plate.type === "vertical",
    );
    vertical.map((plate) => {
      const { x, y } = plate;
      if (plate.wall === "top") {
        newMullions.push(
          getRectanglePoints(wallThickness, wallThickness, [
            x,
            y +
              baseplateStore.config[plate.type].width / 2 +
              (baseplateStore.config[plate.type].offsetY ?? 0) +
              wallThickness / 2,
          ]),
        );
      } else if (plate.wall === "bottom") {
        newMullions.push(
          getRectanglePoints(wallThickness, wallThickness, [
            x,
            y -
              baseplateStore.config[plate.type].width / 2 -
              (baseplateStore.config[plate.type].offsetY ?? 0) -
              wallThickness / 2,
          ]),
        );
      }
    });

    runInAction(() => {
      this.mullionPositions = newMullions;
    });
  }

  setMullionLength(value: number) {
    this.mullionLength = value;
    uiStore.setModified(true);
  }

  setMullionWidth(value: number) {
    this.mullionWidth = value;
    uiStore.setModified(true);
  }
  setMain1(value: number) {
    this.main1 = value;
  }
  setMainCc(value: number) {
    this.mainCc = value;
  }
  setRing1(value: number) {
    this.ring1 = value;
  }
  setRingCc(value: number) {
    this.ringCc = value;
  }

  calculateMullionColumns() {
    // this.polygons = baseplateStore.edgeBasePlates
    //   .flatMap((plate) =>
    //     plate.hits.map((hit) => {
    //       let center = hit.hitPoint;

    //       if (hit.direction === "-x") {
    //         center = {
    //           x: hit.hitPoint.x - wallStore.wallThickness / 2,
    //           y: hit.hitPoint.y,
    //         };
    //       }
    //       if (hit.direction === "+x") {
    //         center = {
    //           x: hit.hitPoint.x + wallStore.wallThickness / 2,
    //           y: hit.hitPoint.y,
    //         };
    //       }
    //       if (hit.direction === "+y") {
    //         center = {
    //           x: hit.hitPoint.x,
    //           y: hit.hitPoint.y + wallStore.wallThickness / 2,
    //         };
    //       }
    //       if (hit.direction === "-y") {
    //         center = {
    //           x: hit.hitPoint.x,
    //           y: hit.hitPoint.y - wallStore.wallThickness / 2,
    //         };
    //       }

    //       console.log(center);

    //       return {
    //         points: getRectanglePointsAroundCenter(
    //           center,
    //           wallStore.wallThickness,
    //           wallStore.wallThickness
    //         ),
    //       };
    //     })
    //   )
    //   .concat(
    this.polygons = baseplateStore.cornerBasePlates
      .map((plate) => {
        // Initialize center from the first hit point
        let center = { ...plate.hits[0].hitPoint }; // Create a copy to avoid mutating original

        // Apply adjustments to center based on all hits
        plate.hits.forEach((hit) => {
          if (hit.direction === "-x") {
            center.x = hit.hitPoint.x - wallStore.wallThickness / 2;
          }
          if (hit.direction === "+x") {
            center.x = hit.hitPoint.x + wallStore.wallThickness / 2;
          }
          if (hit.direction === "+y") {
            center.y = hit.hitPoint.y + wallStore.wallThickness / 2;
          }
          if (hit.direction === "-y") {
            center.y = hit.hitPoint.y - wallStore.wallThickness / 2;
          }
        });

        // Return polygon with points around the adjusted center
        return {
          points: getRectanglePointsAroundCenter(
            { ...center, z: 0 },
            wallStore.wallThickness,
            wallStore.wallThickness,
          ),
          label: `M${plate.label.slice(1)}`,
        };
      })
      .concat(
        baseplateStore.edgeBasePlates.flatMap((plate) =>
          plate.hits.map((hit) => {
            let center = hit.hitPoint;

            if (hit.direction === "-x") {
              center = {
                x: hit.hitPoint.x - wallStore.wallThickness / 2,
                y: hit.hitPoint.y,
              };
            }
            if (hit.direction === "+x") {
              center = {
                x: hit.hitPoint.x + wallStore.wallThickness / 2,
                y: hit.hitPoint.y,
              };
            }
            if (hit.direction === "+y") {
              center = {
                x: hit.hitPoint.x,
                y: hit.hitPoint.y + wallStore.wallThickness / 2,
              };
            }
            if (hit.direction === "-y") {
              center = {
                x: hit.hitPoint.x,
                y: hit.hitPoint.y - wallStore.wallThickness / 2,
              };
            }

            return {
              points: getRectanglePointsAroundCenter(
                center,
                wallStore.wallThickness,
                wallStore.wallThickness,
              ),
              label: `M${plate.label.slice(1)}`,
            };
          }),
        ),
      );

    //sort the polygons in the order of correct centers
    this.polygons = sortPolygon(this.getCenters()).map((sortedCenter) => {
      return this.polygons.find((polygon) => {
        const center = this.getCenterOfPolygon(polygon);
        return (
          Math.abs(center.x - sortedCenter.x) < 0.001 &&
          Math.abs(center.y - sortedCenter.y) < 0.001
        );
      });
    });
  }

  getCenters() {
    return this.polygons.map((polygon) => ({
      x:
        (Math.min(...polygon.points.map((p) => p.x)) +
          Math.max(...polygon.points.map((p) => p.x))) /
        2,
      y:
        (Math.min(...polygon.points.map((p) => p.y)) +
          Math.max(...polygon.points.map((p) => p.y))) /
        2,
    }));
  }

  getCenterOfPolygon(polygon) {
    return {
      x:
        (Math.min(...polygon.points.map((p) => p.x)) +
          Math.max(...polygon.points.map((p) => p.x))) /
        2,
      y:
        (Math.min(...polygon.points.map((p) => p.y)) +
          Math.max(...polygon.points.map((p) => p.y))) /
        2,
    };
  }
}
const mullionColumnStore = new MullionColumnStore();
export default mullionColumnStore;
