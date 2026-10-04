// ==========================================================
// ADMIN · COMPROBANTE — Imprimir y elegir el tamaño
// (hoja A4 o ticket de 80 mm). El tamaño elegido se recuerda.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const comprobante = document.getElementById("comprobante");
  const opciones = document.querySelectorAll('input[name="formato"]');

  // El tamaño de la hoja se define con @page, que no se puede cambiar con una clase
  const pagina = document.createElement("style");
  document.head.append(pagina);

  function aplicar(formato) {
    const ticket = formato === "ticket";
    comprobante.classList.toggle("comprobante--ticket", ticket);
    pagina.textContent = ticket
      ? "@page { size: 80mm auto; margin: 4mm; }"
      : "@page { size: A4; margin: 14mm; }";
    try {
      localStorage.setItem("formatoComprobante", formato);
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  }

  let guardado = "a4";
  try {
    guardado = localStorage.getItem("formatoComprobante") || "a4";
  } catch {
    /* modo privado */
  }
  opciones.forEach((o) => {
    o.checked = o.value === guardado;
    o.addEventListener("change", () => aplicar(o.value));
  });
  aplicar(guardado);

  document.getElementById("btnImprimir").addEventListener("click", () => window.print());
});
