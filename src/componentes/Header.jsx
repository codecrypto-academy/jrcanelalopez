import { Logo } from "./Logo.jsx";
import datos from "../datos.json";

export function Header() {
  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-primary text-white">
      <div className="d-flex align-items-center">
        <Logo />
        <h1 className="ms-2 mb-0">{datos.header.nombre}</h1>
      </div>
      <nav>
        <ul className="d-flex mb-0" style={{ listStyle: "none", gap: "1rem" }}>
          {datos.header.links.map((link, index) => (
            <li key={index}>
              <a href={link.url} className="text-white text-decoration-none">
                {link.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
