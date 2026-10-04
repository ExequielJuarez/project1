// ==========================================================
// ADMIN · FORMULARIO DE PRODUCTO — Interacciones (usa admin.js)
// Ganancia y margen en vivo, vista previa de la tarjeta,
// varias fotos (elegir principal, quitar, arrastrar y soltar) y
// validación antes de enviar. El servidor vuelve a validar.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, api, mostrarToast, formatoPrecio } = window.Admin;

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

  // ---------- Fotos ----------
  // Las fotos nuevas se acumulan (se pueden elegir en varias tandas o
  // arrastrar), se previsualizan y se pueden sacar antes de guardar.
  const lista = $("#fotosAdmin");
  const input = $("#imagenes");
  const zona = $("#zonaSubida");
  const campoFotos = input.closest(".campo");
  const errorFotos = $("#imagenes-error");
  const MAX = Number(lista.dataset.max) || 8;
  const TIPOS = ["image/jpeg", "image/png", "image/webp"];
  let nuevas = []; // [{ archivo, url }]

  const existentes = () => [...lista.querySelectorAll("[data-existente]")];
  const activas = () => existentes().filter((li) => !li.classList.contains("quitada")).length;

  function avisar(mensaje) {
    campoFotos.classList.toggle("campo--error", Boolean(mensaje));
    errorFotos.textContent = mensaje;
  }

  // El <input type="file"> tiene que llevar exactamente las fotos nuevas que quedan
  function sincronizarInput() {
    const dt = new DataTransfer();
    nuevas.forEach((n) => dt.items.add(n.archivo));
    input.files = dt.files;
  }

  // Si no hay principal elegida (o se quitó), pasa a ser la primera disponible
  function asegurarPrincipal() {
    const radios = [...lista.querySelectorAll('input[name="principal"]')].filter(
      (r) => !r.closest(".foto-admin").classList.contains("quitada")
    );
    if (radios.length && !radios.some((r) => r.checked)) radios[0].checked = true;
    lista.querySelectorAll(".quitada input[name='principal']").forEach((r) => (r.checked = false));
    actualizarPrevia();
  }

  function actualizarPrevia() {
    const elegida = lista.querySelector('input[name="principal"]:checked');
    const src = elegida?.closest(".foto-admin").querySelector("img")?.src;
    const caja = $("#previaImagen");
    const etiqueta = $(".vista-previa__etiqueta", caja);
    caja.innerHTML = src ? `<img src="${src}" alt="">` : "<span>(IMAGEN)</span>";
    caja.appendChild(etiqueta);
  }

  function pintarNuevas() {
    const principalAntes = lista.querySelector('input[name="principal"]:checked')?.value;
    lista.querySelectorAll(".foto-admin--nueva").forEach((li) => li.remove());

    nuevas.forEach((n, i) => {
      const li = document.createElement("li");
      li.className = "foto-admin foto-admin--nueva";
      li.innerHTML = `
        <img src="${n.url}" alt="">
        <label class="foto-admin__principal">
          <input type="radio" name="principal" value="n-${i}"><span>Principal</span>
        </label>
        <button type="button" class="foto-admin__sacar">×</button>`;
      // El nombre del archivo va como texto (no como HTML)
      $(".foto-admin__sacar", li).setAttribute("aria-label", `Sacar ${n.archivo.name}`);
      $(".foto-admin__sacar", li).addEventListener("click", () => {
        URL.revokeObjectURL(n.url);
        nuevas.splice(i, 1);
        sincronizarInput();
        pintarNuevas();
      });
      lista.appendChild(li);
    });

    // Mantener la principal elegida si sigue existiendo
    const radio = principalAntes && lista.querySelector(`input[name="principal"][value="${principalAntes}"]`);
    if (radio) radio.checked = true;
    asegurarPrincipal();
    actualizarContador();
  }

  function actualizarContador() {
    const total = activas() + nuevas.length;
    $("#cantidadFotos").textContent = total;
    zona.classList.toggle("llena", total >= MAX);
  }

  function agregar(archivos) {
    let mensaje = "";
    for (const archivo of archivos) {
      if (!TIPOS.includes(archivo.type)) mensaje = `"${archivo.name}" no es JPG, PNG ni WEBP`;
      else if (archivo.size > 2 * 1024 * 1024) mensaje = `"${archivo.name}" pesa más de 2 MB`;
      else if (activas() + nuevas.length >= MAX) mensaje = `Podés tener hasta ${MAX} fotos por producto`;
      else nuevas.push({ archivo, url: URL.createObjectURL(archivo) });
    }
    avisar(mensaje);
    sincronizarInput();
    pintarNuevas();
  }

  input.addEventListener("change", () => agregar([...input.files]));

  // Arrastrar y soltar sobre la zona
  ["dragenter", "dragover"].forEach((ev) =>
    zona.addEventListener(ev, (e) => {
      e.preventDefault();
      zona.classList.add("arrastrando");
    })
  );
  ["dragleave", "drop"].forEach((ev) => zona.addEventListener(ev, () => zona.classList.remove("arrastrando")));
  zona.addEventListener("drop", (e) => {
    e.preventDefault();
    agregar([...e.dataTransfer.files]);
  });

  // Quitar / principal en las fotos que ya estaban guardadas
  lista.addEventListener("change", (e) => {
    if (e.target.name === "quitarImagenes") {
      e.target.closest(".foto-admin").classList.toggle("quitada", e.target.checked);
      asegurarPrincipal();
      actualizarContador();
      avisar("");
    }
    if (e.target.name === "principal") actualizarPrevia();
  });

  // ---------- Validación ----------
  // Mismas reglas que el servidor (src/validations/productoValidator.js)
  const reglas = {
    nombre: [(v) => v.trim().length >= 3 && v.trim().length <= 90, "El nombre debe tener entre 3 y 90 caracteres"],
    categoria: [(v) => v !== "", "Elegí una categoría"],
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

  // ---------- Colores (uno o varios) ----------
  const cajaColores = $("#colores");
  const marcados = () => $$('input[name="colores"]:checked', cajaColores);

  function contarColores() {
    const n = marcados().length;
    $("#cuentaColores").textContent = n
      ? `${n} ${n === 1 ? "color elegido" : "colores elegidos"} · principal: ${marcados()[0].closest(".color-opcion").textContent.trim()}`
      : "";
  }

  function validarColores() {
    const ok = marcados().length > 0;
    cajaColores.classList.toggle("campo--error", !ok);
    $("#colores-error").textContent = ok ? "" : "Elegí al menos un color";
    return ok;
  }

  cajaColores.addEventListener("change", (e) => {
    if (e.target.name !== "colores") return;
    contarColores();
    if (cajaColores.classList.contains("campo--error")) validarColores();
  });
  contarColores();

  // Agregar un color nuevo sin salir del formulario
  const btnNuevo = $("#btnColorNuevo");
  const camposNuevo = $("#colorNuevoCampos");
  const nombreNuevo = $("#colorNuevoNombre");
  const errorNuevo = $("#colorNuevoError");

  btnNuevo.addEventListener("click", () => {
    const abrir = camposNuevo.hidden;
    camposNuevo.hidden = !abrir;
    btnNuevo.setAttribute("aria-expanded", String(abrir));
    if (abrir) nombreNuevo.focus();
  });

  async function guardarColorNuevo() {
    errorNuevo.textContent = "";
    const nombre = nombreNuevo.value.trim();
    if (nombre.length < 2) {
      errorNuevo.textContent = "Escribí el nombre del color";
      return nombreNuevo.focus();
    }
    try {
      const { color } = await api("/admin/colores", "POST", { nombre, hex: $("#colorNuevoHex").value });
      let input = $(`input[name="colores"][value="${CSS.escape(color.valor)}"]`, cajaColores);
      if (!input) {
        const etiqueta = document.createElement("label");
        etiqueta.className = "color-opcion";
        etiqueta.innerHTML = '<input type="checkbox" name="colores"><span class="color-opcion__muestra"></span><span class="color-opcion__nombre"></span>';
        input = etiqueta.querySelector("input");
        input.value = color.valor;
        etiqueta.querySelector(".color-opcion__muestra").style.setProperty("--muestra", color.hex);
        etiqueta.querySelector(".color-opcion__nombre").textContent = color.nombre;
        $("#listaColores").append(etiqueta);
      }
      input.checked = true;
      nombreNuevo.value = "";
      contarColores();
      validarColores();
      mostrarToast(color.nuevo ? `Color "${color.nombre}" agregado` : `"${color.nombre}" ya existía: quedó marcado`);
    } catch (error) {
      errorNuevo.textContent = error.message;
    }
  }

  $("#btnGuardarColor").addEventListener("click", guardarColorNuevo);
  // Enter en el nombre agrega el color (y no envía el formulario del producto)
  nombreNuevo.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    guardarColorNuevo();
  });

  form.addEventListener("submit", (e) => {
    const conError = Object.keys(reglas).filter((n) => !validar(n));
    const coloresOk = validarColores();
    if (conError.length || !coloresOk) {
      e.preventDefault();
      const primero = conError.length ? campo(conError[0]) : $('input[name="colores"]', cajaColores);
      primero.focus();
      primero.closest(".panel").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const boton = $("#btnGuardar");
    boton.disabled = true;
    boton.textContent = "Guardando…";
  });

  const resumen = $("#resumenErrores");
  if (resumen) resumen.focus();
});
