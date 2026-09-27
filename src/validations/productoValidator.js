const { body } = require("express-validator");
const { categorias, colores } = require("../data/productosMock");

module.exports = [
  body("nombre").trim().isLength({ min: 3, max: 90 }).withMessage("El nombre debe tener entre 3 y 90 caracteres"),
  body("categoria").isIn(categorias).withMessage("Elegí una categoría"),
  body("color").isIn(colores.map((c) => c.valor)).withMessage("Elegí un color"),
  body("precio").isFloat({ min: 1 }).withMessage("Ingresá un precio mayor a 0"),
  body("costo")
    .isFloat({ min: 0 })
    .withMessage("Ingresá el costo (0 o más)")
    .bail()
    .custom((costo, { req }) => Number(costo) <= Number(req.body.precio))
    .withMessage("El costo no puede ser mayor que el precio"),
  body("stock").isInt({ min: 0, max: 99999 }).withMessage("El stock debe ser un número entero (0 o más)"),
  body("etiqueta").optional({ values: "falsy" }).trim().isLength({ max: 24 }).withMessage("Máximo 24 caracteres"),
];
