import { Layout } from "@/shared/ui-kit/Layout/Layout";
import { WalletProvider } from "@/components/wallet/wallet.provider";
import ThemeProvider from "@/shared/theme/theme/theme.provider";
import "@/styles/globals.scss";
import "@/styles/themes.scss";
import ModalProvider from "@/shared/ui-kit/Modal/modal.provider";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <WalletProvider>
        <ModalProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ModalProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
