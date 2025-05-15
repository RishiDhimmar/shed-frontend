export const BACKEND_URL =
  "http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:8081/";
// export const BACKEND_URL = "http://localhost:3000/";

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
    BASE_PLATES: 0.1,
    COLUMNS: 0.6,
    FOUNDATIONS: 0.1,
    MULLION_COLUMNS: 0.1,
    FRUSTUM: 0.1,
    RCC: 0.023,
    GROUND_BEAM: 1,
  },
};
