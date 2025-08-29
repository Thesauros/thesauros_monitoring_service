import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./Header.module.scss";
import { NavMenu } from "./NavMenu/NavMenu";
import { useFeeData } from "wagmi";
import { getPrice } from "@/shared/api/endpoints/getPrice";
import { useEffect, useState } from "react";
import { ThemeToggleButton } from "../../ThemeToggleButton";

export const Header = () => {
  const { data } = useFeeData({ chainId: 1, formatUnits: "gwei" });
  const [coinPrice, setCoinPrice] = useState(0);

  useEffect(() => {
    getPrice("WETH").then((res) => setCoinPrice(res));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.leftBlock}>
        <NavMenu />
        {coinPrice && data && (
          <div className={styles.ethBlock}>
            <p>ETH Price: {coinPrice.toFixed(2)}$</p>
            <p>Fee: {Number(data?.formatted.gasPrice).toFixed(2)} gwei</p>
          </div>
        )}
      </div>

      <div className={styles.rightBlock}>
        <ConnectButton accountStatus="address" showBalance={false} />
        <ThemeToggleButton />
      </div>
    </div>
  );
};
