import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { Button } from "../../../shared/ui-kit/Button/Button";
import strategyAbi from "../../../../strategyAbi.json";
import { TStrategy } from "@/pages/vaults";

export type TAddress = `0x${string}`;

export const HarvestButton = ({
  strategy,
}: {
  strategy: TStrategy;
}) => {
  const { config } = usePrepareContractWrite({
    address: strategy.address,
    abi: strategyAbi,
    functionName: "harvest",
    chainId: strategy.chainId,
  });

  const { write: harvest } = useContractWrite(config);

  return (
    <div>
      <Button onClick={() => !!harvest && harvest()}>Harvest</Button>
    </div>
  );
};
