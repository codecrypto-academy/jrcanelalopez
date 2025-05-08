import { useQuery } from "react-query";
import { fetchCurrentBlockNumber } from "./api";

export function UltimoBloque() {
  const { isLoading, isError, data } = useQuery(
    "ultimoBloque",
    fetchCurrentBlockNumber
  );

  if (isLoading) {
    return <div>Cargando...</div>;
  }
  if (isError) {
    return <div>Error al cargar el último bloque</div>;
  }

  return <div>Último Bloque: {data}</div>;
}
