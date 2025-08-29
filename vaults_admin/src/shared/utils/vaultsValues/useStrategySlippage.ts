import strategyAbi from "../../../../strategyAbi.json";
import { useAccount, useContractReads } from "wagmi";
import { BigNumber } from "ethers";
import { TVault } from "@/pages/vaults";
import { Abi } from "viem";
import { Result } from "ethers/lib/utils";

export const useStrategySlippage = (vault: TVault) => {
    const addresses =
        vault && vault.strategies.map((strategy) => strategy.address);
    const { isConnected } = useAccount();

    const preparedContracts =
        addresses &&
        addresses.map((address) => ({
            address: address,
            abi: strategyAbi as Abi,
            functionName: "slippage",
            chainId: vault.chainId,
        }));

    const { data } = useContractReads({
        contracts: preparedContracts,
        watch: true,
        enabled: isConnected,
        select: (data: Result) => {
            return data.map((el) => Number(el.result as BigNumber) / 100,
            )
        },
    });

    return data;
};
