import { createContext, ReactNode } from "react";

type TModalState = {
  open: (content: ReactNode) => void;
  close: () => void;
};

const ModalContext = createContext<TModalState | null>(null);
export default ModalContext;
