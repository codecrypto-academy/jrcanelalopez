const mysql = require("mysql8");

var pool = mysql.createPool({
  host: "localhost",
  port: 2206,
  user: "root",
  password: "mysql",
  database: "northwind",
  connectionLimit: 10,
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
