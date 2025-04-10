import { AppContext } from "../App";
import { useContext, useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export function Faucet() {
  const { state } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState(Object);

  async function handleClick() {
    const response = await fetch(`http://localhost:3000/faucet/${state.acc}/1`);
    setLoading(true);
    const data = await response.json();
    setTx(data);
    setLoading(false);
  }

  return (
    <div className="splace-y-4 flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Faucet</h1>
      <p> Cuenta {state.acc}</p>
      <Button
        onClick={async () => {
          handleClick();
        }}
      >
        Solicitar
      </Button>
      {loading && <Loader2 className="animate-spin" />}
      {tx && <pre>Transaccion: {JSON.stringify(tx, null, 4)}</pre>}
    </div>
  );
}
