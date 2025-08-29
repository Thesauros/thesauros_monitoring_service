import { useContractWrite, usePrepareContractWrite } from "wagmi";
import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";
import { TVault } from "@/pages/vaults";

export const useHandleWithdrawals = (vault: TVault) => {
  const { config } = usePrepareContractWrite({
    address: vault.address,
    abi: OmniChainVaultAbi,
    chainId: vault.chainId,
    functionName: "handleWithdrawals",
  });

  const { write: handleWithdrawals } = useContractWrite(config);

  return { handleWithdrawals };
};
