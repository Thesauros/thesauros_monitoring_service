import { ReactNode } from "react";
import { Header } from "./Header/Header";
import { PageContainer } from "./PageContainer/PageContainer";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Header />
      <PageContainer>{children}</PageContainer>
    </div>
  );
};
