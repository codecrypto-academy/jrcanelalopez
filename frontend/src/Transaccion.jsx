import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { fetchTransaction } from "./api";

export function Transaccion() {
  const params = useParams();
  const { isLoading, isError, data } = useQuery(
    ["tx", params.tx],
    fetchTransaction
  );

  if (isLoading) {
    return <div>Cargando...</div>;
  }
  if (isError) {
    return <div>Error al cargar la transacción</div>;
  }

  return (
    <pre>
      tx {params.tx}
      <br />
      {JSON.stringify(data, null, 3)}
    </pre>
  );
}
