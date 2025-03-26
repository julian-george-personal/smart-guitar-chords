import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AccountProvider } from "./context/account-context";
import MainPage from "./MainPage/MainPage";

export default function App() {
  return (
    <AccountProvider>
      <MainPage />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </AccountProvider>
  );
}
