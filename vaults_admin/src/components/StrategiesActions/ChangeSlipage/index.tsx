import { TableContainer } from "../../../shared/ui-kit/TableContainer";
import styles from "./ChangeSlipage.module.scss";
import { TVault } from "@/pages/vaults";
import { ChangeSlippageForm } from "./form";

export const ChangeSlipageBlock = ({ vault }: { vault: TVault }) => {
  return (
    <TableContainer>
      <h4>Change Slipage</h4>
      <div className={styles.mainBlock}>
        {vault.strategies.map(({ address, name }) => (
          <ChangeSlippageForm
            address={address}
            key={address}
            vault={vault}
            name={name}
          />
        ))}
      </div>
    </TableContainer>
  );
};
