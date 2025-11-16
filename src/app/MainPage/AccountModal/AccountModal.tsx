import { useState, useEffect, useCallback } from "react";
import { useAccountData } from "../../context/account-context";
import SignUpPage from "./SignUpPage";
import LoginPage from "./LoginPage";
import RecoverPasswordPage from "./RecoverPasswordPage";
import AccountPage from "./AccountPage";
import SetNewPasswordPage from "./SetNewPasswordPage";
import Modal, { PageInfo } from "../Modal";
import { AccountModalPages } from "./AccountModalPages";

interface AccountModalProps {
  isOpen: boolean;
  closeModal: () => void;
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

  const onFinished = useCallback(() => {
    if (!account) setActivePage(AccountModalPages.Login);
    closeModal();
  }, [setActivePage, closeModal, account]);

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
            <LoginPage
              onFinished={onFinished}
              onForgotPassword={() =>
                setActivePage(AccountModalPages.RecoverPassword)
              }
              onSignUp={() => setActivePage(AccountModalPages.SignUp)}
            />
          ),
          title: "Log In",
        });
        break;
      case AccountModalPages.SignUp:
        setActivePageInfo({
          pageComponent: <SignUpPage onFinished={onFinished} />,
          title: "Sign Up",
          backText: "Back to Login",
          backCallback: () => setActivePage(AccountModalPages.Login),
        });
        break;
      case AccountModalPages.RecoverPassword:
        setActivePageInfo({
          pageComponent: <RecoverPasswordPage onFinished={onFinished} />,
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
      <Modal
        isOpen={isOpen}
        closeModal={onFinished}
        title={activePageInfo.title}
      >
        {activePageInfo?.pageComponent}
      </Modal>
    </>
  );
}
