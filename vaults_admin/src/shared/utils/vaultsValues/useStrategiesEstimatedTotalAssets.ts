import strategiesAbi from "../../../../strategyAbi.json";
import BaseStrategyAbi from "../../../../BaseStrategy.json";
import { useAccount, useContractReads } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { TVault } from "@/pages/vaults";
import { Abi } from "viem";
import { Result } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { getPrice } from "../../api/endpoints/getPrice";

export const useStrategiesEstimatedTotalAssets = (vault: TVault) => {
  const addresses =
    vault && vault.strategies.map((strategy) => strategy.address);
  const [coinPrice, setCoinPrice] = useState(0);
  const { isConnected } = useAccount();

  const strategyAbi = vault.title === "lyUSD" ? BaseStrategyAbi : strategiesAbi;

  const preparedContracts =
    addresses &&
    addresses.map((address, index) => ({
      address: address,
      abi: strategyAbi as Abi,
      functionName: "estimatedTotalAssets",
      chainId: vault.strategies[index].chainId,
    }));

  useEffect(() => {
    getPrice(vault.tokenSymbol).then((res) => setCoinPrice(res));
  }, [vault.tokenSymbol]);

  const { data } = useContractReads({
    contracts: preparedContracts,
    watch: true,
    enabled: isConnected,
    select: (data: Result) => {
      return {
        estimatedTotalAssets: data.map((el) => {
          if (el.status === "failure") {
            return 0;
          }
          const value = Number(
            ethers.utils.formatUnits(
              el.result as BigNumber,
              BigNumber.from(vault.decimals),
            ),
          );
          return value * coinPrice;
        }),
        strategyEstimatedTotalAssets: data.reduce(
          (accumulator: number, currentValue) => {
            if (currentValue.status === "failure") {
              return 0 + accumulator;
            }
            return (
              Number(
                ethers.utils.formatUnits(
                  currentValue.result as BigNumber,
                  BigNumber.from(vault.decimals),
                ),
              ) + accumulator
            );
          },
          0,
        ),
      };
    },
  });

  return data;
};
