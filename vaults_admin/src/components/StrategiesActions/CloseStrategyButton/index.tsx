import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { Button } from "../../../shared/ui-kit/Button/Button";
import BaseVault from "@/../BaseVault.json";
import OmniChainVaultAbi from "@/../OmniChainVaultAbi.json";
import BaseStrategyAbi from "@/../BaseStrategy.json";
import mainStrategyAbi from "@/../strategyAbi.json";
import { useCallback } from "react";
import { TStrategy, TVault } from "@/pages/vaults";
import { Abi } from "viem";

export const CloseStrategyButton = ({
  strategy,
  vault,
}: {
  strategy: TStrategy;
  vault: TVault;
}) => {
  const abi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseVault;
  const strategyAby = vault.title === "lyUSD" ? BaseStrategyAbi : mainStrategyAbi;
  const args = vault.title === "lyUSD" ? [strategy.lzChainId, strategy.address] : [strategy.address];

  const { config: revokeConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: abi as Abi,
    functionName: "revokeStrategy",
    chainId: vault.chainId,
    args: args,
  });

  const { write: revokeStrategy } = useContractWrite(revokeConfig);
    
  const { config: harvestConfig } = usePrepareContractWrite({
    address: strategy.address,
    abi: strategyAby as Abi,
    functionName: "harvest",
    chainId: strategy.chainId,
  });

  const { write: harvestStrategy } = useContractWrite(harvestConfig);

  const closeStrategy = useCallback(() => {
    if (!!revokeStrategy && !!harvestStrategy) {
      revokeStrategy();
      harvestStrategy();
    }
  }, [revokeStrategy, harvestStrategy]);

  return (
    <Button
      onClick={() => {
        closeStrategy();
      }}
    >
      Close strategy
    </Button>
  );
};
