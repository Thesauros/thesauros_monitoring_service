// @ts-nocheck
import { TableContainer } from "../../shared/ui-kit/TableContainer";
import styles from "./StrategiesValues.module.scss";
import BaseVault from "../../../BaseVault.json";
import OmniChainVaultAbi from "../../../OmniChainVaultAbi.json";
import { useAccount, useContractReads } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { HarvestButton } from "../StrategiesActions/HarvestButton";
import { CloseStrategyButton } from "../StrategiesActions/CloseStrategyButton";
import { TVault } from "@/pages/vaults";
import { Abi } from "viem";
import { useStrategiesExpectedReturn } from "@/shared/utils/vaultsValues/useStrategyExpectedReturn";
import { useStrategiesEstimatedTotalAssets } from "@/shared/utils/vaultsValues/useStrategiesEstimatedTotalAssets";
import { formatDistanceToNowStrict } from "date-fns";
import { useStrategySlippage } from "@/shared/utils/vaultsValues/useStrategySlippage";
import { AdjustPositionButton } from "../StrategiesActions/AdjustPositionButton";
import { OmniChainHarvest } from "../StrategiesActions/HarvestButton/OmniChainHarvest";
import Link from "next/link";
import { getScanByChainId } from "@/shared/utils/getScanByChainId";
import { truncate } from "@/shared/utils/string/truncate";

export const StrategiesValues = ({ vault }: { vault: TVault }) => {
  const stretegiesNames =
    vault && vault.strategies.map((strategy) => strategy.name);
  const { data: expectedReturn } = useStrategiesExpectedReturn(vault);

  const estimatedData = useStrategiesEstimatedTotalAssets(vault);
  const strategiesSlippage = useStrategySlippage(vault);

  const { isConnected } = useAccount();

  const metrics = ["metric", ...stretegiesNames.map((name) => name)];

  const preparedContracts = vault.strategies.map((strategy) => {
    const args =
      vault.title === "lyUSD"
        ? [strategy.lzChainId, strategy.address]
        : [strategy.address];
    const abi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseVault;

    return {
      address: vault.address,
      abi: abi as Abi,
      functionName: "strategies",
      chainId: vault?.chainId,
      args: [...args],
    };
  });

  const { data: strategyData } = useContractReads({
    contracts: preparedContracts,
    watch: true,
    enabled: isConnected,
    select: (data) => {
      return data.map((el: any) => {
        if (vault.title === "lyUSD" && Array.isArray(data)) {
          return {
            lastReport: formatDistanceToNowStrict(
              Number(`${el?.result[5]}000`),
            ),
            totalDebt: ethers.utils.formatUnits(el.result[2] as BigNumber),
            debtOutstanding: ethers.utils.formatUnits(
              el.result[2] as BigNumber,
            ),
          };
        }
        return {
          lastReport: formatDistanceToNowStrict(
            Number(`${el.result.lastReport}000`),
          ),
        };
      });
    },
  });

  const { data: debtRatiosData } = useContractReads({
    contracts: preparedContracts,
    watch: true,
    enabled: isConnected,
    select: (data) => {
      return data.map((el: any) => {
        if (vault.title === "lyUSD") {
          return el?.result[1];
        }
        return el?.result.debtRatio;
      });
    },
  });

  const debtRatios =
    debtRatiosData &&
    debtRatiosData.map((el) => {
      return el && vault?.decimals === 18
        ? ethers.utils.formatUnits(el as unknown as BigNumber)
        : Number(el) / 10 ** vault?.decimals;
    });

  const strategiesValue = [
    "Adress",
    ...(vault.strategies?.map((strategy) => strategy) ?? []),
  ];

  const debtRatio = [
    "Debt Ratio",
    ...(debtRatios?.map(
      (debtRatio) => Number(debtRatio) * 10 ** (vault.decimals - 2),
    ) ?? []),
  ];

  const strategyExpectedReturn = expectedReturn && [
    "Expected Return",
    ...expectedReturn,
  ];

  const estimated = estimatedData && [
    "Estimated Total Assets",
    ...estimatedData?.estimatedTotalAssets,
  ];

  const slippage = strategiesSlippage && ["Slippage", ...strategiesSlippage];

  const lastReportDates = strategyData && ["Last Report", ...strategyData];

  return (
    <TableContainer>
      <div className={styles.tableHeader}>
        {metrics.map((metric, index) => (
          <span key={index}>{metric}</span>
        ))}
      </div>
      <div className={styles.debtRatio}>
        {debtRatio.map((metric, index) => (
          <span key={index}>
            {index === 0 ? metric : `${Number(metric).toFixed(2)}%`}
          </span>
        ))}
      </div>
      <div className={styles.debtRatio}>
        {strategiesValue.map((metric, index) =>
          index === 0 && typeof metric === "string" ? (
            <span key={index}>{metric}</span>
          ) : (
            <Link
              href={`${getScanByChainId(metric.chainId)}/address/${
                metric.address
              }`}
              target="_blank"
              key={`${metric}_${index}`}
            >
              {truncate(metric.address, 5)}
            </Link>
          ),
        )}
      </div>
      <div className={styles.debtRatio}>
        {strategyExpectedReturn &&
          strategyExpectedReturn.map((metric, index) => (
            <span key={index}>
              {index === 0
                ? metric
                : `${Number(metric).toFixed(vault.title === "vETH" ? 5 : 2)}%`}
            </span>
          ))}
      </div>
      <div className={styles.debtRatio}>
        {lastReportDates &&
          lastReportDates.map((metric, index) => (
            <span key={index}>
              {index === 0 ? metric : `${metric.lastReport} ago`}
            </span>
          ))}
      </div>
      <div className={styles.debtRatio}>
        {estimated &&
          estimated.map((metric, index) => (
            <span key={index}>
              {index === 0 ? metric : `${Number(metric).toFixed(2)}$`}
            </span>
          ))}
      </div>
      <div className={styles.debtRatio}>
        {slippage &&
          slippage.map((metric, index) => (
            <span key={index}>
              {index === 0
                ? metric
                : Number.isNaN(metric)
                ? "-"
                : `${Number(metric).toFixed(2)}%`}
            </span>
          ))}
      </div>
      <div className={styles.debtRatio}>
        <div style={{ width: 160 }} />
        {vault.strategies.map((strategy) => {
          if (vault.title === "lyUSD") {
            return (
              <OmniChainHarvest
                vault={vault}
                strategy={strategy}
                key={strategy.address}
              />
            );
          }
          return <HarvestButton strategy={strategy} key={strategy.address} />;
        })}
      </div>
      <div className={styles.debtRatio}>
        <div style={{ width: 160 }} />
        {vault.strategies.map((strategy) => (
          <CloseStrategyButton
            strategy={strategy}
            vault={vault}
            key={strategy.address}
          />
        ))}
      </div>
      <div className={styles.debtRatio}>
        <div style={{ width: 160 }} />
        {vault.title === "lyUSD" &&
          vault.strategies.map((strategy) => (
            <AdjustPositionButton
              vault={vault}
              strategy={strategy}
              key={strategy.address}
            />
          ))}
      </div>
    </TableContainer>
  );
};
