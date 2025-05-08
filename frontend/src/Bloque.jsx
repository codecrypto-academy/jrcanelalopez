import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { fetchBloque } from "./api";

export function Bloque() {
  const params = useParams();
  const { isLoading, isError, data } = useQuery(
    ["bloque", params.bloque],
    fetchBloque
  );

  if (isLoading) {
    return <div>Cargando...</div>;
  }
  if (isError) {
    return <div>Error al cargar el bloque</div>;
  }

  return (
    <pre>
      bloque {params.bloque}
      <br />
      {JSON.stringify(data, null, 3)}
    </pre>
  );
}
