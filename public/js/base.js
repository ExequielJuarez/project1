// ==========================================================
// BASE — Interacciones compartidas por todas las vistas
// Menú, buscador, paneles laterales, acordeones, carrito
// (vía API en sesión), favoritos de demostración y aviso (toast).
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

  // accion opcional: { texto, href } para mostrar un enlace dentro del aviso
  function mostrarToast(texto, accion = null) {
    toast.textContent = texto;
    if (accion) {
      const link = document.createElement("a");
      link.href = accion.href;
      link.className = "toast__accion";
      link.textContent = accion.texto;
      toast.appendChild(link);
    }
    toast.classList.toggle("con-accion", Boolean(accion));
    toast.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toast.classList.remove("visible"), accion ? 3500 : 2200);
  }

  // ---------- Pedidos al servidor (JSON) ----------
  async function api(url, metodo = "GET", datos = null) {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: datos ? JSON.stringify(datos) : null,
    });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok || !json.ok) throw new Error(json.mensaje || "Algo salió mal, probá de nuevo");
    return json;
  }

  // ---------- Carrito ----------
  const contador = $("#contadorCarrito");

  function actualizarContador(cantidad) {
    contador.textContent = cantidad;
    contador.classList.add("pulso");
    setTimeout(() => contador.classList.remove("pulso"), 200);
  }

  async function agregarAlCarrito({ id, nombre, cantidad = 1, color = null, boton = null }) {
    if (boton) boton.disabled = true;
    try {
      const r = await api("/carrito/agregar", "POST", { id, cantidad, color });
      actualizarContador(r.cantidad);
      mostrarToast(cantidad > 1 ? `Agregado: ${cantidad} × ${nombre}` : `Agregado: ${nombre}`, {
        texto: "Ver carrito",
        href: "/carrito",
      });
      return r;
    } catch (error) {
      mostrarToast(error.message);
    } finally {
      if (boton) boton.disabled = false;
    }
  }

  $$("[data-agregar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tarjeta = btn.closest(".tarjeta");
      agregarAlCarrito({ id: tarjeta.dataset.id, nombre: tarjeta.dataset.nombre, boton: btn });
    });
  });

  // ---------- Favoritos (demo) ----------
  $$(".tarjeta__fav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const activo = btn.classList.toggle("activo");
      mostrarToast(activo ? "Guardado en favoritos" : "Quitado de favoritos");
    });
  });

  window.Tienda = { $, $$, abrirPanel, cerrarPaneles, mostrarToast, api, actualizarContador, agregarAlCarrito };
})();
