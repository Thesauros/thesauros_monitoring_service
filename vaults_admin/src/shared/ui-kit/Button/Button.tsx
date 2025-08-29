import { ReactNode } from "react";
import styles from "./Button.module.scss";

type TProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

export const Button = ({ children, onClick, disabled = false }: TProps) => {
  return (
    <button onClick={onClick} className={styles.root} disabled={disabled}>
      {children}
    </button>
  );
};
