import { Button } from "../../shared/ui-kit/Button/Button";
import { TableContainer } from "../../shared/ui-kit/TableContainer";
import styles from "./VaultSettings.module.scss";
import { useState } from "react";
import { useChangeDepositLimit } from "@/shared/utils/vaultsValues/useChangeDepositLimit";
import { useCloseVault } from "@/shared/utils/vaultsValues/useCloseVault";
import { TVault } from "@/pages/vaults";
import { WithdrawalTotal } from "./WithdrawalTotal";
import { HandleWithdrawalBlock } from "./HandleWithdrawalBlock";

export const VaultsSetting = ({ vault }: { vault: TVault }) => {
  const [depositLimit, setDepopsitLimit] = useState<string>("");

  const handleChange = (event: { target: { value: string } }) => {
    const value = event.target.value.toString();
    setDepopsitLimit(value);
  };

  const { changeDepositLimit } = useChangeDepositLimit(vault, depositLimit);
  const { closeVault } = useCloseVault(vault);

  return (
    <TableContainer>
      <>
        <div className={styles.settingContainer}>
          <span>Change Deposit Limit</span>
          <div className={styles.manageContainer}>
            <input
              className={styles.inputContainer}
              value={depositLimit}
              onChange={handleChange}
              type="number"
            />
            <Button onClick={() => changeDepositLimit?.()}>Change</Button>
          </div>
        </div>
        <div className={styles.settingContainer}>
          <span>Close vault</span>
          <Button onClick={() => closeVault?.()}>Close</Button>
        </div>
        {vault.title === "lyUSD" && <HandleWithdrawalBlock vault={vault} />}
        {vault.title === "lyUSD" && <WithdrawalTotal vault={vault} />}
      </>
    </TableContainer>
  );
};
