import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import styles from "./VaultPage.module.scss";
import { VaultInfo } from "@/components/VaultInfo/VaultInfo";
import { VaultsSetting } from "@/components/VaultSetiings";
import { StrategiesValues } from "@/components/StrategiesValues";
import { ChangeDebtRatioBlock } from "@/components/StrategiesActions/ChangeDebtRatio";
import { useAccount } from "wagmi";
import { EmptyBlock } from "@/shared/ui-kit/EmptyBlock";
import { TAddress } from "@/components/StrategiesActions/HarvestButton";
import { SPGChart } from "@/components/StrateguiesSPG/SPGChart";
import { useVaultsData } from "@/shared/utils/useVaultsData";
import { ChangeSlipageBlock } from "@/components/StrategiesActions/ChangeSlipage";
import { PendingWithdrawals } from "@/components/PendingWithdrawals";

export default function VaultPage() {
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const router = useRouter();
  const vaults = useVaultsData();

  const addressQuerry: TAddress = (router.query.id as TAddress) ?? "";

  const vault = useMemo(() => {
    const foundedVault = vaults.find(
      (vault) => vault.address.toLowerCase() === addressQuerry.toLowerCase(),
    );

    if (foundedVault) {
      return foundedVault;
    }
  }, [addressQuerry, vaults]);

  useEffect(() => {
    if (isConnected) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [isConnected]);

  if (!vault) {
    return <h2>Loading...</h2>;
  }

  if (!isWalletConnected) {
    return <EmptyBlock title="Please, connect your wallet" />;
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>{vault.title}</h1>
      <h4 className={styles.pageSubtitle}>Vault address: {vault.address}</h4>
      <div className={styles.mainContainer}>
        <SPGChart vault={vault} />
        <div className={styles.vaultsManagmentContainer}>
          <VaultInfo vault={vault} />
          <VaultsSetting vault={vault} />
        </div>
      </div>
      <div>
        <h3 style={{ margin: 24 }}>Strategies</h3>
        <div className={styles.strategiesManagmentContainer}>
          <StrategiesValues vault={vault} />
          <ChangeDebtRatioBlock vault={vault} />
          <ChangeSlipageBlock vault={vault} />
          {vault.title === "lyUSD" && <PendingWithdrawals vault={vault} />}
        </div>
      </div>
    </div>
  );
}
