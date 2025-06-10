import { Outlet, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

function getProductosButtonClass(isProductos: boolean) {
  return `btn ${isProductos ? "btn-primary" : "btn-secondary"}${
    !isProductos ? " ms-2" : ""
  }`;
}

function getCestaButtonClass(isCesta: boolean) {
  return `btn ${isCesta ? "btn-primary" : "btn-secondary"} ms-2`;
}
export default function Home() {
  return (
    <div className="container">
      {(() => {
        const location = useLocation();
        const isProductos = location.pathname === "/productos";
        const isCesta = location.pathname === "/cesta";
        return (
          <div className="text-end">
            <Link
              to="/productos"
              className={getProductosButtonClass(isProductos)}
            >
              Ver Productos
            </Link>
            <Link to="/cesta" className={getCestaButtonClass(isCesta)}>
              Ver Cesta
            </Link>
          </div>
        );
      })()}
      <div className="p-3 border rounded-3">
        <Outlet />
      </div>
    </div>
  );
}
