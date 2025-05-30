import datos from "../datos.json";

function Section({ grupo, enlaces }) {
  return (
    <div>
      <strong>{grupo}</strong>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {enlaces.map((enlace, idx) => (
          <li key={idx}>
            <a href={enlace.url} className="text-white text-decoration-none">
              {enlace.texto}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="d-flex justify-content-between align-items-center p-3 bg-secondary text-white">
        <div>
          <p className="mb-0">© {new Date().getFullYear()} Diseño Web 2.5</p>
        </div>
        <nav className="d-flex" style={{ gap: "2rem" }}>
          {datos.footer.links.map((grupo, idx) => (
            <Section key={idx} grupo={grupo.grupo} enlaces={grupo.enlaces} />
          ))}
        </nav>
      </div>
    </footer>
  );
}
