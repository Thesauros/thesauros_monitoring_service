import { TVault } from "@/pages/vaults";
import { MapChainIdToChainName } from "@/shared/utils/chains/chainIdToChainName";
import { TChartData } from "@/shared/ui-kit/Chart/types";
import { getSPG } from "@/shared/api/endpoints/getSPG";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useStrategiesSPG = (vault: TVault) => {
  const addresses = useMemo(() => vault && vault.strategies.map((strategy) => strategy.address),[vault])
  const [chartData, setChartData] = useState<TChartData[][]>([]);

  const getChartData = useCallback(async () => {
    const data = await Promise.all(
      addresses.map(async (address) => {
        const chainName = MapChainIdToChainName[vault.chainId];
        return getSPG(chainName, address, "ALL");
      }),
    );

    return data;
  }, [addresses, vault.chainId]);

  useEffect(() => {
    getChartData().then((res) => setChartData(res));
  }, [getChartData]);

  return chartData;
};
