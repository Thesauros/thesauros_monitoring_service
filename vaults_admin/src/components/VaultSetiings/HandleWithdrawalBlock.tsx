import { TVault } from "@/pages/vaults";
import { useHandleWithdrawals } from "@/shared/utils/vaultsValues/useHandleWithdrawals";
import styles from "./VaultSettings.module.scss";
import { Button } from "@/shared/ui-kit/Button/Button";

export const HandleWithdrawalBlock = ({ vault }: { vault: TVault }) => {
  const { handleWithdrawals } = useHandleWithdrawals(vault);

  return (
    <div className={styles.settingContainer}>
      <span>Handle Withdrawals</span>
      <Button onClick={() => handleWithdrawals?.()}>Withdraw</Button>
    </div>
  );
};
