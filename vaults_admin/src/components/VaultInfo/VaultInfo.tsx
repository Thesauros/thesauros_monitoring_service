import { TVault } from "@/pages/vaults";
import { TableContainer } from "../../shared/ui-kit/TableContainer";
import styles from "./VaultInfo.module.scss";
import { useVaultVaules } from "@/shared/utils/vaultsValues";

export const VaultInfo = ({ vault }: { vault: TVault }) => {
  const { vaultInfo } = useVaultVaules(vault);

  return (
    <TableContainer>
      {vaultInfo &&
        vaultInfo.map(({ value, name, symbol }) => {
          return (
            <div className={styles.valueContainer} key={name}>
              <span>{name}</span>
              <span>
                {Number(value).toFixed(2)} <span>{symbol}</span>{" "}
              </span>
            </div>
          );
        })}
    </TableContainer>
  );
};
