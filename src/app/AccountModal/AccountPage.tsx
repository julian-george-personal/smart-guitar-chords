import { useAccountData } from "../context/account-context";

export default function AccountPage() {
  const { account } = useAccountData();
  if (account == null) return null;
  return (
    <div className="centered-col">
      <div>Username: {account.username}</div>
      <div>Email: {account.email}</div>
      <button>Log Out</button>
    </div>
  );
}
