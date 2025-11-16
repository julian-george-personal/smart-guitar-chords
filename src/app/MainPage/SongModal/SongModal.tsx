import { useState, useEffect, useCallback } from "react";
import { useAccountData } from "../../context/account-context";
import SaveSongPage from "./SaveSongPage";
import Modal, { PageInfo } from "../Modal";
import ConfirmSongDeletionPage from "./ConfirmSongDeletionPage";
import { SongModalPages } from "./SongModalPages";

interface SongModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export default function SongModal({ isOpen, closeModal }: SongModalProps) {
  const { account } = useAccountData();
  const [activePage, setActivePage] = useState<SongModalPages>(
    SongModalPages.Save
  );
  const [activePageInfo, setActivePageInfo] = useState<PageInfo>();
  const onFinished = useCallback(() => {
    setActivePage(SongModalPages.Save);
    closeModal();
  }, [setActivePage, closeModal]);
  useEffect(() => {
    switch (activePage) {
      case SongModalPages.Save:
        setActivePageInfo({
          title: "Save Song",
          pageComponent: (
            <SaveSongPage
              onFinished={onFinished}
              onDelete={() => setActivePage(SongModalPages.ConfirmDeletion)}
            />
          ),
        });
        break;
      case SongModalPages.ConfirmDeletion:
        setActivePageInfo({
          title: "Confirm Deletion",
          pageComponent: <ConfirmSongDeletionPage onFinished={onFinished} />,
        });
        break;
    }
  }, [activePage, setActivePageInfo, onFinished]);
  return (
    <>
      <Modal
        isOpen={isOpen}
        closeModal={onFinished}
        title={activePageInfo?.title}
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
