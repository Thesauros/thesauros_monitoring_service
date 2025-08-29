import { TVault } from "@/pages/vaults";
import { useTotalTvl } from "@/shared/api/endpoints/getTvl";
import { formatDate } from "@/components/StrateguiesSPG/SPGChart";
import { TChartData } from "@/shared/ui-kit/Chart/types";
import { EChartsOption } from "echarts-for-react";
import { formatMoney } from "@/shared/utils/string/formatMoney";
import { Chart } from "@/shared/ui-kit/Chart/Chart";
import { cutNumber } from "@/shared/utils/string/cutNumber";

const getOptions = (data: TChartData[]) => {
  const options: EChartsOption = {
    title: {
      text: `Total TVL`,
    },
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data?.map((el) => formatDate(el.x)),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          return `$${cutNumber(value)}`;
        },
      },
    },
    series: [
      {
        name: `Total TVL`,
        type: "line",
        stack: "Total",
        showSymbol: false,
        tooltip: {
          valueFormatter: (value: string) => `$${formatMoney(+value)}`,
        },
        data: data.map((d) => d.y),
      },
    ],
  };

  return options;
};

export const VaultTotalTvlChart = ({ vaults }: { vaults: TVault[] }) => {
  const { totalTvl } = useTotalTvl(vaults);
  const option = totalTvl.length > 0 && getOptions(totalTvl);

  return <Chart option={option} />;
};
