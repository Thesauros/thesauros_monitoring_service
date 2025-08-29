import { ReactNode } from "react";
import styles from "./TableContainer.module.scss";

export const TableContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.tableValue}>{children}</div>;
};
