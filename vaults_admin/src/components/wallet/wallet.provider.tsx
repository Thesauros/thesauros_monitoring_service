"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  DisclaimerComponent,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, arbitrum, optimism, base, polygon } from "wagmi/chains";
import { ledgerWallet } from "@rainbow-me/rainbowkit/wallets";
import { publicProvider } from "wagmi/providers/public";
import { ReactNode } from "react";

const { chains, publicClient } = configureChains(
  [mainnet, arbitrum, optimism, base, polygon],
  [publicProvider()],
);

const projectId = "73058f534eea480fba1e383193654be0";
const { wallets } = getDefaultWallets({
  appName: "Locus Finance | App",
  chains,
  projectId,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Popular",
    wallets: [ledgerWallet({ projectId, chains })],
  },
]);

const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const preparedChains = chains.map((chain) => {
  return chain;
});

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    Sign a transaction as confirmation of acknowledgment that you have read and
    agree with the Locus{" "}
    <Link href="https://docs.locus.finance/extras/terms-of-use">
      Terms of Service
    </Link>{" "}
    and{" "}
    <Link href="https://docs.locus.finance/extras/privacy-notice">
      Privacy Notice
    </Link>
  </Text>
);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider
        chains={preparedChains}
        modalSize="compact"
        appInfo={{ disclaimer: Disclaimer }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
