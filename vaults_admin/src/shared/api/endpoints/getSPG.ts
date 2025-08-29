const ENDPOINT = "https://api.locus.wiki/v1/chain";

const getSTGChartData = async (url: string) => {
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

export const getSPG = async (
  chainName: string,
  strategyAddress: string,
  period: string,
) => {
  const url = `${ENDPOINT}/${chainName}/strategy/${strategyAddress}/spg?period=${period}`;
  const data = await getSTGChartData(url);

  return data && data.length !== 0
    ? data.map((el: any) => ({ x: Number(`${el.date}000`), y: el.spg }))
    : [];
};
