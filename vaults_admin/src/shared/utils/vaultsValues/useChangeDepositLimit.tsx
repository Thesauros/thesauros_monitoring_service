import { BigNumber, ethers } from "ethers";
import { useMemo } from "react";
import BaseVault from "../../../../BaseVault.json";
import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";

import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { TVault } from "@/pages/vaults";
import { Abi } from "viem";

export const useChangeDepositLimit = (vault: TVault, depositLimit: string) => {
  const vaultAbi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseVault;
  const argForContract = useMemo(() => {
    if (depositLimit) {
      return ethers.utils.parseUnits(
        depositLimit,
        BigNumber.from(vault.decimals),
      )._hex;
    }
    return null;
  }, [depositLimit, vault.decimals]);

  const { config } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultAbi as Abi,
    functionName: "setDepositLimit",
    chainId: vault.chainId,
    enabled: !!argForContract,
    args: [argForContract],
  });

  const { write: changeDepositLimit } = useContractWrite(config);

  return { changeDepositLimit };
};
