// ==========================================================
// PÁGINAS LEGALES — Arma el índice "En esta página" con los
// títulos de cada sección (usa base.js)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$ } = window.Tienda;

  const titulos = $$("#textoLegal h2[id]");
  const indice = $("#indiceLegal");
  if (titulos.length < 3) return;

  const lista = $("ul", indice);
  titulos.forEach((h) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.append(a);
    lista.append(li);
  });
  indice.hidden = false;
});
