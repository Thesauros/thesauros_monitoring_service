import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./EmptyBlock.module.scss";

export const EmptyBlock = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className={styles.root}>
      <h2>{title}</h2>
      {subtitle && <h4>{subtitle}</h4>}
      <ConnectButton accountStatus="address" showBalance={false} />
    </div>
  );
};
