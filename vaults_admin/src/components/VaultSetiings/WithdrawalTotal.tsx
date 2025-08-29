import { TVault } from "@/pages/vaults";
import { useWithdrawEpochs } from "@/shared/utils/vaultsValues/useWithdrawEpochs";
import styles from "./VaultSettings.module.scss";

export const WithdrawalTotal = ({ vault }: { vault: TVault }) => {
  const pendingData = useWithdrawEpochs(vault);

  return (
    pendingData && (
      <div className={styles.settingContainer}>
        <span>Total Pending</span>
        <span>{Number(pendingData.total).toFixed(2)} USDC</span>
      </div>
    )
  );
};
