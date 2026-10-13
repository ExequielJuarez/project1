// ==========================================================
// CATÁLOGO — Interacciones propias de la vista (usa base.js)
// Panel de filtros, filtrado, orden y cambio de vista.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, abrirPanel, cerrarPaneles } = window.Tienda;

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
  const campoGrupo = filtros.dataset.grupo || "categoria";

  // ---------- Panel de filtros (celular / tablet) ----------
  $("#btnFiltros").addEventListener("click", () => abrirPanel(filtros));
  $("#btnCerrarFiltros").addEventListener("click", cerrarPaneles);
  $("#btnAplicar").addEventListener("click", cerrarPaneles);

  // ---------- Filtrado ----------
  const formatoPrecio = (n) =>
    "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

  function leerFiltros() {
    return {
      // Filtro propio de la página: subcategorías (sección) o categorías (búsqueda)
      grupo: $$(`input[name="${campoGrupo}"]:checked`).map((i) => i.value),
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
        (!f.grupo.length || f.grupo.includes(t.dataset[campoGrupo])) &&
        (!f.colores.length || (t.dataset.colores || "").split(" ").some((c) => f.colores.includes(c))) &&
        precio >= f.min &&
        precio <= f.max;

      t.hidden = !pasa;
      if (pasa) visibles++;
    });

    vacio.hidden = visibles > 0;
    cantidadVisible.textContent = visibles;
    $("#cantidadPalabra").textContent = visibles === 1 ? "producto" : "productos";
    pintarChips(f);
    marcarSubnav(f);
  }

  // ---------- Accesos rápidos a las subcategorías (arriba del listado) ----------
  // Sin recargar: marcan el filtro de esa subcategoría y actualizan la dirección
  const linksSub = $$("[data-sub-link]");

  function marcarSubnav(f) {
    if (!linksSub.length) return;
    const unica = f.grupo.length === 1 ? f.grupo[0] : f.grupo.length ? null : "";
    linksSub.forEach((a) => a.classList.toggle("activo", a.dataset.subLink === unica));
    const url = new URL(window.location.href);
    if (unica) url.searchParams.set("sub", unica);
    else url.searchParams.delete("sub");
    history.replaceState(null, "", url);
  }

  linksSub.forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      $$(`input[name="${campoGrupo}"]`).forEach((i) => (i.checked = i.value === a.dataset.subLink));
      aplicarFiltros();
    })
  );

  function pintarChips(f) {
    const chips = [
      ...f.grupo.map((v) => ({
        tipo: campoGrupo,
        valor: v,
        texto: $(`input[name="${campoGrupo}"][value="${CSS.escape(v)}"]`)?.closest("label").querySelector(".check__texto").textContent || v,
      })),
      ...f.colores.map((v) => ({
        tipo: "color",
        valor: v,
        texto: $(`input[name="color"][value="${CSS.escape(v)}"]`)?.closest("label").title || v,
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
      chip.textContent = `${c.texto} `;
      chip.insertAdjacentHTML("beforeend", '<span aria-hidden="true">✕</span>');
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
  // Si se llegó desde una pestaña del menú (?categoria=) ya hay un filtro marcado
  if ($$('.filtros input[type="checkbox"]:checked').length) aplicarFiltros();
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
});
