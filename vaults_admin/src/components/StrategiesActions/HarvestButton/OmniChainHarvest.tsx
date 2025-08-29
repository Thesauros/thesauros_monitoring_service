import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useSignMessage,
  useSwitchNetwork,
} from "wagmi";
import { Button } from "../../../shared/ui-kit/Button/Button";
import BaseStrategyAbi from "../../../../BaseStrategy.json";
import styles from "./OmniChainHarvest.module.scss";

import OmniChainVaultAbi from "../../../../OmniChainVaultAbi.json";

import { TStrategy, TVault } from "@/pages/vaults";
import { Abi } from "viem";
import { useMemo, useState } from "react";
import { ethers } from "ethers";

export const OmniChainHarvest = ({
  vault,
  strategy,
}: {
  vault: TVault;
  strategy: TStrategy;
}) => {
  const [signature, setSignature] = useState<string>("");

  const { data: OmniChainVaultStrategiesData } = useContractRead({
    address: vault.address,
    abi: OmniChainVaultAbi,
    functionName: "strategies",
    chainId: vault?.chainId,
    args: [strategy.lzChainId, strategy.address],
    watch: true,
    select: (data: unknown) => {
      if (Array.isArray(data)) {
        return {
          totalDebt: data[1],
          debtRatio: data[2],
        };
      }
      return undefined;
    },
  });

  const { data: creditAvailable } = useContractRead({
    address: vault.address,
    abi: OmniChainVaultAbi,
    functionName: "creditAvailable",
    chainId: vault?.chainId,
    args: [strategy.lzChainId, strategy.address],
    watch: true,
  });

  const { data: debtOutstanding } = useContractRead({
    address: vault.address,
    abi: OmniChainVaultAbi,
    functionName: "debtOutstanding",
    chainId: vault?.chainId,
    args: [strategy.lzChainId, strategy.address],
    watch: true,
  });

  const harvestArguments = useMemo(() => {
    if (!!signature) {
      return [
        OmniChainVaultStrategiesData?.debtRatio,
        OmniChainVaultStrategiesData?.totalDebt,
        debtOutstanding,
        creditAvailable,
        ethers.utils.toUtf8Bytes(signature),
      ];
    }
    return [];
  }, [
    signature,
    OmniChainVaultStrategiesData,
    creditAvailable,
    debtOutstanding,
  ]);

  const { config: harvestConfig } = usePrepareContractWrite({
    address: strategy.address,
    abi: BaseStrategyAbi as Abi,
    functionName: "harvest",
    chainId: strategy.chainId,
    args: [...harvestArguments],
  });

  const { write: harvest } = useContractWrite(harvestConfig);

  const { data: strategistSignMessageHash } = useContractRead({
    address: strategy.address,
    abi: BaseStrategyAbi as Abi,
    functionName: "strategistSignMessageHash",
    chainId: strategy.chainId,
  });

  const { signMessageAsync } = useSignMessage({
    message: String(strategistSignMessageHash),
  });

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const getSignature = async () => {
    if (chain?.id !== strategy.chainId) {
      switchNetwork?.(strategy.chainId);
    }

    const sign = await signMessageAsync();

    setSignature(sign);
  };

  return (
    <div className={styles.root}>
      <Button
        onClick={() => {
          getSignature();
        }}
      >
        Get signature
      </Button>
      <Button
        onClick={() => {
          if (chain?.id !== strategy.chainId) {
            switchNetwork?.(strategy.chainId);
          }

          !!harvest && harvest();
        }}
        disabled={!signature}
      >
        Harvest
      </Button>
    </div>
  );
};
