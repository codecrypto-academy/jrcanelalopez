import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useContext, useEffect } from "react";
import { AppContext } from "../App";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function Header() {
  const { state, setState } = useContext(AppContext);
  useEffect(() => {
    const eth = window.ethereum;
    if (eth) {
      eth
        .request({ method: "eth_requestAccounts" })
        .then((accounts: string[]) => {
          setState({ acc: accounts[0] });
        })
        .catch((error: any) => {
          console.error("Error requesting accounts:", error);
        });

      const handleAccountsChanged = (accounts: string[]) => {
        setState({ acc: accounts[0] });
      };

      eth.on("accountsChanged", handleAccountsChanged);

      return () => {
        eth.removeListener("accountsChanged", handleAccountsChanged);
      };
    } else {
      console.error("Ethereum provider not found");
    }
  }, [setState]);

  return (
    <div>
      <div className="flex gap-2 justify-center padding-top-4">
        <Link to="/home">
          <Button>Home</Button>
        </Link>
        <Link to="/faucet">
          <Button>Faucet</Button>
        </Link>
        <Link to="/balance">
          <Button>Balance</Button>
        </Link>
        <Link to="/transfer">
          <Button>Transfer</Button>
        </Link>
      </div>
      <div className="flex gap-2 justify-center padding-top-4">
        {state.acc ? (
          <p className="text-xl font-bold">{state.acc}</p>
        ) : (
          <p className="text-xl font-bold">No account</p>
        )}
      </div>
    </div>
  );
}
