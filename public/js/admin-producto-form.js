// ==========================================================
// ADMIN · FORMULARIO DE PRODUCTO — Interacciones (usa admin.js)
// Ganancia y margen en vivo, vista previa de la tarjeta,
// vista previa de la imagen (con arrastrar y soltar) y
// validación antes de enviar. El servidor vuelve a validar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, formatoPrecio } = window.Admin;

  // Si el foco va al botón de enviar no validamos en el blur: el mensaje de error
  // correría el botón y el clic se perdería. El submit valida todo igual.
  const vaAEnviar = (e) => e.relatedTarget?.type === "submit";

  const form = $("#formProducto");
  const campo = (nombre) => form.elements[nombre];

  // ---------- Rentabilidad y vista previa ----------
  function actualizar() {
    const precio = parseFloat(campo("precio").value) || 0;
    const costo = parseFloat(campo("costo").value) || 0;
    const ganancia = precio - costo;

    $("#gananciaUnidad").textContent = precio ? formatoPrecio(ganancia) : "—";
    $("#margen").textContent = precio ? `${((ganancia / precio) * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%` : "—";
    $("#precioTransferencia").textContent = precio ? formatoPrecio(precio * 0.9) : "—";

    $("#previaNombre").textContent = campo("nombre").value.trim() || "Nombre del producto";
    $("#previaCategoria").textContent = campo("categoria").value || "Categoría";
    $("#previaPrecio").textContent = formatoPrecio(precio);
    $("#previaTransferencia").textContent = precio ? `${formatoPrecio(precio * 0.9)} con transferencia` : "";

    const etiqueta = campo("etiqueta").value.trim();
    $("#previaEtiqueta").hidden = !etiqueta;
    $("#previaEtiqueta").textContent = etiqueta;
  }

  ["nombre", "categoria", "etiqueta", "precio", "costo"].forEach((n) => {
    campo(n).addEventListener("input", actualizar);
    campo(n).addEventListener("change", actualizar);
  });
  actualizar();

  // ---------- Imagen ----------
  const inputImagen = $("#imagen");
  const subida = inputImagen.closest(".subida");
  const TIPOS = ["image/jpeg", "image/png", "image/webp"];

  function mostrarImagen(archivo) {
    const campoImagen = inputImagen.closest(".campo");
    const error = $(".campo__error", campoImagen);
    let mensaje = "";
    if (!TIPOS.includes(archivo.type)) mensaje = "La imagen tiene que ser JPG, PNG o WEBP";
    else if (archivo.size > 2 * 1024 * 1024) mensaje = "La imagen no puede pesar más de 2 MB";

    campoImagen.classList.toggle("campo--error", Boolean(mensaje));
    error.textContent = mensaje;
    if (mensaje) {
      inputImagen.value = "";
      return;
    }

    const url = URL.createObjectURL(archivo);
    [$("#vistaImagen"), $("#previaImagen")].forEach((caja) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      const etiqueta = $(".vista-previa__etiqueta", caja);
      caja.innerHTML = "";
      caja.appendChild(img);
      if (etiqueta) caja.appendChild(etiqueta);
    });
    $("#nombreArchivo").textContent = archivo.name;
  }

  inputImagen.addEventListener("change", () => inputImagen.files[0] && mostrarImagen(inputImagen.files[0]));
  ["dragenter", "dragover"].forEach((ev) => subida.addEventListener(ev, () => subida.classList.add("arrastrando")));
  ["dragleave", "drop"].forEach((ev) => subida.addEventListener(ev, () => subida.classList.remove("arrastrando")));

  // ---------- Validación ----------
  // Mismas reglas que el servidor (src/validations/productoValidator.js)
  const reglas = {
    nombre: [(v) => v.trim().length >= 3 && v.trim().length <= 90, "El nombre debe tener entre 3 y 90 caracteres"],
    categoria: [(v) => v !== "", "Elegí una categoría"],
    color: [(v) => v !== "", "Elegí un color"],
    precio: [(v) => parseFloat(v) >= 1, "Ingresá un precio mayor a 0"],
    costo: [
      (v) => v !== "" && parseFloat(v) >= 0 && parseFloat(v) <= (parseFloat(campo("precio").value) || 0),
      "El costo tiene que ser 0 o más, y no mayor que el precio",
    ],
    stock: [(v) => /^\d+$/.test(v), "El stock debe ser un número entero (0 o más)"],
  };

  function validar(nombre) {
    const input = campo(nombre);
    const [esValido, mensaje] = reglas[nombre];
    const ok = esValido(input.value);
    const caja = input.closest(".campo");
    caja.classList.toggle("campo--error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    $(".campo__error", caja).textContent = ok ? "" : mensaje;
    return ok;
  }

  Object.keys(reglas).forEach((nombre) => {
    const input = campo(nombre);
    input.addEventListener("blur", (e) => input.value && !vaAEnviar(e) && validar(nombre));
    input.addEventListener("input", () => input.closest(".campo").classList.contains("campo--error") && validar(nombre));
  });

  form.addEventListener("submit", (e) => {
    const conError = Object.keys(reglas).filter((n) => !validar(n));
    if (conError.length) {
      e.preventDefault();
      campo(conError[0]).focus();
      campo(conError[0]).closest(".panel").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const boton = $("#btnGuardar");
    boton.disabled = true;
    boton.textContent = "Guardando…";
  });

  const resumen = $("#resumenErrores");
  if (resumen) resumen.focus();
});
