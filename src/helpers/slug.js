// "Bolsos materos" → "bolsos-materos" (para URLs y para comparar nombres sin
// importar mayúsculas ni acentos)
module.exports = function slug(texto, largo = 60) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, largo);
};
