import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Productos from "./components/Productos";
import Cesta from "./components/Cesta";
import Producto from "./components/Producto";
import { QueryClient, QueryClientProvider } from "react-query";
import { createContext } from "react";

const queryClient = new QueryClient();
export const Context = createContext(null);

function App() {
  const [estado, setEstado] = useState({
    cesta: [],
  });

  return (
    <Context.Provider value={{ estado, setEstado }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}>
              <Route index element={<Productos />} />
              <Route path="*" element={<Productos />} />
              <Route path="productos" element={<Productos />} />
              <Route path="cesta" element={<Cesta />} />
              <Route path="productos/:id" element={<Producto />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Context.Provider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
