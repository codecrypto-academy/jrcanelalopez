const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db.js");

app.listen(5555);
app.use(cors());

app.get("/ping", (req, res) => {
  res.send({ fecha: new Date().toISOString() });
});

app.get("/products", async (req, res) => {
  try {
    const results = await db.query("SELECT * FROM Products");
    res.send(results);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send({ error: "Database query failed" });
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const results = await db.query(
      "SELECT * FROM Products WHERE ProductID = ?",
      [productId]
    );
    if (results.length > 0) {
      res.send(results[0]);
    } else {
      res.status(404).send({ error: "Product not found" });
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).send({ error: "Database query failed" });
  }
});
