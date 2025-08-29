import { MapChainIdToChainName } from "@/shared/utils/chains/chainIdToChainName";
import { httpRequest } from "../core";
import { TVault } from "@/pages/vaults";
import { useEffect, useState } from "react";
import { TChartData } from "@/shared/ui-kit/Chart/types";

type TTvlResponse = {
  tvl: number;
  date: number;
}[];

export const getTvl = async (vault: TVault) => {
  try {
    const url = `chain/${MapChainIdToChainName[vault.chainId]}/vault/${vault.address
    }/tvl?period=ALL`;

  const data = await httpRequest<TTvlResponse>(url);
  return data;
  } catch (e) {
    return null
  }

};

export const useTvl = (vault: TVault) => {
  const [tvl, setTvl] = useState<TChartData[]>([]);

  useEffect(() => {
    getTvl(vault).then((tvls) => {
      if(tvls) {
        const parsedTvl = tvls.map((item) => {
          return {
            x: Number(item.date) * 1000,
            y: item.tvl,
          };
        });
        setTvl(parsedTvl);
      }
    }).catch(() => {
      return null
    });
  }, [vault]);

  return { tvl };
};

export const useTotalTvl = (vaults: TVault[]) => {
  const [totalTvl, setTotalTvl] = useState<TChartData[]>([]);

  useEffect(() => {
    const promises = vaults.map((vault) => getTvl(vault));

    let totalMap: Record<TChartData["y"], TChartData["x"]> = {};
    Promise.all(promises).then((results) => {
      results.forEach((tvls) => {
        tvls?.forEach((item) => {
          const timestamp = Number(item.date) * 1000;
          totalMap[timestamp] = (totalMap[timestamp] ?? 0) + item.tvl;
        });
      });
      const result: TChartData[] = Object.entries(totalMap)
        .map(([timestamp, value]) => {
          return {
            x: +timestamp,
            y: value,
          };
        })
        .sort((a, b) => a.x - b.x);
      setTotalTvl(result);
    });
  }, [vaults]);

  return { totalTvl };
};
