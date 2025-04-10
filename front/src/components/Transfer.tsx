import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { ethers } from "ethers";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function Transfer() {
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      fromAddress: "0x6f1c2086815d9b65d161816067139b118711ce1e",
      toAddress: "0xda4f8c00e7fde00b029e7ddaf2aab85590e64b34",
      amount: "1",
    },
  });
  const onSubmit = async (data: any) => {
    console.log(data);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts.includes(data.fromAddress)) {
      const error =
        "Invalid account: fromAddress must be one of the connected accounts: " +
        accounts;
      setTx({ error });
      throw new Error(error);
    }
    const signer = await provider.getSigner();
    setLoading(true);
    signer
      .sendTransaction({
        to: data.toAddress,
        value: ethers.parseEther(data.amount.toString()),
      })
      .then((tx: any) => {
        console.log("Transaction sent:", tx);
        setTx(tx);
      })
      .catch((error: any) => {
        console.error("Transaction failed:", error);
        if (error.code === "INSUFFICIENT_FUNDS") {
          setTx({ error: "Insufficient funds for the transaction." });
        } else {
          setTx({ error: error.message });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="splace-y-4 flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-bold"> Transfer</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="fromAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>fromAddress</FormLabel>
                <FormControl>
                  <Input placeholder="0xc3d344646" {...field} />
                </FormControl>
                <FormDescription>Origen de la transacción</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>toAddress</FormLabel>
                <FormControl>
                  <Input placeholder="0xc3d344646" {...field} />
                </FormControl>
                <FormDescription>Cuenta de destino</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input placeholder="0.0" {...field} />
                </FormControl>
                <FormDescription>Cantidad</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Transfer</Button>
          {loading && <Loader2 className="animate-spin" />}
        </form>
      </Form>
      {tx && <pre>Transaccion: {JSON.stringify(tx, null, 4)}</pre>}
    </div>
  );
}
