// ==========================================================
// ADMIN · PEDIDOS — Interacciones propias de la vista (usa admin.js)
// Búsqueda que se aplica sola y cambio de estado de un pedido
// sin recargar la página.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast } = window.Admin;

  // ---------- Búsqueda ----------
  const form = $("#filtrosPedidos");
  const buscar = $('input[name="q"]', form);
  let espera;
  buscar.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(() => form.submit(), 450);
  });
  if (buscar.value) {
    buscar.focus();
    buscar.setSelectionRange(buscar.value.length, buscar.value.length);
  }

  // ---------- Cambiar estado ----------
  $$("[data-cambiar-estado]").forEach((select) => {
    let anterior = select.value;

    select.addEventListener("change", async () => {
      const fila = select.closest(".pedido-fila");
      fila.classList.add("guardando");
      try {
        const r = await api(`/admin/pedidos/${fila.dataset.numero}/estado`, "PATCH", { estado: select.value });
        const tag = $("[data-estado-tag]", fila);
        tag.className = `pedido-fila__estado estado estado--${r.estado}`;
        tag.textContent = select.options[select.selectedIndex].text;
        anterior = r.estado;
        mostrarToast(`Pedido #${fila.dataset.numero}: ${tag.textContent.toLowerCase()}`);
      } catch (error) {
        select.value = anterior;
        mostrarToast(error.message);
      } finally {
        fila.classList.remove("guardando");
      }
    });
  });
});
