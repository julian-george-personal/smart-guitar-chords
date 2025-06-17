import Modal from "./Modal";

interface SongModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

export default function InfoModal({ isOpen, closeModal }: SongModalProps) {
    return <Modal isOpen={isOpen} closeModal={closeModal}>
        <div className="centered-col gap-1">
            <div className="text-sm">If you have any bugs, suggestions, or questions, feel free to email me at:</div> <div>julian@smartguitarchords.com</div>
        </div>
    </Modal>
}