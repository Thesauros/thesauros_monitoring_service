import { useContractWrite, usePrepareContractWrite } from "wagmi";
import BaseVault from "../../../../BaseVault.json";
import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";
import { TVault } from "@/pages/vaults";
import { Abi } from "viem";

export const useCloseVault = (vault: TVault) => {
  const vaultAbi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseVault;

  const { config } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultAbi as Abi,
    chainId: vault.chainId,
    functionName: "setEmergencyShutdown",
    args: [true],
  });

  const { write: closeVault } = useContractWrite(config);

  return { closeVault };
};
