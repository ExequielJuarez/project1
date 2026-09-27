require("dotenv").config();
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");

const app = express();

const indexRouter = require("./routes/index.Routes");
const adminRouter = require("./routes/admin.Routes");
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
// $4,7 M · $865 mil · $950 (para tarjetas y ejes del panel)
app.locals.formatoCompacto = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `$${(n / 1e6).toLocaleString("es-AR", { maximumFractionDigits: 1 })} M`;
  if (abs >= 1e3) return `$${Math.round(n / 1e3).toLocaleString("es-AR")} mil`;
  return `$${Math.round(n).toLocaleString("es-AR")}`;
};
app.locals.formatoPorcentaje = (n) => `${(n * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
app.locals.formatoFecha = (fecha, conHora = false) =>
  new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    ...(conHora ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use((req, res, next) => {
  res.locals.usuarioLocal = req.session.usuarioLogueado || null;
  res.locals.cantidadCarrito = carrito.cantidadTotal(req.session);

  // Mensaje de un solo uso (se muestra como aviso y se borra)
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use("/admin", adminRouter);
app.use("/", indexRouter);

app.listen(puerto, () => {
  console.log(`🚀 Servidor Express corriendo en el puerto ${puerto}`);
});
