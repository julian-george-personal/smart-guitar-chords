import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AccountProvider } from "./context/account-context";
import MainPage from "./MainPage/MainPage";
import { SongProvider } from "./context/song-context";

export default function App() {
  return (
    <AccountProvider>
      <SongProvider>
        <MainPage />
        <ToastContainer position="bottom-right" autoClose={2000} />
      </SongProvider>
    </AccountProvider>
  );
}
