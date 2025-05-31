const sql = require("mssql");

// Configuración de la conexión
const config = {
  user: "sa",
  password: "my-secret-password", // Cambia esto por tu contraseña
  server: "localhost", // o la IP/hostname de tu SQL Server
  database: "northwind",
  options: {
    encrypt: false, // Cambia a true si usas Azure
    trustServerCertificate: true, // Solo para desarrollo
  },
  pool: {
    max: 10, // Número máximo de conexiones en el pool
    min: 0, // Número mínimo de conexiones en el pool
    idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar una conexión inactiva
  },
};

async function main() {
  try {
    // Conectar a la base de datos
    await sql.connect(config);

    // Ejecutar la consulta
    const result = await sql.query("SELECT * FROM Customers");

    // Mostrar los resultados
    console.log(result.recordset);
  } catch (err) {
    console.error("Error al conectar o consultar:", err);
  } finally {
    // Cerrar la conexión
    await sql.close();
  }
}

main();
