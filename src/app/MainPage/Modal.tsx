import { ReactNode } from "react";
import ReactModal from "react-modal";
import { RxArrowLeft, RxCross1 } from "react-icons/rx";

export type PageInfo = {
  pageComponent: ReactNode;
  title: string;
  backText?: string;
  backCallback?: () => void;
};

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onBack?: () => void;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  closeModal,
  onBack,
  children,
}: ModalProps) {
  return (
    <ReactModal
      ariaHideApp={false}
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={{
        overlay: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        content: {
          width: "auto",
          position: "relative",
        },
      }}
    >
      <div className="centered-col w-[48rem]">
        <header className="flex flex-row justify-between w-full">
          <div>
            {onBack && (
              <div
                className="cursor-pointer flex flex-row items-center gap-1"
                onClick={onBack}
              >
                <RxArrowLeft />
              </div>
            )}
          </div>
          <div className="cursor-pointer" onClick={closeModal}>
            <RxCross1 />
          </div>
        </header>
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </ReactModal>
  );
}
