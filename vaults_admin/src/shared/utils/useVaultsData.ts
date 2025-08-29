import { TVault } from "@/pages/vaults";
import { useEffect, useState } from "react";

export const useVaultsData = () => {
    const [vaults, setVaults] = useState<TVault[]>([])


    const getData = async () => {
        const response = await fetch('https://raw.githubusercontent.com/locus-finance/Vaults/redeployMainnet/config/production.json');
        return await response.json();
    }

    const formatData = (data: any) => {

        const vaultKeys = Object.keys(data.vaults);
        const values = Object.values(data.vaults);

        const returnData = values.map((el: any, vaultIndex) => {

            if(!el.address) {
                return;
            }

            const strategiesKeys = Object.keys(el.strategies);
            const strategiesValues = Object.values(el.strategies);

            return {
                id: vaultIndex + 1,
                title: vaultKeys[vaultIndex],
                address: el.address,
                chainId: el.chain.chainId,
                tokenSymbol: el.wantTokenTicker,
                decimals: Number(el.decimals),
                strategies: strategiesValues.map((strategy: any, index) => ({
                    name: strategiesKeys[index],
                    address: strategy.address,
                    chainId: Number(strategy.chainId),
                    lzChainId: Number(strategy.lzChainId),
                    token: strategy.wantTokenTicker
                }))
            }
        });

        // @ts-ignore
        const filteredReturnData: TVault[] = returnData.filter((el) => el !== undefined);
        
        console.log('filteredReturnData', filteredReturnData)
        setVaults(filteredReturnData);
    }

    useEffect(() => {
        getData().then((res) => formatData(res));
    }, []);


    return vaults;
}