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

## Tablas

| Tabla | Para qué | Relaciones |
|---|---|---|
| `usuarios` | Clientes y administradores (`rol`). `password` es un hash bcrypt, NULL en cuentas solo de Google (`google_id`) | — |
| `categorias` | Categorías del catálogo | — |
| `colores` | Colores (valor para filtros, nombre y hex) | — |
| `productos` | Catálogo: precio, **costo** (para la ganancia), stock, etiqueta, imagen, textos | → `categorias`, → `colores` |
| `especificaciones` | Ficha técnica de cada producto (clave / valor) | → `productos` (se borra con el producto) |
| `favoritos` | Productos guardados por cada usuario | → `usuarios`, → `productos` |
| `cupones` | Códigos de descuento (porcentaje, activo, vencimiento) | — |
| `pedidos` | Compras: cliente, entrega, facturación, medio de pago, estado e importes (subtotal, descuento, envío, total, costo, ganancia). El `id` es el número de pedido (arranca en 1001) | → `usuarios` (NULL si compró como invitado) |
| `pedido_items` | Renglones de cada pedido. Copia nombre, precio y costo al comprar, así la ganancia histórica no cambia si después se edita el producto | → `pedidos`, → `productos` (NULL si el producto se borró) |

El carrito y los favoritos de quien no inició sesión se guardan en la sesión, no en la base.

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | demo@tienda.com | Demo1234 |
| Admin | admin@tienda.com | Admin1234 |
