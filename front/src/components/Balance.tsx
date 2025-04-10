import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";

export function Balance() {
  const { state } = useContext(AppContext);
  const [balance, setBalance] = useState<String>("");
  useEffect(() => {
    const eth = window.ethereum;
    if (eth) {
      eth
        .request({ method: "eth_getBalance", params: [state.acc, "latest"] })
        .then((balance: string) => {
          console.log("Balance:", balance);
          const balanceInEth = parseFloat(balance) / Math.pow(10, 18);
          setBalance(balanceInEth.toString());
        })
        .catch((error: any) => {
          console.error("Error requesting balance:", error);
        });
    }
  }, [state.acc]);
  return (
    <div>
      <h1> Balance</h1>
      <p>
        el address {state.acc} tiene balace: {balance}{" "}
      </p>
    </div>
  );
}
