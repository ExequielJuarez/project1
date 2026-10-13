// ==========================================================
// ADMIN · CATEGORÍAS — Interacciones (usa admin.js)
// Valida el nombre antes de enviar, enfoca el campo al abrir
// "Renombrar" y cierra los demás desplegables. El servidor
// vuelve a validar todo.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $$ } = window.Admin;

  // ---------- Validación del nombre ----------
  $$("[data-validar-nombre]").forEach((form) => {
    const input = form.querySelector('input[name="nombre"]');
    const error = form.querySelector(".cat-form__error");
    const max = Number(form.dataset.max) || 60;

    form.addEventListener("submit", (e) => {
      const valor = input.value.trim();
      let mensaje = "";
      if (valor.length < 2) mensaje = "Escribí un nombre de al menos 2 letras";
      else if (valor.length > max) mensaje = `Máximo ${max} letras`;
      else if (!/[a-z0-9áéíóúñü]/i.test(valor)) mensaje = "Usá letras o números";
      error.textContent = mensaje;
      if (mensaje) {
        e.preventDefault();
        input.focus();
      }
    });
    input.addEventListener("input", () => (error.textContent = ""));
  });

  // ---------- Desplegables (renombrar) ----------
  const desplegables = $$(".cat__renombrar, .sub__editar");
  desplegables.forEach((d) =>
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      desplegables.forEach((otro) => otro !== d && (otro.open = false));
      const input = d.querySelector("input");
      input.focus();
      input.select();
    })
  );
  // Escape o clic afuera cierran el desplegable abierto
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") desplegables.forEach((d) => (d.open = false));
  });
  document.addEventListener("click", (e) => {
    desplegables.forEach((d) => d.open && !d.contains(e.target) && (d.open = false));
  });
});
