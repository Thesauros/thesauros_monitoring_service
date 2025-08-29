import { TableContainer } from "../../../shared/ui-kit/TableContainer";
import styles from "./ChangeDebtRatioBlock.module.scss";
import { ChangeDebtRatioForm } from "../ChangeDebtRatioForm";
import { TVault } from "@/pages/vaults";

export const ChangeDebtRatioBlock = ({ vault }: { vault: TVault }) => {
  return (
    <TableContainer>
      <h4>Change Debt Ratio</h4>
      <div className={styles.mainBlock}>
        {vault.strategies.map(({ address, name }) => (
          <ChangeDebtRatioForm
            address={address}
            key={address}
            vaultAddress={vault.address}
            name={name}
          />
        ))}
      </div>
    </TableContainer>
  );
};
