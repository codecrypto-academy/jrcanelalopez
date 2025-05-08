import { Outlet, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

export function Home() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    console.log(data);
    if (data.data.length == 66) {
      navigate(`tx/${data.data}`);
    } else if (data.data.length == 42) {
      navigate(`balance/${data.data}`);
    } else if (/^\d+$/.test(data.data)) {
      navigate(`bloque/${data.data}`);
    }
  };
  const onError = (errors) => {
    console.log(errors);
  };
  const goToUltimoBloque = () => {
    navigate("ultimoBloque");
  };
  return (
    <div className="container">
      <div className="centered-content">
        <h1 className="text-center">Home</h1>
        <h2 className="text-center">Welcome to the Web 2.5 Explorer</h2>
        <form
          className="d-flex justify-content-center gap-2"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <input
            {...register("data")}
            size={70}
            placeholder="Address/Tx/Block"
          />
          <button className="btn btn-primary">Consultar</button>
        </form>
        <button className="btn btn-secondary mt-3" onClick={goToUltimoBloque}>
          Ir al Último Bloque
        </button>
        <div className="mt-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
