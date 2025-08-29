import { TEstimatedAssets } from "@/shared/api/endpoints/getEstimatedAssets";
import { Chart } from "@/shared/ui-kit/Chart/Chart";
import { formatDate } from "@/components/StrateguiesSPG/SPGChart";
import { EChartsOption } from "echarts";
import { cutNumber } from "@/shared/utils/string/cutNumber";
import { TChartData } from "@/shared/ui-kit/Chart/types";

type TProps = {
  estimatedAssets: TEstimatedAssets;
  loading: boolean;
};

const getOptions = (estimatedAssets: TEstimatedAssets) => {
  const allDates = Array.from(
    new Set((Object.values(estimatedAssets) ?? []).flat().map((d) => d.x)),
  );

  const allDatesMap: Record<string, Map<number, number>> = {};

  Object.entries(estimatedAssets).map(([name, data]) => {
    allDatesMap[name] = new Map(data.map((d) => [d.x, d.y]));
  });

  const resulEstimatedAssets: TEstimatedAssets = {};
  allDates.forEach((date) => {
    Object.keys(estimatedAssets).forEach((name) => {
      if (!Array.isArray(resulEstimatedAssets[name])) {
        resulEstimatedAssets[name] = [];
      }
      const newData: TChartData = allDatesMap[name].has(date)
        ? {
            x: date,
            y: allDatesMap[name].get(date) ?? 0,
          }
        : { x: date, y: 0 };
      resulEstimatedAssets[name].push(newData);
    });
  });

  const options: EChartsOption = {
    title: {
      text: `Estimated assets`,
    },
    legend: {
      data: Object.keys(estimatedAssets),
      orient: "vertical",
      right: 0,
      top: 20,
    },
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "160px",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: allDates?.map((date) => {
        return formatDate(date);
      }),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          return `$${cutNumber(value)}`;
        },
      },
    },
    series: Object.entries(resulEstimatedAssets).map(([name, data]) => ({
      name,
      type: "line",
      data: data.map((value) => value.y.toFixed(2)),
      showSymbol: false,
    })),
  };
  return options;
};

export const EstimatedTotalAssetsChart = ({ estimatedAssets, loading }: TProps) => {
  const option = getOptions(estimatedAssets);

  return <Chart option={option} loading={loading} />;
};
