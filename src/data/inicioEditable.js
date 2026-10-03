// ==========================================================
// Qué se puede editar del inicio desde el panel (Admin → Inicio)
// y el valor original de cada cosa.
//
// Este esquema arma solo el formulario del panel, limpia lo que
// se guarda y completa lo que falta. Para sumar un campo nuevo
// alcanza con agregarlo acá y usarlo en views/inicio.ejs.
//
// Tipos: texto (una línea) · lineas (varios renglones) · parrafo
//        numero · link · imagen · opciones · lista (fija o variable)
// En los textos, *palabra* se muestra en cursiva.
// ==========================================================

const IMG = (nombre) => `/img/inicio/${nombre}`;

const FONDOS = { claro: "Claro", medio: "Gris", oscuro: "Oscuro" };

const texto = (etiqueta, defecto, max = 80, extra = {}) => ({ tipo: "texto", etiqueta, defecto, max, ...extra });
const parrafo = (etiqueta, defecto, max = 300, extra = {}) => ({ tipo: "parrafo", etiqueta, defecto, max, ...extra });
const link = (etiqueta, defecto, extra = {}) => ({ tipo: "link", etiqueta, defecto, max: 255, ancho: "medio", ...extra });
const imagen = (etiqueta, defecto, extra = {}) => ({ tipo: "imagen", etiqueta, defecto, ...extra });
const etiquetaSeccion = (defecto) => texto("Texto chico de arriba", defecto, 40);
const tituloSeccion = (defecto) =>
  texto("Título", defecto, 70, { ayuda: "Poné *entre asteriscos* la parte que va en cursiva." });

const SECCIONES = {
  portada: {
    titulo: "Portada",
    descripcion: "Lo primero que se ve al entrar: título, botones y la foto grande.",
    siempreVisible: true,
    campos: {
      etiqueta: texto("Texto chico de arriba", "Santiago Mates · La gran casa matera", 70),
      titulo: {
        tipo: "lineas",
        etiqueta: "Título grande",
        defecto: "El ritual\nde *compartir*,\nhecho a mano.",
        max: 90,
        maxLineas: 4,
        ayuda: "Cada renglón aparece con una animación. *Entre asteriscos* va en cursiva.",
      },
      bajada: parrafo(
        "Texto debajo del título",
        "Mates de calabaza, madera y cuero hechos uno por uno en nuestro taller. Piezas con historia, pensadas para pasar de mano en mano.",
        260
      ),
      botonTexto: texto("Botón principal", "Descubrir la colección", 30, { ancho: "medio" }),
      botonLink: link("Link del botón principal", "/catalogo"),
      secundarioTexto: texto("Link secundario", "Ver colecciones", 30, { ancho: "medio" }),
      secundarioLink: link("A dónde lleva", "#nuestras-colecciones"),
      imagen: imagen("Foto principal (dentro del arco)", IMG("foto-cuero-alpaca.jpg"), {
        ayuda: "Queda mejor una foto vertical, con el mate centrado.",
        fondo: "oscuro",
      }),
      sello: texto("Texto del sello que gira", "SANTIAGO MATES ✦ LA GRAN CASA MATERA ✦", 50),
      miniImagen: imagen("Foto de la tarjetita", IMG("foto-grabado-papa.jpg"), { ancho: "medio" }),
      miniTexto: {
        tipo: "lineas",
        etiqueta: "Texto de la tarjetita",
        defecto: "Grabado\na tu gusto",
        max: 40,
        maxLineas: 2,
        ancho: "medio",
      },
    },
  },

  cinta: {
    titulo: "Cinta en movimiento",
    descripcion: "La franja negra con palabras que se desplazan.",
    campos: {
      palabras: {
        tipo: "lineas",
        etiqueta: "Palabras",
        defecto: "Calabaza\n*Algarrobo*\nCuero cosido\n*Alpaca cincelada*\nGrabado a mano\n*Acero*",
        max: 240,
        maxLineas: 10,
        ayuda: "Una por renglón. *Entre asteriscos* va en cursiva.",
      },
    },
  },

  colecciones: {
    titulo: "Colecciones",
    descripcion: "Las cuatro tarjetas con forma de arco que llevan al catálogo.",
    campos: {
      etiqueta: etiquetaSeccion("Colecciones"),
      titulo: tituloSeccion("Un mate para *cada ronda*"),
      items: {
        tipo: "lista",
        etiqueta: "Tarjetas",
        item: "Colección",
        cantidad: 4,
        campos: {
          nombre: texto("Nombre", "", 30, { ancho: "medio" }),
          link: link("Link", "", { ayuda: "Ej: /catalogo?q=Madera muestra esa búsqueda." }),
          frase: parrafo("Frase", "", 120),
          imagen: imagen("Foto", ""),
          fondo: { tipo: "opciones", etiqueta: "Fondo de la foto", opciones: FONDOS, defecto: "claro" },
        },
        defecto: [
          { nombre: "Línea Clásica", link: "/catalogo?q=Clásica", frase: "Calabaza seleccionada y virola de alpaca. El de toda la vida.", imagen: IMG("foto-imperial-sol.jpg"), fondo: "claro" },
          { nombre: "Línea Madera", link: "/catalogo?q=Madera", frase: "Algarrobo torneado a mano, con la veta a la vista. Y grabado con tu frase.", imagen: IMG("foto-grabado-papa.jpg"), fondo: "medio" },
          { nombre: "Línea Cerámica", link: "/catalogo?q=Cerámica", frase: "Colores vivos y virolas brillantes: el mate de todos los días.", imagen: IMG("foto-mates-color.jpg"), fondo: "claro" },
          { nombre: "Línea Premium", link: "/catalogo?q=Premium", frase: "Imperiales en cuero con virola de alpaca cincelada. Para regalar.", imagen: IMG("foto-cuero-alpaca.jpg"), fondo: "oscuro" },
        ],
      },
    },
  },

  proceso: {
    titulo: "El proceso",
    descripcion: "Los pasos del taller; en PC la foto cambia con cada paso.",
    campos: {
      etiqueta: etiquetaSeccion("El proceso"),
      titulo: tituloSeccion("Del taller *a tu ronda*"),
      pasos: {
        tipo: "lista",
        etiqueta: "Pasos",
        item: "Paso",
        cantidad: 4,
        campos: {
          titulo: texto("Título", "", 40),
          texto: parrafo("Texto", "", 240),
          imagen: imagen("Foto", ""),
        },
        defecto: [
          { titulo: "Selección", texto: "Elegimos una por una cada calabaza y cada pieza de madera. Solo pasan las que tienen buen grosor y ninguna fisura.", imagen: IMG("foto-mates-color.jpg") },
          { titulo: "Tallado y forrado", texto: "Se tornea, se lija y se forra a mano. En los imperiales, el cuero se cose con puntada visible, como se hizo siempre.", imagen: IMG("foto-cuero-alpaca.jpg") },
          { titulo: "Virola y cincelado", texto: "La virola de alpaca se ajusta a cada boca y se cincela a mano. Por eso no hay dos iguales.", imagen: IMG("foto-imperial-sol.jpg") },
          { titulo: "Terminación", texto: "Revisamos cada detalle, lo protegemos por dentro y lo embalamos listo para regalar (o para estrenar esa misma tarde).", imagen: IMG("foto-grabado-papa.jpg") },
        ],
      },
    },
  },

  ritual: {
    titulo: "El ritual",
    descripcion: "La sección negra con consejos para cebar.",
    campos: {
      etiqueta: etiquetaSeccion("El ritual"),
      titulo: tituloSeccion("Cebá como *se debe*"),
      bajada: parrafo("Texto", "Cuatro reglas simples que en cualquier ronda se respetan. Cada mate sale del taller con su guía para curarlo.", 200),
      imagen: imagen("Foto", IMG("ronda.svg"), { ayuda: "Queda mejor una foto horizontal." }),
      consejos: {
        tipo: "lista",
        etiqueta: "Consejos",
        item: "Consejo",
        cantidad: 4,
        campos: {
          titulo: texto("Título", "", 40),
          texto: parrafo("Texto", "", 140),
        },
        defecto: [
          { titulo: "Agua a 75°, nunca hervida", texto: "Si el agua hierve, la yerba se quema y el mate se lava enseguida." },
          { titulo: "Yerba hasta tres cuartos", texto: "Tapá la boca con la mano, sacudí, y dejá la montañita de costado." },
          { titulo: "Primero agua tibia", texto: "Humedecé la yerba y esperá un minuto antes de clavar la bombilla." },
          { titulo: "La bombilla no se mueve", texto: "Es la regla de oro de la ronda. El que ceba es el que manda." },
        ],
      },
    },
  },

  personaliza: {
    titulo: "Personalizados",
    descripcion: "El mate donde el cliente prueba cómo queda su nombre grabado.",
    campos: {
      etiqueta: etiquetaSeccion("Personalizados"),
      titulo: tituloSeccion("Hacelo *tuyo*"),
      bajada: parrafo("Texto", "Grabamos nombres, fechas o iniciales en cada pieza. Probá cómo quedaría el tuyo:", 200),
      ejemplo: texto("Nombre de ejemplo", "Juan", 14, { ancho: "medio" }),
      imagen: imagen("Foto del mate a grabar", IMG("mate-grabado.svg"), {
        ayuda: "El grabado se dibuja a media altura: usá una foto de frente, con el mate centrado y fondo liso.",
      }),
      boton1Texto: texto("Botón 1", "Ver personalizados", 30, { ancho: "medio" }),
      boton1Link: link("Link del botón 1", "/catalogo?q=Personalizados"),
      boton2Texto: texto("Botón 2", "Escribinos", 30, { ancho: "medio" }),
      boton2Link: link("Link del botón 2", "#", { ayuda: "Ej: https://wa.me/549XXXXXXXXXX" }),
    },
  },

  galeria: {
    titulo: "Galería",
    descripcion: "El mosaico de fotos con la frase.",
    campos: {
      etiqueta: etiquetaSeccion("#MateEnRonda"),
      titulo: tituloSeccion("Momentos *compartidos*"),
      redTexto: texto("Link a redes", "(IG) Seguinos", 30, { ancho: "medio" }),
      redLink: link("A dónde lleva", "#", { ayuda: "Ej: https://instagram.com/tu_marca" }),
      frase: texto("Frase del cuadro blanco", "“El mate no es una bebida. Es una forma de *estar*.”", 110),
      fotos: {
        tipo: "lista",
        etiqueta: "Fotos",
        item: "Foto",
        cantidad: 5,
        ayuda: "La 1 es la alta y la 3 la ancha; las demás son cuadradas.",
        campos: {
          imagen: imagen("Foto", ""),
          texto: texto("Epígrafe", "", 30, { ancho: "medio" }),
          fondo: { tipo: "opciones", etiqueta: "Fondo", opciones: FONDOS, defecto: "claro", ancho: "medio" },
        },
        defecto: [
          { imagen: IMG("foto-imperial-sol.jpg"), texto: "Nuestro titular", fondo: "oscuro" },
          { imagen: IMG("foto-grabado-papa.jpg"), texto: "Para papá", fondo: "claro" },
          { imagen: IMG("ronda.svg"), texto: "La ronda", fondo: "medio" },
          { imagen: IMG("foto-cuero-alpaca.jpg"), texto: "Cuero y alpaca", fondo: "oscuro" },
          { imagen: IMG("foto-mates-color.jpg"), texto: "Con color", fondo: "claro" },
        ],
      },
    },
  },

  testimonios: {
    titulo: "Testimonios",
    descripcion: "Opiniones de clientes que van cambiando solas.",
    campos: {
      etiqueta: etiquetaSeccion("Lo que dicen"),
      items: {
        tipo: "lista",
        etiqueta: "Opiniones",
        item: "Opinión",
        min: 1,
        max: 8,
        campos: {
          texto: parrafo("Opinión", "", 240),
          autor: texto("Nombre", "", 40, { ancho: "medio" }),
          lugar: texto("Ciudad", "", 40, { ancho: "medio" }),
        },
        defecto: [
          { texto: "Lo regalé para el cumpleaños de mi viejo y no lo suelta más. Se nota que está hecho a mano, cada detalle.", autor: "Lucía M.", lugar: "Córdoba" },
          { texto: "Llegó impecable, con una tarjeta escrita a mano y las instrucciones para curarlo. Ceba de diez.", autor: "Martín G.", lugar: "Rosario" },
          { texto: "Encargué seis con el nombre de cada uno para la oficina. Ahora la ronda tiene otro nivel.", autor: "Carla R.", lugar: "CABA" },
        ],
      },
    },
  },

  cierre: {
    titulo: "Cierre",
    descripcion: "La invitación final antes del pie de página.",
    campos: {
      etiqueta: etiquetaSeccion("Tu próximo compañero"),
      titulo: {
        tipo: "lineas",
        etiqueta: "Título",
        defecto: "Encontrá el mate que\nte va a *acompañar*",
        max: 80,
        maxLineas: 3,
        ayuda: "*Entre asteriscos* va en cursiva.",
      },
      botonTexto: texto("Botón", "Ver el catálogo", 30, { ancho: "medio" }),
      botonLink: link("Link del botón", "/catalogo"),
      secundarioTexto: texto("Link secundario", "Combos para regalar", 40, { ancho: "medio" }),
      secundarioLink: link("A dónde lleva", "/catalogo?q=Combos"),
    },
  },
};

module.exports = { SECCIONES, FONDOS };
