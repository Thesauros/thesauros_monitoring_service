import { TVault } from "@/pages/vaults";
import { useMemo } from "react";
import { Abi } from "viem";
import { useContractRead } from "wagmi"
import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";
import { BigNumber, ethers } from "ethers";

export const useWithdrawEpochs = (vault: TVault) => {
  const { data: withdrawEpoch } = useContractRead({
    address: vault?.address,
    abi: OmniChainVaultAbi as Abi,
    functionName: "withdrawEpoch",
    watch: true,
    chainId: vault?.chainId,
  });

  const { data: pricePerShare } = useContractRead({
    address: vault?.address,
    abi: OmniChainVaultAbi as Abi,
    functionName: "pricePerShare",
    watch: true,
    chainId: vault?.chainId,
    select: (data) => Number(
      ethers.utils.formatUnits(
        data as BigNumber,
        BigNumber.from(vault.decimals),
      ),
    )
  });

  const { data: withdrawEpochs } = useContractRead({
    address: vault?.address,
    abi: OmniChainVaultAbi as Abi,
    functionName: "getRequestsWithinEpoch",
    watch: true,
    chainId: vault?.chainId,
    args: withdrawEpoch ? [BigInt(Number(withdrawEpoch) - 1)] : [0],
  });

  const pendingList: any[] = useMemo(() => {

    if(withdrawEpochs && pricePerShare && Array.isArray(withdrawEpochs)) {
      
      return withdrawEpochs.map((el) => ({
        ...el,
        value:  Number(
          ethers.utils.formatUnits(
            el.shares as BigNumber,
            BigNumber.from(vault.decimals),
        )) * pricePerShare,
      }))
      
    }

    return [];

  }, [withdrawEpochs, pricePerShare, vault.decimals])

  const total = useMemo(() => pendingList.reduce((accumulator, currentValue) => accumulator + currentValue.value,
  0), [pendingList])

  return vault.title === "lyUSD" ? {pendingList, total} : null;
}