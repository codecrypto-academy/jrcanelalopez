import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { useContext } from "react";
import { useState } from "react";

function fetchProducto(id: string) {
  return () => {
    return fetch(`http://localhost:5555/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(JSON.stringify(data));
        return JSON.stringify(data);
      });
  };
}

export default function Producto() {
  const params = useParams();
  const { estado, setEstado } = useContext(Context);
  const [mensaje, setMensaje] = useState("");
  const cantidad =
    estado.cesta.find((i) => i.producto.ProductID == params.id)?.cantidad || 1;

  const { register, handleSubmit } = useForm({
    defaultValues: { Cantidad: cantidad },
  });

  const { data, error, isLoading } = useQuery(
    ["producto", params.id],
    fetchProducto(params.id)
  );

  function onSubmitData(submitData: { Cantidad: number }) {
    setEstado({
      ...estado,
      cesta: [
        ...estado.cesta.filter(
          (item: any) =>
            item.producto.ProductID !==
            (typeof data === "string"
              ? JSON.parse(data).ProductID
              : data.ProductID)
        ),
        {
          producto: typeof data === "string" ? JSON.parse(data) : data,
          cantidad: submitData.Cantidad,
          total:
            (typeof data === "string"
              ? JSON.parse(data).UnitPrice
              : data.UnitPrice) * submitData.Cantidad,
        },
      ],
    });
    setMensaje(
      "Se ha añadido correctamente a la cesta: " +
        submitData.Cantidad +
        " unidades"
    );
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading producto</div>;

  return (
    <div>
      <h1>Producto</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Campo</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            Object.entries(
              typeof data === "string" ? JSON.parse(data) : data
            ).map(([key, value]) => (
              <tr key={key}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {key}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : value?.toString()}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit(onSubmitData)}>
        <div className="form-group">
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            type="number"
            id="cantidad"
            className="form-control"
            min="1"
            {...register("Cantidad", { required: true })}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Añadir a la cesta
        </button>
      </form>
      {mensaje && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "6px",
            background: "#e6ffed",
            color: "#256029",
            border: "1px solid #b7eb8f",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            maxWidth: "400px",
          }}
          role="alert"
        >
          {mensaje}
        </div>
      )}
    </div>
  );
}
