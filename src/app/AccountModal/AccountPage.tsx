import { useContext } from "react";
import { AccountContext } from "../context/account-context";

export default function AccountPage() {
  const { account } = useContext(AccountContext);
  if (account == null) return null;
  return (
    <div className="centered-col">
      <div>Username: {account.username}</div>
      <div>Email: {account.email}</div>
      <button>Log Out</button>
    </div>
  );
}
