import Modal from "react-modal";
import { RxCross1, RxArrowLeft } from "react-icons/rx";
import { useAccountData } from "../../context/account-context";
import SaveSongPage from "./SongTitlePage";

interface SongModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export default function SongModal({ isOpen, closeModal }: SongModalProps) {
  const { account } = useAccountData();
  return (
    <>
      {/*@ts-ignore */}
      <Modal
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
            <div></div>
            <div className="cursor-pointer" onClick={closeModal}>
              <RxCross1 />
            </div>
          </header>
          <div className="w-full max-w-lg">
            {account ? (
              <SaveSongPage onFinished={closeModal} />
            ) : (
              "You must have an account to save."
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
