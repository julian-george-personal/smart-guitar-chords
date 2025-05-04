import { useState, useEffect } from "react";
import { useAccountData } from "../../context/account-context";
import SignUpPage from "./SignUpPage";
import LoginPage from "./LoginPage";
import RecoverPasswordPage from "./RecoverPasswordPage";
import AccountPage from "./AccountPage";
import SetNewPasswordPage from "./SetNewPasswordPage";
import Modal, { PageInfo } from "../Modal";

interface AccountModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export enum AccountModalPages {
  SignUp,
  Login,
  RecoverPassword,
  Account,
  SetNewPassword,
}

export default function AccountModal({
  isOpen,
  closeModal,
}: AccountModalProps) {
  const { account, recoverPasswordToken } = useAccountData();
  // TODO this page behavior can be generalized across modals
  const [activePage, setActivePage] = useState<AccountModalPages>(
    AccountModalPages.Login
  );
  const [activePageInfo, setActivePageInfo] = useState<PageInfo>();
  useEffect(() => {
    if (account != null) setActivePage(AccountModalPages.Account);
    else if (recoverPasswordToken != null)
      setActivePage(AccountModalPages.SetNewPassword);
    else setActivePage(AccountModalPages.Login);
  }, [account, recoverPasswordToken]);

  useEffect(() => {
    switch (activePage) {
      case AccountModalPages.Account:
        setActivePageInfo({
          pageComponent: <AccountPage />,
          title: "Account",
        });
        break;
      case AccountModalPages.Login:
        setActivePageInfo({
          pageComponent: (
            <LoginPage onFinished={closeModal} setActiveForm={setActivePage} />
          ),
          title: "Log In",
        });
        break;
      case AccountModalPages.SignUp:
        setActivePageInfo({
          pageComponent: <SignUpPage onFinished={closeModal} />,
          title: "Sign Up",
          backText: "Back to Login",
          backCallback: () => setActivePage(AccountModalPages.Login),
        });
        break;
      case AccountModalPages.RecoverPassword:
        setActivePageInfo({
          pageComponent: <RecoverPasswordPage onFinished={closeModal} />,
          title: "Recover Password",
          backText: "Back to Login",
          backCallback: () => setActivePage(AccountModalPages.Login),
        });
        break;
      case AccountModalPages.SetNewPassword:
        setActivePageInfo({
          pageComponent: <SetNewPasswordPage />,
          title: "Set new password",
        });
        break;
    }
  }, [activePage, setActivePageInfo]);
  if (!activePageInfo) return null;
  return (
    <>
      <Modal isOpen={isOpen} closeModal={closeModal}>
        <div className="text-xl w-full py-2">{activePageInfo.title}</div>
        {activePageInfo?.pageComponent}
      </Modal>
    </>
  );
}
