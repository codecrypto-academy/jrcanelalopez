import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { fetchBalance } from "./api";

export function Balance() {
  const params = useParams();
  const { isLoading, isError, data } = useQuery(
    ["balance", params.address],
    fetchBalance
  );

  if (isLoading) {
    return <div>Cargando...</div>;
  }
  if (isError) {
    return <div>Error al cargar el balance</div>;
  }

  return (
    <div>
      Balance de {params.address}: <br /> {data}
    </div>
  );
}
