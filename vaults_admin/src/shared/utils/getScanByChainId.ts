const SCAN_CHAIN_ID_MAP: Record<number, string> = {
    [1]: "https://etherscan.io",
    [10]: "https://optimistic.etherscan.io",
    [42161]: "https://arbiscan.io",
    [8453]: "https://basescan.org/",
  };

  export const getScanByChainId = (
    chainId: number,
  ): string => {
  
    return SCAN_CHAIN_ID_MAP[chainId];
  };
  