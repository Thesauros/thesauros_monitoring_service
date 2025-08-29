import { ReactNode } from "react";
import styles from "./Card.module.scss";
import classNames from "classnames";

type TProps = {
  className?: string;
  children: ReactNode;
};

export const Card = ({ children, className }: TProps) => {
  return <div className={classNames(styles.root, className)}>{children}</div>;
};
