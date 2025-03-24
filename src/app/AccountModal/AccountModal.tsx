import { useCallback, useState } from "react";
import Modal from "react-modal";
import { RxCross1, RxArrowLeft } from "react-icons/rx";
import { useAccountData } from "../context/account-context";
import SignUpPage from "./SignUpPage";
import LoginPage from "./LoginPage";
import RecoverPasswordPage from "./RecoverPasswordPage";
import AccountPage from "./AccountPage";

interface AccountModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export enum AccountModalForms {
  SignUp,
  Login,
  RecoverPassword,
  Account,
}

export default function AccountModal({
  isOpen,
  closeModal,
}: AccountModalProps) {
  const { account } = useAccountData();
  const [activeForm, setActiveForm] = useState<AccountModalForms>(
    AccountModalForms.Login
  );
  const getPage = useCallback(() => {
    if (account != null) return <AccountPage />;
    switch (activeForm) {
      case AccountModalForms.Login:
        return (
          <LoginPage onFinished={closeModal} setActiveForm={setActiveForm} />
        );
      case AccountModalForms.SignUp:
        return <SignUpPage onFinished={closeModal} />;
      case AccountModalForms.RecoverPassword:
        return <RecoverPasswordPage />;
    }
  }, [activeForm, account]);

  const getBackInfo = useCallback(() => {
    switch (activeForm) {
      case AccountModalForms.Account:
      case AccountModalForms.Login:
        return null;
      case AccountModalForms.RecoverPassword:
      case AccountModalForms.SignUp:
        return {
          text: "Back to Login",
          callback: () => setActiveForm(AccountModalForms.Login),
        };
    }
  }, [activeForm]);
  return (
    <>
      {/*@ts-ignore */}
      <Modal isOpen={isOpen} onRequestClose={closeModal}>
        <div className="centered-col w-full">
          <header className="flex flex-row justify-between w-full">
            <div>
              {getBackInfo() ? (
                <div
                  className="cursor-pointer flex flex-row items-center gap-1"
                  onClick={getBackInfo()?.callback}
                >
                  <RxArrowLeft />
                  {getBackInfo()?.text}
                </div>
              ) : null}
            </div>
            <div className="cursor-pointer" onClick={closeModal}>
              <RxCross1 />
            </div>
          </header>
          <div className="w-full max-w-lg">{getPage()}</div>
        </div>
      </Modal>
    </>
  );
}
