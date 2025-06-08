import "react-toastify/dist/ReactToastify.css";
import { AccountProvider } from "./context/account-context";
import MainPage from "./MainPage/MainPage";
import { SongProvider } from "./context/song-context";

export default function App() {
  return (
    <AccountProvider>
      <SongProvider>
        <MainPage />
      </SongProvider>
    </AccountProvider>
  );
}
