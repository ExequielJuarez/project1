// Subida de la imagen de un producto con multer.
// Guarda en public/img/productos con un nombre único; solo JPG, PNG o WEBP de hasta 2 MB.
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const TIPOS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const subir = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../public/img/productos"),
    filename: (req, file, cb) => cb(null, `producto-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${TIPOS[file.mimetype]}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (TIPOS[file.mimetype]) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "imagen"));
  },
}).single("imagen");

// Envuelve multer para que un error de archivo se muestre como error del formulario
module.exports = (req, res, next) => {
  subir(req, res, (err) => {
    if (err) {
      req.errorImagen =
        err.code === "LIMIT_FILE_SIZE" ? "La imagen no puede pesar más de 2 MB" : "La imagen tiene que ser JPG, PNG o WEBP";
    }
    next();
  });
};
