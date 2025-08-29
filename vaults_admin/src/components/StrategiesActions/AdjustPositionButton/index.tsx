import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Button } from "../../../shared/ui-kit/Button/Button";
import BaseStrategyAbi from "../../../../BaseStrategy.json";
import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";
import { TStrategy, TVault } from "@/pages/vaults";
import { ethers } from "ethers";
import { useMemo } from "react";

export const AdjustPositionButton = ({
  vault,
  strategy,
}: {
  vault: TVault;
  strategy: TStrategy;
}) => {
  const { data: debtOutstanding } = useContractRead({
    address: vault.address,
    abi: OmniChainVaultAbi,
    functionName: "debtOutstanding",
    chainId: vault?.chainId,
    args: [strategy.lzChainId, strategy.address],
    watch: true,
  });

  const debt = useMemo(
    () =>
      debtOutstanding ? ethers.utils.parseUnits(String(debtOutstanding)) : null,
    [debtOutstanding],
  );

  const { config } = usePrepareContractWrite({
    address: strategy.address,
    abi: BaseStrategyAbi,
    functionName: "adjustPosition",
    chainId: strategy.chainId,
    args: [debt],
  });

  const { write: adjust } = useContractWrite(config);

  return (
    <div>
      <Button onClick={() => !!adjust && adjust()}>Adjust Position</Button>
    </div>
  );
};
