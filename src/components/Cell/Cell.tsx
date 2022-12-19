import { EDrawingState } from "../Board/Board";

import styles from "./Cell.module.css";

export type CellProps = {
  active: boolean;
  setActive: (_: boolean) => void;
  drawingState: EDrawingState;
  setDrawingState: (_: EDrawingState) => void;
};

export const Cell = ({
  active,
  setActive,
  drawingState,
  setDrawingState,
}: CellProps): JSX.Element => {
  return (
    <button
      onMouseOver={() => {
        if (drawingState === EDrawingState.Drawing && !active) {
          setActive(true);
        } else if (drawingState === EDrawingState.Erasing && active) {
          setActive(false);
        }
      }}
      onMouseDown={() => {
        setDrawingState(active ? EDrawingState.Erasing : EDrawingState.Drawing);
        setActive(!active);
      }}
      onMouseUp={() => {
        setDrawingState(EDrawingState.None);
      }}
      className={active ? `${styles.active} ${styles.cell}` : styles.cell}
    />
  );
};
