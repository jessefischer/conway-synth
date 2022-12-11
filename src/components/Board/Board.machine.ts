import { createMachine} from "xstate"

export const BoardMachine = createMachine({
  id: "ConwaySynthBoardMachine",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        START: {
          target: "Playing",
        },
      },
    },
    Playing: {
      after: {
        "500": {
          target: "Playing",
          actions: ["updateCellStates"],
        },
      },
      on: {
        STOP: {
          target: "Idle",
        },
      },
    },
  },
  schema: {
    context: {} as {},
    events: {} as { type: "START" } | { type: "STOP" },
  },
  context: {},
  predictableActionArguments: true,
  preserveActionOrder: true,
});