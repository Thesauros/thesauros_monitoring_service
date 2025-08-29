import { TVault } from "@/pages/vaults";
import { TableContainer } from "@/shared/ui-kit/TableContainer";
import { useWithdrawEpochs } from "@/shared/utils/vaultsValues/useWithdrawEpochs";
import styles from "./PendingWithdrawals.module.scss";

export const PendingWithdrawals = ({ vault }: { vault: TVault }) => {
  const data = useWithdrawEpochs(vault);

  if (data === null || data?.pendingList?.length === 0) {
    return null;
  }

  return (
    <TableContainer>
      <h4>Pending List</h4>
      <div className={styles.main}>
        {data?.pendingList?.map((el, index) => (
          <div className={styles.pendingListItem} key={`${el}_${index}`}>
            <span>{el.author}</span>
            <span>{Number(el.value).toFixed(2)} USDC</span>
          </div>
        ))}
      </div>
    </TableContainer>
  );
};
