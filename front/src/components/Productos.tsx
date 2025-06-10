import { useQuery } from "react-query";
import { Link } from "react-router-dom";

function fetchProductos() {
  return fetch("http://localhost:5555/products")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return JSON.stringify(data);
    });
}

export default function Productos() {
  const { data, error, isLoading } = useQuery("productos", fetchProductos);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading productos</div>;

  return (
    <div>
      <h1>Productos</h1>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                textAlign: "left",
                fontSize: "1.1em",
              }}
            >
              Nombre
            </th>
          </tr>
        </thead>
        <tbody>
          {JSON.parse(data).map((producto: any, idx: number) => (
            <tr
              key={producto.ProductID}
              style={{
                backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                transition: "background 0.2s",
              }}
            >
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                <Link
                  to={`/productos/${producto.ProductID}`}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  {producto.ProductName}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
