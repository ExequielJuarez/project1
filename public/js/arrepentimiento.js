// ==========================================================
// BOTÓN DE ARREPENTIMIENTO — Validación antes de enviar
// (usa base.js). El servidor vuelve a validar todo.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $ } = window.Tienda;

  const form = $("#formArr");
  const reglas = [
    ["numeroPedido", (v) => /^#?\s*\d{1,10}$/.test(v), "Ingresá el número de pedido (solo números, ej: 1024)"],
    ["nombre", (v) => v.length >= 2, "Escribí tu nombre y apellido"],
    ["email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Ingresá un email válido"],
  ];

  function marcar(input, mensaje) {
    const campo = input.closest(".campo");
    campo.classList.toggle("campo--error", Boolean(mensaje));
    input.setAttribute("aria-invalid", String(Boolean(mensaje)));
    $(".campo__error", campo).textContent = mensaje;
  }

  form.addEventListener("submit", (e) => {
    let primero = null;
    reglas.forEach(([nombre, valida, mensaje]) => {
      const input = form.elements[nombre];
      const ok = valida(input.value.trim());
      marcar(input, ok ? "" : mensaje);
      if (!ok && !primero) primero = input;
    });
    const confirmo = form.elements.confirmo;
    marcar(confirmo, confirmo.checked ? "" : "Confirmá que querés cancelar la compra");
    if (!confirmo.checked && !primero) primero = confirmo;

    if (primero) {
      e.preventDefault();
      primero.focus();
      return;
    }
    const boton = $("#btnArr");
    boton.disabled = true;
    boton.textContent = "Enviando…";
  });

  const resumen = $("#resumenErrores");
  if (resumen) resumen.focus();
});
