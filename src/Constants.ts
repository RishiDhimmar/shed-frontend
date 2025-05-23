export const BACKEND_URL =
  "http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:8081/";
// export const BACKEND_URL = "http://localhost:8081/";

export const Shed2DConfig = {
  strokeWidth: {
    WALLS: 5,
    BASE_PLATES: 5,
    COLUMNS: 5,
    FOUNDATIONS: 5,
    MULLION_COLUMNS: 5,
  },
};
export const Shed3DConfig = {
  heights: {
    BASE_PLATES: 1.9 + 0.6,
    COLUMNS: 1.9 + 0.6,
    FOUNDATIONS: 0.1,
    MULLION_COLUMNS: 1.9 + 0.6,
    FRUSTUM: 0.37,
    RCC: 0.23,
    GROUND_BEAM: 10,
    PLINTH: 1.9 + 0.6,
  },
};
