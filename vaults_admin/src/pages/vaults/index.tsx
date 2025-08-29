import styles from "./Vaults.module.scss";
import { TAddress } from "@/components/StrategiesActions/HarvestButton";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { EmptyBlock } from "@/shared/ui-kit/EmptyBlock";
import { VaultCard } from "@/screens/vaults/VaultCard";
import { VaultTvlChart } from "@/screens/vaults/VaultTvlChart";
import { VaultTotalTvlChart } from "@/screens/vaults/VaultTotalTvlChart";
import { useEstimatedAssets } from "@/shared/api/endpoints/getEstimatedAssets";
import { EstimatedTotalAssetsChart } from "@/screens/vaults/EstimatedTotalAssetsChart";
import { useVaultsData } from "@/shared/utils/useVaultsData";

export type TStrategy = {
  name: string;
  address: TAddress;
  chainId: number;
  lzChainId: number;
  token: string;
};

export type TVault = {
  id: number;
  title: string;
  address: TAddress;
  chainId: number;
  tokenSymbol: string;
  decimals: number;
  strategies: TStrategy[];
};

export default function VaultsPage() {
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const vaults = useVaultsData();
  const { estimatedAssets, loading } = useEstimatedAssets(vaults);

  useEffect(() => {
    if (isConnected) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [isConnected]);

  return isWalletConnected ? (
    <div className={styles.root}>
      <div className={styles.vaultsContainer}>
        {vaults.length &&
          vaults.map((vault) => {
            return (
              <div className={styles.vaultContainer} key={vault.address}>
                <div>
                  <VaultCard vault={vault} />
                </div>
              </div>
            );
          })}
        <div className={styles.vaultTvlChartContainer}>
          <VaultTotalTvlChart vaults={vaults} />
        </div>
        <div className={styles.estimatedTotalAssets}>
          <EstimatedTotalAssetsChart
            estimatedAssets={estimatedAssets}
            loading={loading}
          />
        </div>
        {vaults.map((vault) => {
          if (vault.title === "lyUSD") {
            return;
          }
          return (
            <div className={styles.vaultContainer} key={vault.address}>
              <VaultTvlChart vault={vault} />
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <EmptyBlock title="Please, connect your wallet" />
  );
}
