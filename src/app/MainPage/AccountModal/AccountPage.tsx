import { useAccountData } from "../../context/account-context";

export default function AccountPage() {
  const { account, logout } = useAccountData();
  if (account == null) return null;
  return (
    <div className="centered-col">
      <div>Username: {account.username}</div>
      <div>Email: {account.email}</div>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
