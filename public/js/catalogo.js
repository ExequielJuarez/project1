// ==========================================================
// CATÁLOGO — Interacciones de la maqueta
// Menú, panel de filtros, acordeones, filtrado, orden,
// cambio de vista y carrito de demostración.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const body = document.body;
  const header = $("#header");
  const overlay = $("#overlay");
  const nav = $("#nav");
  const btnMenu = $("#btnMenu");
  const filtros = $("#filtros");
  const grilla = $("#grilla");
  const tarjetas = $$(".tarjeta", grilla);
  const vacio = $("#vacio");
  const selectOrden = $("#orden");
  const precioMin = $("#precioMin");
  const precioMax = $("#precioMax");
  const chipsActivos = $("#chipsActivos");
  const badgeFiltros = $("#badgeFiltros");
  const cantidadVisible = $("#cantidadVisible");
  const esPC = window.matchMedia("(min-width: 1100px)");

  // ---------- Paneles (menú y filtros) ----------
  function cerrarPaneles() {
    nav.classList.remove("abierto");
    filtros.classList.remove("abierto");
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

  $("#btnFiltros").addEventListener("click", () => abrirPanel(filtros));
  $("#btnCerrarFiltros").addEventListener("click", cerrarPaneles);
  $("#btnAplicar").addEventListener("click", cerrarPaneles);
  overlay.addEventListener("click", cerrarPaneles);
  document.addEventListener("keydown", (e) => e.key === "Escape" && cerrarPaneles());
  esPC.addEventListener("change", cerrarPaneles);

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

  // ---------- Filtrado ----------
  const formatoPrecio = (n) =>
    "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

  function leerFiltros() {
    return {
      categorias: $$('input[name="categoria"]:checked').map((i) => i.value),
      colores: $$('input[name="color"]:checked').map((i) => i.value),
      min: parseFloat(precioMin.value) || 0,
      max: parseFloat(precioMax.value) || Infinity,
    };
  }

  function aplicarFiltros() {
    const f = leerFiltros();
    let visibles = 0;

    tarjetas.forEach((t) => {
      const precio = Number(t.dataset.precio);
      const pasa =
        (!f.categorias.length || f.categorias.includes(t.dataset.categoria)) &&
        (!f.colores.length || f.colores.includes(t.dataset.color)) &&
        precio >= f.min &&
        precio <= f.max;

      t.hidden = !pasa;
      if (pasa) visibles++;
    });

    vacio.hidden = visibles > 0;
    cantidadVisible.textContent = visibles;
    pintarChips(f);
  }

  function pintarChips(f) {
    const chips = [
      ...f.categorias.map((v) => ({ tipo: "categoria", valor: v, texto: v })),
      ...f.colores.map((v) => ({
        tipo: "color",
        valor: v,
        texto: v.charAt(0).toUpperCase() + v.slice(1),
      })),
    ];
    if (f.min || f.max !== Infinity) {
      chips.push({
        tipo: "precio",
        texto: `${formatoPrecio(f.min)} – ${f.max === Infinity ? "∞" : formatoPrecio(f.max)}`,
      });
    }

    chipsActivos.innerHTML = "";
    chips.forEach((c) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.innerHTML = `${c.texto} <span aria-hidden="true">✕</span>`;
      chip.setAttribute("aria-label", `Quitar filtro ${c.texto}`);
      chip.addEventListener("click", () => {
        if (c.tipo === "precio") {
          precioMin.value = "";
          precioMax.value = "";
        } else {
          const input = $(`input[name="${c.tipo}"][value="${CSS.escape(c.valor)}"]`);
          if (input) input.checked = false;
        }
        aplicarFiltros();
      });
      chipsActivos.appendChild(chip);
    });

    badgeFiltros.hidden = chips.length === 0;
    badgeFiltros.textContent = chips.length;
  }

  function limpiarFiltros() {
    $$('.filtros input[type="checkbox"]').forEach((i) => (i.checked = false));
    precioMin.value = "";
    precioMax.value = "";
    aplicarFiltros();
  }

  $$('.filtros input[type="checkbox"]').forEach((i) =>
    i.addEventListener("change", aplicarFiltros)
  );
  [precioMin, precioMax].forEach((i) => i.addEventListener("input", aplicarFiltros));
  $("#btnLimpiar").addEventListener("click", limpiarFiltros);
  $$("[data-limpiar]").forEach((b) => b.addEventListener("click", limpiarFiltros));

  // ---------- Orden ----------
  selectOrden.addEventListener("change", () => {
    const criterio = selectOrden.value;
    const ordenadas = [...tarjetas].sort((a, b) => {
      switch (criterio) {
        case "precio-asc":
          return a.dataset.precio - b.dataset.precio;
        case "precio-desc":
          return b.dataset.precio - a.dataset.precio;
        case "nombre-asc":
          return a.dataset.nombre.localeCompare(b.dataset.nombre, "es");
        default:
          return a.dataset.orden - b.dataset.orden;
      }
    });
    ordenadas.forEach((t) => grilla.insertBefore(t, vacio));
  });

  // ---------- Cambio de vista (columnas) ----------
  $$(".vista__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".vista__btn").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      grilla.dataset.columnas = btn.dataset.columnas;
    });
  });

  // ---------- Carrito y favoritos (demo) ----------
  const contador = $("#contadorCarrito");
  const toast = $("#toast");
  let totalCarrito = 0;
  let timerToast;

  function mostrarToast(texto) {
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  $$("[data-agregar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nombre = btn.closest(".tarjeta").dataset.nombre;
      totalCarrito++;
      contador.textContent = totalCarrito;
      contador.classList.add("pulso");
      setTimeout(() => contador.classList.remove("pulso"), 200);
      mostrarToast(`Agregado: ${nombre}`);
    });
  });

  $$(".tarjeta__fav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const activo = btn.classList.toggle("activo");
      mostrarToast(activo ? "Guardado en favoritos" : "Quitado de favoritos");
    });
  });
});
