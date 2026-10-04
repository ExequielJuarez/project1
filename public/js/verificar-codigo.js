// ==========================================================
// VERIFICAR CÓDIGO — Solo números, envío automático al
// completar los 6 y cuenta regresiva para reenviar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $ } = window.Tienda;

  const form = $("#formVerificar");
  const input = $("#codigo");
  const boton = $("#btnVerificar");
  const reenviar = $("#btnReenviar");
  let enviando = false;

  function enviar() {
    if (enviando) return;
    enviando = true;
    boton.disabled = true;
    boton.textContent = "Verificando…";
    form.submit();
  }

  // Solo números (también si se pega "123 456" desde el email)
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 6);
    if (input.value.length === 6) enviar();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.replace(/\D/g, "").length !== 6) {
      $("#codigo-ayuda").textContent = "Escribí los 6 números del código.";
      input.focus();
      return;
    }
    enviar();
  });

  // ---------- Reenviar (con espera) ----------
  let espera = Number(reenviar.dataset.espera) || 0;
  const textoOriginal = reenviar.textContent;

  function tic() {
    if (espera <= 0) {
      reenviar.disabled = false;
      reenviar.textContent = textoOriginal;
      return;
    }
    reenviar.disabled = true;
    reenviar.textContent = `${textoOriginal} (${espera}s)`;
    espera -= 1;
    setTimeout(tic, 1000);
  }
  tic();
});
