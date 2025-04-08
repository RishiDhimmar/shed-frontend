interface Point {
  X: number;
  Y: number;
}
interface PointSmall {
  x: number;
  y: number;
}
export const arrayToPointArray = (array: number[][]): Point[] =>
  array.map(([x, y]) => ({ X: x, Y: y }));

export const pointArrayToArray = (array: Point[]): number[][] =>
  array.map(({ X, Y }) => [X, Y]);

export const pointArrayToArrayLowerCase = (array: PointSmall[]): number[][] =>
  array.map(({ x, y } ) => [x, y]);