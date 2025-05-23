export interface Point {
  x: number;
  y: number;
}

export interface CircleData {
  type: string;
  center: Point;
  radius: number;
}

export interface TransformState {
  x: number;
  y: number;
  scale: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}