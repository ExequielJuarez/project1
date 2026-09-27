require("dotenv").config();
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");

const app = express();

const indexRouter = require("./routes/index.Routes");
const carrito = require("./data/carrito");

const puerto = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "Secreto_FichaTecnica_123",
    resave: false,
    saveUninitialized: false,
  }),
);

// Helpers disponibles en todas las vistas
app.locals.formatoPrecio = (n) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
app.locals.descuentoTransferencia = 0.1;

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use((req, res, next) => {
  res.locals.usuarioLocal = req.session.usuarioLogueado || null;
  res.locals.cantidadCarrito = carrito.cantidadTotal(req.session);
  next();
});

app.use("/", indexRouter);

app.listen(puerto, () => {
  console.log(`🚀 Servidor Express corriendo en el puerto ${puerto}`);
});
