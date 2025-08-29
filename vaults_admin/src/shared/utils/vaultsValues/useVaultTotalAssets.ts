import { TVault } from "@/pages/vaults";
import { useContractRead } from "wagmi";
import BaseVault from "@/../../BaseVault.json";
import OmniChainVaultAbi from "@/../../OmniChainVaultAbi.json";
import { BigNumber, ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { getPrice } from "../../api/endpoints/getPrice";
import { Abi } from "viem";

export const useVaultTotalAssets = (vault: TVault) => {
  const [coinPrice, setCoinPrice] = useState(0);

  const abi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseVault

  useEffect(() => {
    getPrice(vault.tokenSymbol).then((res) => setCoinPrice(res));
  }, [vault.tokenSymbol]);

  const { data: pricePerShare } = useContractRead({
    address: vault?.address,
    abi: abi as Abi,
    functionName: "pricePerShare",
    watch: true,
    chainId: vault?.chainId,
    select: (data) => {
      return ethers.utils.formatUnits(
        data as BigNumber,
        BigNumber.from(vault.decimals),
      )
    }
  });

  const { data: totalSupply } = useContractRead({
    address: vault?.address,
    abi: abi as Abi,
    functionName: "totalSupply",
    watch: true,
    chainId: vault?.chainId,
    select: (data) =>
      ethers.utils.formatUnits(
        data as BigNumber,
        BigNumber.from(vault.decimals),
      ),
  });

  const vaultTotalAssets = useMemo(() => {
    if (pricePerShare && totalSupply && coinPrice) {
      return Number(pricePerShare) * Number(totalSupply) * coinPrice;
    }
    return 0;
  }, [pricePerShare, totalSupply, coinPrice]);

  return vaultTotalAssets;
};
