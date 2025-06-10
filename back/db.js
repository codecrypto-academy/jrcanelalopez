const mysql = require("mysql8");

var pool = mysql.createPool({
  host: "localhost",
  port: 2206,
  user: "root",
  password: "mysql",
  database: "northwind",
});

function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  query,
};
