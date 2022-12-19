import { useState } from "react";

import styles from "./Board.module.css";
import { Cell } from "../Cell";

export enum EDrawingState {
  None = "none",
  Drawing = "drawing",
  Erasing = "erasing",
}

export type BoardProps = {
  height: number;
  width: number;
  cellStates: Array<Array<boolean>>;
  setCellState: (x: number, y: number, state: boolean) => void;
};

export const Board = ({
  height,
  width,
  cellStates,
  setCellState,
}: BoardProps): JSX.Element => {
  const [drawingState, setDrawingState] = useState(EDrawingState.None);

  return (
    <>
      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gridTemplateRows: `repeat(${height}, 1fr)`,
        }}
      >
        {cellStates.map((rowStates, y) =>
          rowStates.map((cellState, x) => (
            <Cell
              key={`${x},${y}`}
              active={cellState}
              setActive={(state) => setCellState(x, y, state)}
              {...{ drawingState, setDrawingState }}
            />
          ))
        )}
      </div>
    </>
  );
};
