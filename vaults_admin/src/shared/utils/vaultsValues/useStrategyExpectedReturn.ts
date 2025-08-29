import { useAccount, useContractReads } from "wagmi";
import { TVault } from "@/pages/vaults";
import BaseVault from "../../../../BaseVault.json";
import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";
import { Abi } from "viem";
import { BigNumber, ethers } from "ethers";
import { Result } from "ethers/lib/utils";

export const useStrategiesExpectedReturn = (vault: TVault) => {
  const addresses =
    vault && vault.strategies.map((strategy) => strategy.address);
  const { isConnected } = useAccount();

  const abi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseVault

  const preparedContracts =
    addresses &&
    addresses.map((address) => {
      return {
        address: vault.address,
        abi: abi as Abi,
        functionName: "expectedReturn",
        chainId: vault.chainId,
        args: [address],
      }
    });

  const { data: ExpectedReturn } = useContractReads({
    contracts: preparedContracts,
    enabled: isConnected,
    select: (data: Result) => {
      return data.map((el: Result) =>
      el.status === 'failure' ? 0 :
        Number(
          ethers.utils.formatUnits(
            el.result as BigNumber,
            BigNumber.from(vault.decimals),
          ),
        ),
      );
    },
  });

  return { data: ExpectedReturn };
};
