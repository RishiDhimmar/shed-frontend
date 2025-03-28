export async function fetchWallData() {
  try {
    const response = await fetch(
      "https://3rdp084j-3000.inc1.devtunnels.ms/api/dxf-entities"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch wall data. Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching wall data:", error);
    return null;
  }
}
