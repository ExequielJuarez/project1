// Favoritos: si el usuario inició sesión se guardan en su cuenta,
// si no, en la sesión (y se pasan a la cuenta cuando inicia sesión).

const usuarios = require("./usuariosMock");
const { productos } = require("./productosMock");

// Lista donde se guardan los favoritos de este visitante.
// Solo se crea al guardar el primero (leer no crea una sesión nueva).
function lista(session, crear = false) {
  const u = session.usuarioLogueado;
  const cuenta = u && usuarios.buscarPorId(u.id);
  if (cuenta) return cuenta.favoritos;
  if (!session.favoritos && crear) session.favoritos = [];
  return session.favoritos || [];
}

// Ids que siguen existiendo en el catálogo (un producto borrado desaparece solo)
function ids(session) {
  const existentes = new Set(productos.map((p) => p.id));
  return lista(session).filter((id) => existentes.has(id));
}

function alternar(session, id) {
  const numero = Number(id);
  if (!productos.some((p) => p.id === numero)) return null;
  const favs = lista(session, true);
  const i = favs.indexOf(numero);
  if (i === -1) favs.unshift(numero);
  else favs.splice(i, 1);
  return { activo: i === -1, cantidad: ids(session).length };
}

function vaciar(session) {
  lista(session).length = 0;
}

// Al iniciar sesión: suma a la cuenta los favoritos que tenía como invitado
function pasarACuenta(session, usuarioId) {
  const cuenta = usuarios.buscarPorId(usuarioId);
  if (!cuenta || !session.favoritos?.length) return;
  session.favoritos.forEach((id) => !cuenta.favoritos.includes(id) && cuenta.favoritos.push(id));
  session.favoritos = [];
}

function productosFavoritos(session) {
  return ids(session)
    .map((id) => productos.find((p) => p.id === id))
    .filter(Boolean);
}

module.exports = { ids, alternar, vaciar, pasarACuenta, productosFavoritos };
