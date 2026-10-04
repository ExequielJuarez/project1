// ==========================================================
// LOGIN CON CÓDIGO — Validación del email antes de pedir el código
// El servidor vuelve a validar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $ } = window.Tienda;

  const form = $("#formCodigo");
  const email = $("#email");
  const boton = $("#btnCodigo");

  function validar() {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    const campo = email.closest(".campo");
    campo.classList.toggle("campo--error", !ok);
    email.setAttribute("aria-invalid", String(!ok));
    $(".campo__error", campo).textContent = ok ? "" : "Ingresá un email válido";
    return ok;
  }

  email.addEventListener("input", () => email.closest(".campo").classList.contains("campo--error") && validar());

  form.addEventListener("submit", (e) => {
    if (!validar()) {
      e.preventDefault();
      email.focus();
      return;
    }
    boton.disabled = true;
    boton.textContent = "Enviando…";
  });
});
