import { MapChainIdToChainName } from "@/shared/utils/chains/chainIdToChainName";
import { httpRequest } from "@/shared/api/core";
import { TAddress } from "@/components/StrategiesActions/HarvestButton";
import { TStrategy, TVault } from "@/pages/vaults";
import { TChartData } from "@/shared/ui-kit/Chart/types";
import { useEffect, useState } from "react";
import { getPrice } from "@/shared/api/endpoints/getPrice";

type TEstimatedAssetsResponseRaw = {
  estimated_assets: number;
  date: string;
}[];

const getEstimatedAssets = async (
  strategyAddress: TAddress,
  chainId: number,
) => {
  try {
  const url = `chain/${MapChainIdToChainName[chainId]}/strategy/${strategyAddress}/estimated_assets`;

  const data = await httpRequest<TEstimatedAssetsResponseRaw>(url);
  return data;
  } catch(e) {
    return null;
  }
};

export type TEstimatedAssets = Record<TStrategy["name"], TChartData[]>;

export const useEstimatedAssets = (vaults: TVault[]) => {
  const [estimatedAssets, setEstimatedAssets] = useState<TEstimatedAssets>({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const fetchEstimatedAssets = async () => {
      const map: TEstimatedAssets = {};
      const usdPrice = await getPrice("USDC");
      const ethPrice = await getPrice("WETH");

      for (const vault of vaults) {
        for (const strategy of vault.strategies) {
          const { address, chainId, name } = strategy;
          const assets = await getEstimatedAssets(address, chainId);
          if (assets) {
            map[name] = assets.map((asset) => {
              return {
                x: Number(asset.date) * 1000,
                y:
                  asset.estimated_assets *
                  (vault.tokenSymbol === "WETH" ? ethPrice : usdPrice),
              };
            });
          }
        }
      }
      if (vaults.length && map) setLoading(false);
      setEstimatedAssets(map);
    };

    fetchEstimatedAssets();
  }, [vaults]);

  return { estimatedAssets, loading };
};
