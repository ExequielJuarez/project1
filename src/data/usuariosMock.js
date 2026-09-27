// Usuarios de ejemplo para la maqueta.
// Reemplazar por el modelo de Sequelize cuando esté la base de datos.
// Las contraseñas se guardan siempre hasheadas con bcrypt.

const bcrypt = require("bcryptjs");

const usuarios = [
  {
    id: 1,
    nombre: "Cliente",
    apellido: "Demo",
    email: "demo@tienda.com",
    telefono: "11 5555 4444",
    password: bcrypt.hashSync("Demo1234", 10),
  },
];

// Hash de relleno para comparar cuando el email no existe
const HASH_FALSO = bcrypt.hashSync("no-es-una-clave-real", 10);

function buscarPorEmail(email) {
  return usuarios.find((u) => u.email === String(email).toLowerCase()) || null;
}

// Devuelve el usuario sin la contraseña si las credenciales son correctas
async function verificar(email, password) {
  const usuario = buscarPorEmail(email);
  // Si el email no existe igual comparamos contra un hash, para no delatar
  // por el tiempo de respuesta qué emails están registrados
  const hash = usuario ? usuario.password : HASH_FALSO;
  const ok = await bcrypt.compare(String(password), hash);
  if (!usuario || !ok) return null;

  const { password: _, ...publico } = usuario;
  return publico;
}

module.exports = { buscarPorEmail, verificar };
