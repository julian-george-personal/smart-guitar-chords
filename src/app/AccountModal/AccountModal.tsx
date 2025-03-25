import { useCallback, useState, ReactNode, useEffect } from "react";
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

type PageInfo = {
  pageComponent: ReactNode;
  title: string;
  backText?: string;
  backCallback?: () => void;
};

export default function AccountModal({
  isOpen,
  closeModal,
}: AccountModalProps) {
  const { account } = useAccountData();
  const [activeForm, setActiveForm] = useState<AccountModalForms>(
    AccountModalForms.Login
  );
  const [currentPageInfo, setCurrentPageInfo] = useState<PageInfo>();
  useEffect(() => {
    if (account != null) setActiveForm(AccountModalForms.Account);
    else setActiveForm(AccountModalForms.Login);
  }, [account]);

  useEffect(() => {
    switch (activeForm) {
      case AccountModalForms.Account:
        setCurrentPageInfo({
          pageComponent: <AccountPage />,
          title: "Account",
        });
        break;
      case AccountModalForms.Login:
        setCurrentPageInfo({
          pageComponent: (
            <LoginPage onFinished={closeModal} setActiveForm={setActiveForm} />
          ),
          title: "Log In",
        });
        break;
      case AccountModalForms.SignUp:
        setCurrentPageInfo({
          pageComponent: <SignUpPage onFinished={closeModal} />,
          title: "Sign Up",
          backText: "Back to Login",
          backCallback: () => setActiveForm(AccountModalForms.Login),
        });
        break;
      case AccountModalForms.RecoverPassword:
        setCurrentPageInfo({
          pageComponent: <RecoverPasswordPage />,
          title: "Recover Password",
          backText: "Back to Login",
          backCallback: () => setActiveForm(AccountModalForms.Login),
        });
        break;
    }
  }, [activeForm]);
  if (!currentPageInfo) return null;
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
            <div>
              {currentPageInfo.backCallback && (
                <div
                  className="cursor-pointer flex flex-row items-center gap-1"
                  onClick={currentPageInfo.backCallback}
                >
                  <RxArrowLeft />
                  {currentPageInfo.backText}
                </div>
              )}
            </div>
            <div className="cursor-pointer" onClick={closeModal}>
              <RxCross1 />
            </div>
          </header>

          <div className="w-full max-w-lg">
            <div className="text-xl w-full py-2">{currentPageInfo.title}</div>
            {currentPageInfo?.pageComponent}
          </div>
        </div>
      </Modal>
    </>
  );
}
