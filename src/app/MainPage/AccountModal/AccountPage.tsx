import { useAccountData } from "../../context/account-context";

export default function AccountPage() {
  const { account, logout } = useAccountData();
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
        Log Out
      </button>
    </div>
  );
}
