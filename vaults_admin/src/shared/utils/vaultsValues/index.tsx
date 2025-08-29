import { useEffect, useMemo, useState } from "react";
import { useContractRead } from "wagmi";
import BaseVault from "../../../../BaseVault.json";
import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";
import { BigNumber, ethers } from "ethers";
import { useStrategiesEstimatedTotalAssets } from "./useStrategiesEstimatedTotalAssets";
import { TVault } from "@/pages/vaults";
import { useVaultTotalAssets } from "./useVaultTotalAssets";
import { Abi } from "viem";

type TVaultValue = {
  name: string | number;
  value?: string | number | null;
  symbol?: string;
};

export const useVaultVaules = (vault: TVault) => {
  const strategiesEstimatedData = useStrategiesEstimatedTotalAssets(vault);
  const strategiesEstimatedTotalAssets = useMemo(
    () => strategiesEstimatedData?.strategyEstimatedTotalAssets,
    [strategiesEstimatedData],
  );

  const [vaultInfo, setVaultInfo] = useState<TVaultValue[]>([]);

  const abi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseVault;

  const { data: availableDepositLimitData } = useContractRead({
    address: vault?.address,
    abi: abi as Abi,
    functionName: "availableDepositLimit",
    watch: true,
    chainId: vault?.chainId,
    select: (data) =>
      ethers.utils.formatUnits(
        data as BigNumber,
        BigNumber.from(vault.decimals),
      ),
  });

  const availableDepositLimit = useMemo(() => {
    return availableDepositLimitData ?? 0;
  }, [availableDepositLimitData]);

  const { data: totalIdle } = useContractRead({
    address: vault?.address,
    abi: abi as Abi,
    functionName: "totalIdle",
    watch: true,
    chainId: vault?.chainId,
    select: (data) =>
      ethers.utils.formatUnits(
        data as BigNumber,
        BigNumber.from(vault.decimals),
      ),
  });

  const availableForWithdrawal = useMemo(() => {
    if (totalIdle && strategiesEstimatedTotalAssets && availableDepositLimit) {
      return vault?.decimals === 18
        ? Number(totalIdle) + strategiesEstimatedTotalAssets
        : Number(availableDepositLimit) + strategiesEstimatedTotalAssets;
    }

    return 0;
  }, [
    totalIdle,
    strategiesEstimatedTotalAssets,
    availableDepositLimit,
    vault?.decimals,
  ]);

  const vaultTotalAssets = useVaultTotalAssets(vault);

  useEffect(() => {
    const withdrawalBufferValue =
      totalIdle &&
      (
        (Number(totalIdle) / Number(strategiesEstimatedTotalAssets)) *
        100
      ).toFixed(2);

    setVaultInfo([
      {
        name: "Available For Deposit",
        value: availableDepositLimit,
        symbol: vault?.tokenSymbol,
      },
      {
        name: "Available for Withdrawal",
        value: availableForWithdrawal,
        symbol: vault?.tokenSymbol,
      },
      {
        name: "Withdrawal Buffer",
        value: isNaN(Number(withdrawalBufferValue)) ? 0 : withdrawalBufferValue,
        symbol: "%",
      },
      {
        name: "Vault Total Assets",
        value: vaultTotalAssets,
        symbol: "$",
      },
    ]);
  }, [
    availableForWithdrawal,
    totalIdle,
    availableDepositLimit,
    strategiesEstimatedTotalAssets,
    vaultTotalAssets,
    vault?.decimals,
    vault?.tokenSymbol,
  ]);

  return { vaultInfo };
};
