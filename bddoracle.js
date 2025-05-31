const oracledb = require("oracledb");

async function run() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: "oracle",
      password: "oracle",
      connectString: "localhost/XEPDB1",
    });

    console.log("Conexión exitosa a Oracle Database");

    // Ejemplo de consulta
    const result = await connection.execute(`SELECT sysdate FROM dual`);
    console.log(result.rows);
  } catch (err) {
    console.error("Error al conectar a Oracle:", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar la conexión:", err);
      }
    }
  }
}

run();
