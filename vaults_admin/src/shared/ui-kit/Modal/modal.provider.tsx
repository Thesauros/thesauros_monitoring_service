import { ReactNode, useState } from "react";
import ModalContext from "./modal.context";
import styles from "./modal.module.scss";
import classNames from "classnames";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const open = (content: ReactNode) => {
    setModalContent(content);
  };

  const close = () => {
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ open, close }}>
      <div
        className={classNames(
          styles.container,
          !!modalContent && styles.visible,
        )}
      >
        <div className={styles.modalWrapper}>
          <div
            className={styles.overlay}
            onClick={close}
            role="button"
            aria-label="overlay"
            tabIndex={0}
          />
          <div className={styles.content}>
            <div className={styles.modalContainer}>
              <button
                className={styles.closeButton}
                role="button"
                onClick={() => close()}
              >
                X
              </button>
              {modalContent}
            </div>
          </div>
        </div>
      </div>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
