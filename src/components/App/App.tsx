import { Board } from "../Board"

import styles from "./App.module.css";

export const App = () => {
  return (
    <div className={styles.app}>
      <Board height={12} width={12} />
    </div>
  );
}

