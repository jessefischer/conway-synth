import { useState } from "react";
import { useMachine } from "@xstate/react";

import { Board } from "../Board";

import { BoardMachine } from "./App.machine";

import styles from "./App.module.css";

export const App = () => {
  const [height, width] = [8, 8];

  const [cellStates, setCellStates] = useState(
    Array(height * width).fill(false)
  );

  const countActiveNeighbors = (i: number) => {
    let count = 0;
    // Top left neighbor
    if (i % width > 0 && Math.floor(i / width) > 0) {
      if (cellStates[i - (width + 1)]) {
        count++;
      }
    }
    // Top middle neighbor
    if (Math.floor(i / width) > 0) {
      if (cellStates[i - width]) {
        count++;
      }
    }
    // Top right neighbor
    if (Math.floor(i / width) > 0 && i % width < width - 1) {
      if (cellStates[i - (width - 1)]) {
        count++;
      }
    }
    // Left center neighbor
    if (i % width > 0) {
      if (cellStates[i - 1]) {
        count++;
      }
    }
    // Right center neighbor
    if (i % width < width - 1) {
      if (cellStates[i + 1]) {
        count++;
      }
    }
    // Bottom left neighbor
    if (i % width > 0 && Math.floor(i / width) < height - 1) {
      if (cellStates[i + width - 1]) {
        count++;
      }
    }
    // Bottom center neighbor
    if (Math.floor(i / width) < height - 1) {
      if (cellStates[i + width]) {
        count++;
      }
    }
    // Bottom right neighbor
    if (Math.floor(i / width) < height - 1 && i % width < width - 1) {
      if (cellStates[i + width + 1]) {
        count++;
      }
    }
    return count;
  };

  const updateCellStates = () => {
    setCellStates((cellStates) =>
      cellStates.map((state, i) => {
        const activeNeighbors = countActiveNeighbors(i);
        if (activeNeighbors === 3) {
          return true;
        }
        if (activeNeighbors === 2) {
          return state;
        }
        return false;
      })
    );
  };

  const setCellState = (i: number, state: boolean) => {
    const newCellStates = cellStates.slice();
    newCellStates[i] = state;
    setCellStates(newCellStates);
  };

  const [machine, send] = useMachine(BoardMachine, {
    actions: { updateCellStates },
  });
  const isPlaying = machine.matches("Playing");

  const handlePlay = () => {
    send({ type: "START" });
  };

  const handleStop = () => {
    send({ type: "STOP" });
  };

  return (
    <div className={styles.app}>
      <Board {...{ height, width, cellStates, setCellState }} />
      <div className={styles.controls}>
        <button onClick={updateCellStates}>Step</button>
        <button onClick={() => (isPlaying ? handleStop() : handlePlay())}>
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>
    </div>
  );
};
