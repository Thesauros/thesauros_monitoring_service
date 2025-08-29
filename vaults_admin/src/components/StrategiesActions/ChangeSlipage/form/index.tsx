import { useState } from "react";
import styles from "./SlipageForm.module.scss";

import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { TAddress } from "../../HarvestButton";
import { Button } from "@/shared/ui-kit/Button/Button";
import OmniChainVaultAbi from "@/../OmniChainVaultAbi.json";
import BaseStrategyAbi from "@/../BaseStrategy.json";
import { TVault } from "@/pages/vaults";

export const ChangeSlippageForm = ({
  address,
  vault,
  name,
}: {
  address: TAddress;
  vault: TVault;
  name: string;
}) => {
  const [slippage, setSlippage] = useState<string | null>(null);
  const abi = vault.title === "lyUSD" ? OmniChainVaultAbi : BaseStrategyAbi;

  const handleChange = (event: { target: { value: string } }) => {
    const value = event.target.value;

    if (value.length > 0) {
      const preparedValue = `${Number(value) * 100}`;
      setSlippage(preparedValue);
    } else {
      setSlippage(null);
    }
  };

  const { config } = usePrepareContractWrite({
    address: vault.address,
    abi: abi,
    functionName: "updateStrategyDebtRatio",
    args: [address, slippage],
  });

  const { write } = useContractWrite(config);

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
          write?.();
        }}
      >
        Change
      </Button>
    </div>
  );
};
