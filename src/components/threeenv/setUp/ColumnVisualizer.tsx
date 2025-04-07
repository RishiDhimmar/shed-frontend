import { observer } from "mobx-react-lite";
import columnStore from "../../../stores/ColumnStore";
import { useMemo } from "react";
import baseplateStore from "../../../stores/BasePlateStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import DimensionLine from "../Helpers/DimensionLine";
import uiStore from "../../../stores/UIStore";

const ColumnVisualizer = observer(() => {
  useMemo(() => {
    columnStore.generateColumns();
  }, [baseplateStore.basePlates]);

  return (
    <>
      {columnStore.columns.map((column) => {
        // Get the actual dimensions based on column type
        let width = 0;
        let length = 0;

        if (column.wall === "corner") {
          width = columnStore.cornerLength;
          length = columnStore.cornerWidth;
        } else if (column.wall === "horizontal") {
          width = columnStore.horizontalWidth;
          length = columnStore.horizontalLength;
        } else if (column.wall === "vertical") {
          width = columnStore.verticalWidth;
          length = columnStore.verticalLength;
        }

        return (
          <>
            <LineVisualizer
              key={column.id}
              points={column.points}
              color="#6363E1"
            />
            {uiStore.currentComponent === "column" && (
              <>
                <DimensionLine
                  startPoint={column.points[0] as [number, number, number]}
                  endPoint={column.points[1] as [number, number, number]}
                  length={column.wall === "vertical" ? width : length}
                  lineColor="#6363E1"
                  textColor="#6363E1"
                  lineDirection="+y"
                  textDirection="+y"
                  textOffset={0.5}
                  textSize={0.5}
                  lineOffset={1}
                />

                <DimensionLine
                  startPoint={column.points[1] as [number, number, number]}
                  endPoint={column.points[2] as [number, number, number]}
                  length={column.wall === "vertical" ? length : width}
                  lineColor="#6363E1"
                  textColor="#6363E1"
                  lineDirection="-x"
                  textDirection="-x"
                  textOffset={0.5}
                  textSize={0.5}
                  lineOffset={0.5}
                />
              </>
            )}
          </>
        );
      })}
    </>
  );
});

export default ColumnVisualizer;
