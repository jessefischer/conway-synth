import styles from "./Cell.module.css"

export type CellProps = {
  active: boolean;
  setActive: (_: boolean) => void;
}

export const Cell = ({active, setActive}:CellProps):JSX.Element => {
  return <button 
    onClick={() => setActive(!active)}
    className={active ? `${styles.active} ${styles.cell}` : styles.cell} />
}