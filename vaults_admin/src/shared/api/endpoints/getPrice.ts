import { TVault } from "@/pages/vaults";

const ENDPOINT = "https://api.locus.wiki/v1/prices";

const getCoinPrice = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (e) {
    return [];
  }
};

export const getPrice = async (currencyName: TVault["tokenSymbol"]) => {
  const currency = currencyName === "WETH" ? "weth" : "usd-coin";
  const url = `${ENDPOINT}/${currency}?period=1W`;
  const data = await getCoinPrice(url);

  return data.length !== 0 ? data[data.length - 1].PriceUSD : 0;
};
