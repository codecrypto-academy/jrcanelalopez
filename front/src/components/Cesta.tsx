import { useContext, useEffect } from "react";
import { Context } from "../main";
import { useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";

export default function Cesta() {
  const { estado, setEstado } = useContext(Context);
  const [cuenta, setCuenta] = useState(null);
  const [txOk, setTxOk] = useState(null);
  const [txKo, setTxKo] = useState(null);
  useEffect(() => {
    window.ethereum &&
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          setCuenta(accounts[0]);
          window.ethereum.on("accountsChanged", (accounts) => {
            setCuenta(accounts[0]);
          });
        });
  }, []);
  function pagar() {
    const cuentaComercio = "0x6f1c2086815D9b65D161816067139b118711CE1E";
    const txParams = {
      to: cuentaComercio, // Dirección del comercio
      from: cuenta, // La cuenta que paga la transacción
      value: ethers.toBeHex(ethers.parseEther("1" /*total.toString()*/)), // Convertir total a wei y hex
    };
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.getSigner().then((signer) => {
      signer
        .sendTransaction(txParams)
        .then((tx) => {
          setTxOk(tx.hash);
          setTxKo(null);
        })
        .catch((error: any) => {
          setTxKo(error.message || "Error en la transacción");
          setTxOk(null);
        });
    });
    console.log("Transaction Parameters:", txParams);
  }
  const total = estado.cesta.reduce(
    (acc: number, item: any) => acc + item.total,
    0
  );
  return (
    <div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {estado.cesta && estado.cesta.length > 0 ? (
            estado.cesta.map((item: any, idx: number) => (
              <tr key={idx}>
                <td>
                  <Link to={`/productos/${item.producto.ProductID}`}>
                    {item.producto.ProductName}
                  </Link>
                </td>
                <td>{item.cantidad}</td>
                <td>{item.producto.UnitPrice}</td>
                <td>{item.total}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>La cesta está vacía</td>
            </tr>
          )}
        </tbody>
      </table>
      <h3>Total: {total.toFixed(2)}</h3>
      <h4>Cuenta: {cuenta}</h4>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <button className="btn btn-primary" onClick={() => pagar()}>
          Pagar
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setEstado({ ...estado, cesta: [] })}
        >
          Vaciar Cesta
        </button>
      </div>
      {txOk ? (
        <div className="alert alert-success mt-3">
          Transacción realizada correctamente. Hash: {txOk}
        </div>
      ) : txKo ? (
        <div className="alert alert-danger mt-3">
          Error en la transacción: {txKo}
        </div>
      ) : null}
    </div>
  );
}
