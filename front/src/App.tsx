import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { Faucet } from "./components/Faucet";
import { Transfer } from "./components/Transfer";
import { Balance } from "./components/Balance";
import { createContext, useState } from "react";

export function Dashboard() {
  return (
    <div className="container">
      <Header />
      <h1 className="text-xl font-bold">Dashboard</h1>
      <Outlet />
    </div>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Dashboard />,
      children: [
        { path: "home", element: <Home /> },
        { path: "faucet", element: <Faucet /> },
        { path: "balance", element: <Balance /> },
        { path: "transfer", element: <Transfer /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

export const AppContext = createContext({} as any);

function App() {
  const [state, setState] = useState({ acc: "" } as any);
  return (
    <AppContext.Provider value={{ state, setState }}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </AppContext.Provider>
  );
}

export default App;
