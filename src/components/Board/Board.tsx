import styles from "./Board.module.css";
import { Cell } from "../Cell";

export type BoardProps = {
  height: number;
  width: number;
  cellStates: Array<boolean>;
  setCellState: (i: number, state: boolean) => void;
};

export const Board = ({
  height,
  width,
  cellStates,
  setCellState,
}: BoardProps): JSX.Element => {
  return (
    <>
      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gridTemplateRows: `repeat(${height}, 1fr)`,
        }}
      >
        {cellStates.map((state, i) => (
          <Cell
            key={i}
            active={state}
            setActive={(state) => setCellState(i, state)}
          />
        ))}
      </div>
    </>
  );
};
