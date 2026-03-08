import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
  title?: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  closeModal,
  onBack,
  title,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        >
          <Dialog.Content
            className="centered-col w-[48rem] max-w-[80vw] bg-white rounded p-4 relative"
            onEscapeKeyDown={closeModal}
            onPointerDownOutside={closeModal}
          >
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
            <div className="w-full max-w-lg py-8">
              {title && <div className="text-xl w-full py-1 font-medium">{title}</div>}
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
