import { TVault } from "@/pages/vaults";
import Link from "next/link";
import styles from "./VaultCard.module.scss";
import { useVaultVaules } from "@/shared/utils/vaultsValues";
import { useMemo } from "react";
import { Card } from "@/shared/ui-kit/Card/Card";

export const VaultCard = ({ vault }: { vault: TVault }) => {
  const { vaultInfo } = useVaultVaules(vault);

  const depostiLimit = useMemo(() => {
    if (vaultInfo[0]) {
      return Number(vaultInfo[0]?.value).toFixed(2);
    }
  }, [vaultInfo]);

  const withdrawLimit = useMemo(() => {
    if (vaultInfo[1]) {
      return Number(vaultInfo[1]?.value).toFixed(2);
    }
  }, [vaultInfo]);

  return (
    <Card>
      <Link href={`/vault/${vault.address}`} className={styles.vaultBlock}>
        <h3 className={styles.cardTitle}>{vault.title}</h3>
        <div className={styles.valuesContainer}>
          <p className={styles.valueBlock}>
            Deposit limit: {depostiLimit} {vault.tokenSymbol}
          </p>
          <p className={styles.valueBlock}>
            Withdrawal limit: {withdrawLimit} {vault.tokenSymbol}
          </p>
        </div>
      </Link>
    </Card>
  );
};
