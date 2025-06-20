function getRingData(hEdgeWires: number) {
  let ringData = [];
  switch (hEdgeWires) {
    case 5:
      ringData = [
        { on: "length", from: 0, to: 2 },
        { on: "length", from: hEdgeWires - 3, to: hEdgeWires - 1 },
        {
          on: "length",
          from: Math.floor(hEdgeWires / 2),
          to: Math.floor(hEdgeWires / 2),
        },
      ];
      break;
    case 6:
      ringData = [
        { on: "length", from: 0, to: 3 },
        { on: "length", from: 2, to: 5 },
        // 1 , 4
        { on: "length", from: 1, to: 1 },
        { on: "length", from: 4, to: 4 },
      ];
      break;
    case 7:
      ringData = [
        { on: "length", from: 0, to: 4 },
        { on: "length", from: hEdgeWires - 5, to: hEdgeWires - 1 },
        //1 , 3,5
        { on: "length", from: 1, to: 1 },
        { on: "length", from: 3, to: 3 },
        { on: "length", from: 5, to: 5 },
      ];
      break;
    case 8:
      ringData = [
        { on: "length", from: 0, to: 5 },
        { on: "length", from: 2, to: 7 },
        { on: "length", from: 1, to: 1 },
        { on: "length", from: 3, to: 3 },
        { on: "length", from: 4, to: 4 },
        { on: "length", from: 6, to: 6 },
      ];
      break;
    case 9:
      ringData = [
        { on: "length", from: 0, to: 5 },
        { on: "length", from: 3, to: 8 },
        { on: "length", from: 1, to: 1 },
        { on: "length", from: 2, to: 2 },
        { on: "length", from: 6, to: 6 },
        { on: "length", from: 7, to: 7 },
      ];
      break;
    case 10:
      ringData = [
        { on: "length", from: 0, to: 4 },
        { on: "length", from: hEdgeWires - 5, to: hEdgeWires - 1 },
        { on: "length", from: 1, to: 1 },
        { on: "length", from: 2, to: 2 },
        { on: "length", from: 3, to: 3 },
        { on: "length", from: hEdgeWires - 2, to: hEdgeWires - 2 },
        { on: "length", from: hEdgeWires - 3, to: hEdgeWires - 3 },
        { on: "length", from: hEdgeWires - 4, to: hEdgeWires - 4 },
      ];
      break;
    default:
      ringData = [{ on: "length", from: 0, to: hEdgeWires - 1 }];
      break;
  }
  return ringData;
}

export default getRingData;
