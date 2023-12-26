import { useEffect, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import * as Tone from "tone";

import { Board } from "../Board";

import { BoardMachine } from "./App.machine";

import styles from "./App.module.css";

export const App = () => {
  const [height, width] = [8, 8];
  const synthRef = useRef(new Tone.PolySynth(Tone.MonoSynth).toDestination());

  useEffect(() => {
    synthRef.current.maxPolyphony = height * width;
  }, []);

  const [cellStates, setCellStates] = useState<Array<Array<boolean>>>(
    Array(height).fill(Array(width).fill(false))
  );

  const countActiveNeighbors = (x: number, y: number) => {
    let count = 0;
    // Top left neighbor
    if (cellStates[(y - 1 + height) % height][(x - 1 + width) % width]) count++;
    // Top middle neighbor
    if (cellStates[(y - 1 + height) % height][x]) count++;
    // Top right neighbor
    if (cellStates[(y - 1 + height) % height][(x + 1) % width]) count++;
    // Left center neighbor
    if (cellStates[y][(x - 1 + width) % width]) count++;
    // Right center neighbor
    if (cellStates[y][(x + 1) % width]) count++;
    // Bottom left neighbor
    if (cellStates[(y + 1) % height][(x - 1 + width) % width]) count++;
    // Bottom middle neighbor
    if (cellStates[(y + 1) % height][x]) count++;
    // Bottom right neighbor
    if (cellStates[(y + 1) % height][(x + 1) % width]) count++;
    return count;
  };

  const mapCoordsToTone = (x: number, y: number) => {
    const midi = 32 + y * width + x;
    return Tone.Frequency(midi, "midi").toNote();
  };

  const updateCellStates = () => {
    setCellStates((cellStates) =>
      cellStates.map((rowStates, y) =>
        rowStates.map((cellState, x) => {
          const activeNeighbors = countActiveNeighbors(x, y);
          if (activeNeighbors === 3) {
            return true;
          }
          if (activeNeighbors === 2) {
            return cellState;
          }
          return false;
        })
      )
    );
  };

  const playBoardTones = () => {
    let tones = [];
    for (let y = 0; y < cellStates.length; y++) {
      for (let x = 0; x < cellStates.length; x++) {
        if (cellStates[y][x]) {
          tones.push(mapCoordsToTone(x, y));
        }
      }
    }
    synthRef.current.triggerAttackRelease(tones, "8n", undefined, 0.25);
    // console.log( tones);
  };

  const handleClear = () => {
    setCellStates(Array(height).fill(Array(width).fill(false)));
  };

  const setCellState = (x: number, y: number, state: boolean) => {
    const newCellStates = cellStates.map((row, i) => {
      if (i === y) {
        const newRow = row.slice();
        newRow[x] = state;
        return newRow;
      } else {
        return row;
      }
    });
    setCellStates(newCellStates);
  };

  const [machine, send] = useMachine(BoardMachine, {
    actions: { updateCellStates, playBoardTones },
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
        <button onClick={() => (isPlaying ? handleStop() : handlePlay())}>
          {isPlaying ? "Stop" : "Play"}
        </button>
        <button onClick={updateCellStates}>Step</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
};
