# Base de datos

MySQL 8 o MariaDB 10.5+. Los modelos de Sequelize están en `src/model/database/models`.

## Instalar

1. Copiá `.env.example` como `.env` y completá `DB_USER`, `DB_PASSWORD` y `DB_NAME`.
2. Con MySQL encendido:

```bash
npm run db:instalar            # crea las tablas y carga los datos de prueba
npm run db:instalar -- --vacia # solo las tablas, sin datos
```

También se pueden cargar a mano: primero `schema.sql`, después `datos-prueba.sql`.

> ⚠️ Instalar borra y vuelve a crear todas las tablas.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `schema.sql` | Estructura: tablas, claves, índices y restricciones |
| `datos-prueba.sql` | Datos de prueba (usuarios, catálogo, cupones, 30 días de pedidos) |
| `instalar.js` | Ejecuta los dos archivos usando los datos del `.env` |
| `migraciones/` | Cambios para bases ya instaladas (no hace falta si instalás desde cero) |

## Migraciones

Si ya tenías la base instalada y después actualizás el proyecto, ejecutá en
orden las migraciones nuevas de `migraciones/` (en Workbench: abrir el archivo y ⚡).
No borran datos.

| Archivo | Qué cambia |
|---|---|
| `001-varias-imagenes.sql` | Crea `producto_imagenes`, pasa ahí la imagen de cada producto y quita `productos.imagen` |
| `002-notificaciones.sql` | Crea `notificaciones` (avisos de compras nuevas para el admin) |

## Tablas

| Tabla | Para qué | Relaciones |
|---|---|---|
| `usuarios` | Clientes y administradores (`rol`). `password` es un hash bcrypt, NULL en cuentas solo de Google (`google_id`) | — |
| `categorias` | Categorías del catálogo | — |
| `colores` | Colores (valor para filtros, nombre y hex) | — |
| `productos` | Catálogo: precio, **costo** (para la ganancia), stock, etiqueta, textos | → `categorias`, → `colores` |
| `producto_imagenes` | Fotos de cada producto (hasta 8). La de menor `orden` es la principal | → `productos` (se borran con el producto) |
| `especificaciones` | Ficha técnica de cada producto (clave / valor) | → `productos` (se borra con el producto) |
| `favoritos` | Productos guardados por cada usuario | → `usuarios`, → `productos` |
| `cupones` | Códigos de descuento (porcentaje, activo, vencimiento) | — |
| `pedidos` | Compras: cliente, entrega, facturación, medio de pago, estado e importes (subtotal, descuento, envío, total, costo, ganancia). El `id` es el número de pedido (arranca en 1001) | → `usuarios` (NULL si compró como invitado) |
| `notificaciones` | Avisos para los admins: compra nueva o producto con poco stock. `leida` se comparte entre admins | → `pedidos`, → `productos` (quedan en NULL si se borran) |
| `pedido_items` | Renglones de cada pedido. Copia nombre, precio y costo al comprar, así la ganancia histórica no cambia si después se edita el producto | → `pedidos`, → `productos` (NULL si el producto se borró) |

El carrito y los favoritos de quien no inició sesión se guardan en la sesión, no en la base.

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | demo@tienda.com | Demo1234 |
| Admin | admin@tienda.com | Admin1234 |
