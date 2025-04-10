"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var port = 3000;
// Middleware para parsear JSON
app.use(express.json());
// Ruta de ejemplo
app.get('/', function (req, res) {
    res.send('Hello, world!');
});
// Iniciar el servidor
app.listen(port, function () {
    console.log("Server is running on http://localhost:".concat(port));
});
