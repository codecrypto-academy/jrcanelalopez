const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5437,
  user: "postgres",
  password: "postgres",
  database: "postgres",
  max: 10, // Maximum number of clients in the pool
});

function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

query("SELECT * FROM Customers")
  .then((results) => {
    console.log("Query results:", results);
  })
  .catch((error) => {
    console.error("Error in query:", error);
  });
