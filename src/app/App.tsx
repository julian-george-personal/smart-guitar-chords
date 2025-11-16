import "react-toastify/dist/ReactToastify.css";
import { AccountProvider } from "./state/account/account-provider";
import MainPage from "./MainPage/MainPage";
import { SongProvider } from "./state/song/song-provider";

export default function App() {
  return (
    <AccountProvider>
      <SongProvider>
        <MainPage />
      </SongProvider>
    </AccountProvider>
  );
}
