import { PulseLoader } from "react-spinners";
import { useAccountData } from "../../state/account/account-hooks";

export default function AccountPage() {
  const { account, logout, isLoading } = useAccountData();
  if (account == null) return null;
  return (
    <div className="centered-col items-start gap-2">
      <div className="flex flex-row w-full justify-between">
        <div>Username: </div>
        <div>{account.username}</div>
      </div>
      <div className="flex flex-row w-full justify-between">
        <div>Email:</div>
        <div>{account.email}</div>
      </div>
      <button onClick={logout} className="standard-button">
        {isLoading ? <PulseLoader size={12} cssOverride={{ margin: 0 }} speedMultiplier={0.5} color="white" /> : "Log Out"}
      </button>
    </div>
  );
}
