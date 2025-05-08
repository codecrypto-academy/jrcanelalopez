import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./Home";
import { Balance } from "./Balance";
import { Bloque } from "./Bloque";
import { Transaccion } from "./Transaccion";
import { QueryClientProvider, QueryClient } from "react-query";
import { UltimoBloque } from "./UltimoBloque";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="balance/:address" element={<Balance />} />
          <Route path="bloque/:bloque" element={<Bloque />} />
          <Route path="tx/:tx" element={<Transaccion />} />
          <Route path="ultimoBloque" element={<UltimoBloque />} />
          <Route path="*" element={<h1>No encontrado</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
