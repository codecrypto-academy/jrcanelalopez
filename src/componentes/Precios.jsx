import datos from "../datos.json";

function CardPrecios({ plan, precio, descripcion }) {
  return (
    <div className="card card-precios">
      <div className="card-header text-center">
        <h3 className="mb-0">{plan}</h3>
      </div>
      <div className="card-body">
        <p className="card-text">Precio: ${precio}/mes</p>
        <p className="card-text">{descripcion}</p>
        <button className="btn btn-outline-primary mt-3 w-100 d-block mx-auto">
          Elegir plan
        </button>
      </div>
    </div>
  );
}

export function Precios() {
  return (
    <div className="precios">
      <div className="d-flex justify-content-around">
        {Object.entries(datos.precios).map(
          ([plan, { precio, descripcion }]) => (
            <CardPrecios
              key={plan}
              plan={plan}
              precio={precio}
              descripcion={descripcion}
            />
          )
        )}
      </div>
    </div>
  );
}
