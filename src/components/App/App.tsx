import { useRef, useState } from "react";
import { uniq } from "lodash";

import * as Tone from "tone";

import { Board } from "../Board";
import styles from "./App.module.css";

const SCALES = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Pentatonic: [0, 2, 4, 7, 9],
};

const MIDDLE_C = 60;
const STEPS_PER_OCTAVE = 12;
const C3 = MIDDLE_C - STEPS_PER_OCTAVE;

export const App = () => {
  const [height, width] = [8, 8];
  const synthRef = useRef<Tone.PolySynth<Tone.FMSynth>>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // useEffect(() => {
  //   synthRef.current.maxPolyphony = height * width * 2;
  // }, [height, width]);

  // We maintain two copies of the app state
  // The version created with useRef() is used for synchronization with Tone.js callbacks
  // The version created with useState() is used for UI display with React
  // It's kludgy but it works

  const cellStatesRef = useRef<Array<Array<boolean>>>(
    Array(height).fill(Array(width).fill(false))
  );

  const [cellStates, setCellStates] = useState<Array<Array<boolean>>>(
    Array(height).fill(Array(width).fill(false))
  );

  const countActiveNeighbors = (x: number, y: number) => {
    let count = 0;
    // Top left neighbor
    if (
      cellStatesRef.current[(y - 1 + height) % height][(x - 1 + width) % width]
    )
      count++;
    // Top middle neighbor
    if (cellStatesRef.current[(y - 1 + height) % height][x]) count++;
    // Top right neighbor
    if (cellStatesRef.current[(y - 1 + height) % height][(x + 1) % width])
      count++;
    // Left center neighbor
    if (cellStatesRef.current[y][(x - 1 + width) % width]) count++;
    // Right center neighbor
    if (cellStatesRef.current[y][(x + 1) % width]) count++;
    // Bottom left neighbor
    if (cellStatesRef.current[(y + 1) % height][(x - 1 + width) % width])
      count++;
    // Bottom middle neighbor
    if (cellStatesRef.current[(y + 1) % height][x]) count++;
    // Bottom right neighbor
    if (cellStatesRef.current[(y + 1) % height][(x + 1) % width]) count++;
    return count;
  };

  const mapCoordsToTone = (x: number, y: number) => {
    const invertedY = height - y - 1;
    const n = x + invertedY * 2;
    const midi =
      C3 +
      SCALES.Major[n % SCALES.Pentatonic.length] +
      STEPS_PER_OCTAVE * Math.floor(n / SCALES.Pentatonic.length);
    return Tone.Frequency(midi, "midi").toNote();
  };

  const updateCellStates = () => {
    const newCellStates = cellStatesRef.current.map((rowStates, y) =>
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
    );
    cellStatesRef.current = newCellStates;
    setCellStates(newCellStates);
  };

  const initTone = () => {
    setIsInitialized(true);
    Tone.start();
    Tone.setContext(new Tone.Context({ latencyHint: "playback" }));
    synthRef.current = new Tone.PolySynth(Tone.FMSynth);
    synthRef.current.set({
      envelope: { attack: 0.001 },
      harmonicity: 10,
    });
    synthRef.current.connect(
      new Tone.Reverb({ wet: 0.35, decay: 4 }).toDestination()
    );
    synthRef.current.maxPolyphony = 2 * height * width;
    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat((time) => {
      playBoardTones(time);
      updateCellStates();
    }, "8n");
  };

  const playBoardTones = (time: number) => {
    let tones = [];
    for (let y = 0; y < cellStatesRef.current.length; y++) {
      for (let x = 0; x < cellStatesRef.current.length; x++) {
        if (cellStatesRef.current[y][x]) {
          tones.push(mapCoordsToTone(x, y));
        }
      }
    }
    tones = uniq(tones).slice(0, 16);
    synthRef.current?.triggerAttackRelease(tones, "8n", time, 1 / tones.length);
  };

  const playBoardTone = (x: number, y: number) => {
    if (!isInitialized) {
      initTone();
    }
    synthRef.current?.triggerAttackRelease(
      mapCoordsToTone(x, y),
      "16n",
      undefined,
      0.5
    );
  };

  const handleClear = () => {
    cellStatesRef.current = Array(height).fill(Array(width).fill(false));
    setCellStates(Array(height).fill(Array(width).fill(false)));
  };

  const setCellState = (x: number, y: number, state: boolean) => {
    if (state && !isPlaying) {
      playBoardTone(x, y);
    }
    const newCellStates = cellStatesRef.current.map((row, i) => {
      if (i === y) {
        const newRow = row.slice();
        newRow[x] = state;
        return newRow;
      } else {
        return row;
      }
    });
    cellStatesRef.current = newCellStates;
    setCellStates(newCellStates);
  };

  const handlePlay = () => {
    if (!isInitialized) {
      initTone();
    }
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const handleStop = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  return (
    <div className={styles.app}>
      <Board {...{ height, width, cellStates, setCellState }} />
      <div className={styles.controls}>
        <button onClick={() => (isPlaying ? handleStop() : handlePlay())}>
          {isPlaying ? "Stop" : "Play"}
        </button>
        <button
          onClick={() => {
            updateCellStates();
            playBoardTones(Tone.now());
          }}
        >
          Step
        </button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
};
