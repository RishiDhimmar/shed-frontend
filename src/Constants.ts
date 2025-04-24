import data from "./data.json";
import data2 from "./data2.json";
import data3 from "./data3.json";
import data4 from "./data4.json";
import data5 from "./data5.json";
import data6 from "./data6.json";

export const BACKEND_URL =
  "http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/";
// export const BACKEND_URL = "http://localhost:3000/"


export const CONFIG = {
  EPSILON: 0.01,
  SCALE: 1 / 100,
  RAY_LENGTH: 1000,
  CANVAS_PADDING: 20,
  MAX_SCALE: 5,
  MIN_SCALE: 0.1,
  ZOOM_STEP: 0.1,
};

export const DATA_MAP = { data, data2, data3, data4, data5, data6 };
