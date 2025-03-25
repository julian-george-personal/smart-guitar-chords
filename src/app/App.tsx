import { ToastContainer } from "react-toastify";
import { AccountProvider } from "./context/account-context";
import MainPage from "./MainPage/MainPage";

export default function App() {
  return (
    <AccountProvider>
      <MainPage />
      <ToastContainer />
    </AccountProvider>
  );
}
