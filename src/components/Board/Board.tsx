import styles from "./Board.module.css"
import { Cell } from "../Cell";
import { useState } from "react";
import { useMachine } from "@xstate/react";
import { BoardMachine } from "./Board.machine";

export type BoardProps = {
  height: number;
  width: number;
}


export const Board = ({height, width}: BoardProps) :JSX.Element => {
  const [cellStates, setCellStates] = useState(Array(height * width).fill(false));
  
  const countActiveNeighbors = (i: number) => {
    let count = 0;
    // Top left neighbor
    if ( i % width > 0 && Math.floor( i / width ) > 0) {
      if ( cellStates[i-(width+1)]) {
        count++;
      }
    }
    // Top middle neighbor
    if ( Math.floor( i / width ) > 0) {
      if ( cellStates[i-width]) {
        count++;
      }
    }
    // Top right neighbor
    if ( Math.floor( i / width ) > 0 && i % width < width - 1) {
      if ( cellStates[i-(width-1)]) {
        count++;
      }
    }
    // Left center neighbor
    if ( i % width > 0) {
      if ( cellStates[i-1]) {
        count++;
      }
    }
    // Right center neighbor
    if ( i % width < width - 1) {
      if ( cellStates[i+1]) {
        count++;
      }
    }
    // Bottom left neighbor
    if ( i % width > 0 && Math.floor( i / width ) < height - 1) {
      if ( cellStates[i+width-1]) {
        count++;
      }
    }
    // Bottom center neighbor
    if ( Math.floor(i / width) < height - 1) {
      if (cellStates[i+width]) {
        count++;
      }
    }
    // Bottom right neighbor
    if ( Math.floor(i/width) < height - 1 && i % width < width - 1 ) {
      if (cellStates[i+width+1]) {
        count++;
      }
    }
    return count;
  }

  const updateCellStates = () => {
    setCellStates( (cellStates) => cellStates.map( (state, i) => {
      const activeNeighbors = countActiveNeighbors(i);
      if ( activeNeighbors === 3) {
        return true;
      }
      if ( activeNeighbors === 2) {
        return state;
      }
      return false;
    }))
  }

  const setCellState = (i: number, state: boolean) => {
    const newCellStates = cellStates.slice();
    newCellStates[i] = state;
    setCellStates(newCellStates);
  }

  const [machine, send] = useMachine(BoardMachine, {actions: {updateCellStates}});
  const isPlaying = machine.matches("Playing");

  const handlePlay = () => {
    send({ type: "START"});
  }

  const handleStop = () => {
    send({ type: "STOP"});
  }

  return (
    <>
      <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`
      }}>
      {cellStates.map((state, i) =>
        <Cell
        key={i}
        active={state}
        setActive={(state) => setCellState(i, state)}
        />
        )}
      </div>
      <button onClick={updateCellStates}>Step</button>
      <button onClick={() => isPlaying? handleStop() : handlePlay()}>{isPlaying? "Stop": "Play"}</button>
    </>
  );
}