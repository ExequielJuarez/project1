// ==========================================================
// BASE — Interacciones compartidas por todas las vistas
// Menú, buscador, paneles laterales, acordeones, carrito
// y favoritos de demostración, aviso (toast).
// Expone window.Tienda para que cada vista lo reutilice.
// ==========================================================

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const body = document.body;
  const header = $("#header");
  const overlay = $("#overlay");
  const nav = $("#nav");
  const btnMenu = $("#btnMenu");

  // ---------- Paneles laterales (menú, filtros, etc.) ----------
  function cerrarPaneles() {
    $$(".abierto[data-panel], #nav.abierto").forEach((p) => p.classList.remove("abierto"));
    overlay.classList.remove("visible");
    header.classList.remove("menu-abierto");
    btnMenu.setAttribute("aria-expanded", "false");
    body.classList.remove("bloqueado");
  }

  function abrirPanel(panel) {
    cerrarPaneles();
    panel.classList.add("abierto");
    overlay.classList.add("visible");
    body.classList.add("bloqueado");
  }

  btnMenu.addEventListener("click", () => {
    if (nav.classList.contains("abierto")) return cerrarPaneles();
    abrirPanel(nav);
    header.classList.add("menu-abierto");
    btnMenu.setAttribute("aria-expanded", "true");
  });

  overlay.addEventListener("click", cerrarPaneles);
  document.addEventListener("keydown", (e) => e.key === "Escape" && cerrarPaneles());
  window.matchMedia("(min-width: 1100px)").addEventListener("change", cerrarPaneles);

  // Buscador en celular
  $("#btnBuscarMovil").addEventListener("click", () => {
    const buscador = $("#buscadorMovil");
    buscador.classList.toggle("abierto");
    if (buscador.classList.contains("abierto")) $("input", buscador).focus();
  });

  // Sombra del header al hacer scroll
  window.addEventListener(
    "scroll",
    () => header.classList.toggle("con-sombra", window.scrollY > 10),
    { passive: true }
  );

  // ---------- Acordeones ----------
  $$(".acordeon__titulo").forEach((btn) => {
    btn.addEventListener("click", () => {
      const abierto = btn.parentElement.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", String(abierto));
    });
  });

  // ---------- Aviso ----------
  const toast = $("#toast");
  let timerToast;

  function mostrarToast(texto) {
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  // ---------- Carrito (demo) ----------
  const contador = $("#contadorCarrito");
  let totalCarrito = 0;

  function agregarAlCarrito(nombre, cantidad = 1) {
    totalCarrito += cantidad;
    contador.textContent = totalCarrito;
    contador.classList.add("pulso");
    setTimeout(() => contador.classList.remove("pulso"), 200);
    mostrarToast(cantidad > 1 ? `Agregado: ${cantidad} × ${nombre}` : `Agregado: ${nombre}`);
  }

  $$("[data-agregar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      agregarAlCarrito(btn.closest(".tarjeta").dataset.nombre);
    });
  });

  // ---------- Favoritos (demo) ----------
  $$(".tarjeta__fav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const activo = btn.classList.toggle("activo");
      mostrarToast(activo ? "Guardado en favoritos" : "Quitado de favoritos");
    });
  });

  window.Tienda = { $, $$, abrirPanel, cerrarPaneles, mostrarToast, agregarAlCarrito };
})();
