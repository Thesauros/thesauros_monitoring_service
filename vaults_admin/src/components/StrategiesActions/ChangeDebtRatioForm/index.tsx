import { useState } from "react";
import styles from "./ChangeDebtRatioForm.module.scss";
import { Button } from "../../../shared/ui-kit/Button/Button";
import BaseVault from "../../../../BaseVault.json";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { TAddress } from "../HarvestButton";
import { useModal } from "@/shared/ui-kit/Modal";

export const ChangeDebtRatioForm = ({
  address,
  vaultAddress,
  name,
}: {
  address: TAddress;
  vaultAddress: TAddress;
  name: string;
}) => {
  const [debtRatio, setDebtRatio] = useState<string | null>(null);

  const handleChange = (event: { target: { value: string } }) => {
    const value = event.target.value;

    if (value.length > 0) {
      const preparedValue = `${Number(value) * 100}`;
      setDebtRatio(preparedValue);
    } else {
      setDebtRatio(null);
    }
  };

  const { config } = usePrepareContractWrite({
    address: vaultAddress,
    abi: BaseVault,
    functionName: "updateStrategyDebtRatio",
    args: [address, debtRatio],
  });

  const { write } = useContractWrite(config);
  const { open, close } = useModal();

  return (
    <div className={styles.addressBlock} id={address} key={address}>
      <span>{name}</span>
      <input
        type="number"
        className={styles.inputContainer}
        onChange={handleChange}
      />
      <Button
        onClick={() => {
          open(
            <div className={styles.infoModal}>
              <p>After the debt ratio changes you should harvest</p>
              <Button
                onClick={() => {
                  write?.();
                  close();
                }}
              >
                Okay
              </Button>
            </div>,
          );
        }}
      >
        Change
      </Button>
    </div>
  );
};
