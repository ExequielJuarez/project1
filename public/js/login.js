// ==========================================================
// LOGIN — Interacciones propias de la vista (usa base.js)
// Mostrar/ocultar contraseña, aviso de mayúsculas,
// validación antes de enviar y usuario de prueba.
// El servidor vuelve a validar todo al enviar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $ } = window.Tienda;

  const form = $("#formLogin");
  const email = $("#email");
  const password = $("#password");

  // ---------- Mostrar / ocultar contraseña ----------
  const verClave = $("#verClave");
  verClave.addEventListener("click", () => {
    const mostrar = password.type === "password";
    password.type = mostrar ? "text" : "password";
    verClave.setAttribute("aria-pressed", String(mostrar));
    verClave.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
    password.focus();
  });

  // ---------- Aviso de mayúsculas activadas ----------
  const avisoMayus = $("#password-mayus");
  ["keydown", "keyup"].forEach((evento) =>
    password.addEventListener(evento, (e) => {
      if (e.getModifierState) avisoMayus.hidden = !e.getModifierState("CapsLock");
    })
  );
  password.addEventListener("blur", () => (avisoMayus.hidden = true));

  // ---------- Validación antes de enviar ----------
  const reglas = [
    [email, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Ingresá un email válido"],
    [password, (v) => v.length > 0, "Ingresá tu contraseña"],
  ];

  function validar([input, esValido, mensaje]) {
    const ok = esValido(input.value.trim());
    const campo = input.closest(".campo");
    campo.classList.toggle("campo--error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    $(".campo__error", campo).textContent = ok ? "" : mensaje;
    return ok;
  }

  reglas.forEach((regla) => {
    const [input] = regla;
    input.addEventListener("blur", () => input.value && validar(regla));
    input.addEventListener("input", () => {
      if (input.closest(".campo").classList.contains("campo--error")) validar(regla);
    });
  });

  form.addEventListener("submit", (e) => {
    const conError = reglas.filter((regla) => !validar(regla));
    if (conError.length) {
      e.preventDefault();
      conError[0][0].focus();
      return;
    }
    const boton = $("#btnIngresar");
    boton.disabled = true;
    boton.textContent = "Ingresando…";
  });

  // Si el servidor rechazó el ingreso, dejar el foco listo en la contraseña
  if ($(".aviso--error") && email.value) password.focus();

  // ---------- Usuario de prueba (solo maqueta) ----------
  $("#usarDemo").addEventListener("click", () => {
    email.value = "demo@tienda.com";
    password.value = "Demo1234";
    reglas.forEach(validar);
    $("#btnIngresar").focus();
  });
});
