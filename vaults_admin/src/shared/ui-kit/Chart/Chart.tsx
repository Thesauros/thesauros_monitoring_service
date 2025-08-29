import ReactECharts from "echarts-for-react";
import dark from "@/shared/ui-kit/Chart/themes/dark";
import { AppTheme, useTheme } from "@/shared/theme/theme";
import styles from "./Chart.module.scss";
import { Card } from "@/shared/ui-kit/Card/Card";
import { EChartsOption } from "echarts";

type TProps = {
  option: EChartsOption;
  loading?: boolean;
};

const loadingOption: any = {
  text: "",
  maskColor: "rgba(0, 0, 0, 0)",
  zlevel: 0,
  showSpinner: true,
  spinnerRadius: 10,
  lineWidth: 5,
};

export const Chart = ({ option, loading }: TProps) => {
  const { theme } = useTheme();
  const isLightTheme = theme === AppTheme.LIGHT;

  return (
    <Card className={styles.root}>
      {option && (
        <ReactECharts
          showLoading={loading}
          option={option ?? {}}
          loadingOption={loadingOption}
          theme={isLightTheme ? undefined : dark}
        />
      )}
    </Card>
  );
};
