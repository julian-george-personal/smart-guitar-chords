import { useState, useEffect } from "react";
import { useAccountData } from "../../context/account-context";
import SaveSongPage from "./SaveSongPage";
import Modal, { PageInfo } from "../Modal";
import ConfirmSongDeletionPage from "./ConfirmSongDeletionPage";

interface SongModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export enum SongModalPages {
  Save,
  ConfirmDeletion,
}

export default function SongModal({ isOpen, closeModal }: SongModalProps) {
  const { account } = useAccountData();
  const [activePage, setActivePage] = useState<SongModalPages>(
    SongModalPages.Save
  );
  const [activePageInfo, setActivePageInfo] = useState<PageInfo>();
  useEffect(() => {
    switch (activePage) {
      case SongModalPages.Save:
        setActivePageInfo({
          title: "Save Song",
          pageComponent: (
            <SaveSongPage
              onFinished={closeModal}
              onDelete={() => setActivePage(SongModalPages.ConfirmDeletion)}
            />
          ),
        });
        break;
      case SongModalPages.ConfirmDeletion:
        setActivePageInfo({
          title: "Confirm Deletion",
          pageComponent: (
            <ConfirmSongDeletionPage
              onFinished={() => setActivePage(SongModalPages.Save)}
            />
          ),
        });
    }
  }, [activePage, setActivePageInfo]);
  return (
    <>
      <Modal
        isOpen={isOpen}
        closeModal={closeModal}
        onBack={
          activePage == SongModalPages.ConfirmDeletion
            ? () => setActivePage(SongModalPages.Save)
            : undefined
        }
      >
        {account
          ? activePageInfo?.pageComponent
          : "You must have an account to save."}
      </Modal>
    </>
  );
}
