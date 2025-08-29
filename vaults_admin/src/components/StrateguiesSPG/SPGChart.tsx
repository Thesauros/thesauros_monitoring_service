import { useStrategiesSPG } from ".";
import { TStrategy, TVault } from "@/pages/vaults";
import styles from "./SPGChart.module.scss";
import { TChartData } from "@/shared/ui-kit/Chart/types";
import { Chart } from "@/shared/ui-kit/Chart/Chart";
import React from "react";
import { EChartsOption } from "echarts";

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

export type TEstimatedData = Record<TStrategy["name"], TChartData[]>;


const getOptions = (data: TChartData[][], vault: TVault): EChartsOption => {

  const allDates = Array.from(
    new Set((Object.values(data) ?? []).flat().map((d) => d.x)),
  );

  const allDatesMap: Record<string | number, Map<number, number>> = {};

  Object.entries(data).map(([name, values]) => {
    allDatesMap[name] = new Map(values.map((d) => [d.x, d.y]));
  });

  const resultData: TEstimatedData = {};
  allDates.forEach((date) => {
    Object.keys(data).forEach((name) => {
      if (!Array.isArray(resultData[name])) {
        resultData[name] = [];
      }
      const newData: TChartData = allDatesMap[name].has(date)
        ? {
            x: date,
            y: allDatesMap[name].get(date) ?? 0,
          }
        : { x: date, y: 0 };
        resultData[name].push(newData);
    });
  });

  return {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: Object.entries(resultData).map(([name]) => `${vault.strategies[Number(name)].name}`)
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
      data: allDates?.map((date) => {
        return formatDate(date);
      }),
    },
    yAxis: {
      type: "value",
    },
    series: Object.entries(resultData).map(([name, data]) => ({
      name: `${vault.strategies[Number(name)].name}`,
      type: "line",
      tooltip: {
        valueFormatter: (value) => value + " " + vault.tokenSymbol,
      },
      data: data.map((value) => value.y.toFixed(2)),
    })),
  };
};

export const SPGChart = ({ vault }: { vault: TVault }) => {
  const data = useStrategiesSPG(vault);
  const option = data && getOptions(data, vault);
  return (
    <div className={styles.chartWrapper}>
      <Chart option={option} />
    </div>
  );
};
