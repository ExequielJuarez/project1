-- ==========================================================
-- SANTIAGO MATES — Datos de prueba
--
-- Cargar DESPUÉS de schema.sql (borra y vuelve a cargar todo).
-- Las fechas de los pedidos son relativas al momento de la carga
-- (CURDATE() - INTERVAL n DAY / NOW() - INTERVAL n MINUTE), así el
-- panel siempre muestra ventas recientes sin importar cuándo se cargue.
--
-- Usuarios de prueba:
--   Cliente  demo@tienda.com   /  Demo1234
--   Admin    admin@tienda.com  /  Admin1234
--
-- Uso:  npm run db:instalar   (carga schema.sql + este archivo)
--   o:  mysql -u root -p tienda_mates < database/datos-prueba.sql
-- ==========================================================

USE tienda_mates;

-- Acentos bien guardados aunque el cliente de MySQL no esté en UTF-8
SET NAMES utf8mb4;
-- Misma zona horaria que usa la app (DB_TIMEZONE en el .env), para que
-- CURDATE() y las fechas de los pedidos coincidan con el panel
SET time_zone = '-03:00';

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notificaciones;
TRUNCATE TABLE pedido_items;
TRUNCATE TABLE pedidos;
TRUNCATE TABLE favoritos;
TRUNCATE TABLE especificaciones;
TRUNCATE TABLE producto_imagenes;
TRUNCATE TABLE producto_colores;
TRUNCATE TABLE producto_colores;
TRUNCATE TABLE productos;
TRUNCATE TABLE colores;
TRUNCATE TABLE categorias;
TRUNCATE TABLE cupones;
TRUNCATE TABLE usuarios;
SET FOREIGN_KEY_CHECKS = 1;
ALTER TABLE pedidos AUTO_INCREMENT = 1001;

-- ── Usuarios ─────────────────────────────────────────────
INSERT INTO usuarios (id, nombre, apellido, email, telefono, password, google_id, rol, newsletter) VALUES
  (1, 'Cliente', 'Demo', 'demo@tienda.com', '11 5555 4444', '$2b$10$jX3V6AhKp.Par41X/kOWfelfguSzaU4z/IZkvYOv0UHGBQ/6Rl2Oy', NULL, 'cliente', 1),
  (2, 'Admin', 'Tienda', 'admin@tienda.com', NULL, '$2b$10$OUwf1N16MEgHBa5jhFt6K.cGjo4yUyiF/cOwUOBsyttSBQqgwMRYq', NULL, 'admin', 0),
  (3, 'Ana', 'Pérez', 'ana.perez@gmail.com', NULL, NULL, 'demo-ana.perez@gmail.com', 'cliente', 0),
  (4, 'Super', 'Admin', 'super@tienda.com', NULL, '$2b$10$AhElj/1kwG2mSrQCEpRKI.eaaUIicEpYgvqxK2sckmrfVXodWJpke', NULL, 'superadmin', 0);

-- ── Categorías y colores ────────────────────────────────
INSERT INTO categorias (id, nombre, orden) VALUES
  (1, 'Mates', 1),
  (2, 'Termos', 2),
  (3, 'Bombillas', 3),
  (4, 'Bolsos materos', 4),
  (5, 'Combos', 5),
  (6, 'Yerbas', 6);

INSERT INTO colores (id, valor, nombre, hex, orden) VALUES
  (1, 'negro', 'Negro', '#1f1a17', 1),
  (2, 'marron', 'Marrón', '#6b4226', 2),
  (3, 'suela', 'Suela', '#b07a46', 3),
  (4, 'natural', 'Natural', '#d9c3a0', 4),
  (5, 'rojo', 'Rojo', '#8e1f1f', 5),
  (6, 'plateado', 'Plateado', '#b9b9b4', 6),
  (7, 'azul-marino', 'Azul marino', '#1f2c4d', 7),
  (8, 'blanco', 'Blanco', '#f2efe9', 8),
  (9, 'bordo', 'Bordó', '#7a1f2b', 9),
  (10, 'celeste', 'Celeste', '#b9d3e3', 10);

-- ── Productos (fotos en public/img/productos) ───────────
INSERT INTO productos (id, nombre, categoria_id, color_id, precio, costo, stock, etiqueta, resumen, descripcion, destacados) VALUES
  (1, 'Torpedo Argentino', 1, 1, 68000, 34000, 8, 'Más vendido', 'Nuestro titular: no es solo un mate. Forrado en cuero croco con virola de alpaca maciza y el sol de bronce cincelado.', 'El torpedo que no puede faltar en la ronda. Calabaza seleccionada, forrada en cuero croco y terminada a mano con virola de alpaca maciza al lacre.

El aplique de bronce cincelado con el sol y la base de alpaca al lacre le dan firmeza y un acabado que dura toda la vida.', 'Virola de alpaca maciza al lacre
Forrado en cuero croco
Aplique de bronce cincelado
Base de alpaca al lacre'),
  (2, 'Torpedo Premium Argentina', 1, 1, 85000, 42000, 5, 'Exclusivo', 'Edición premium con el 10 en bronce: cuero croco, virola de alpaca cincelada y terminaciones de lujo.', 'Un torpedo pensado para los que viven la celeste y blanca. Forrado en cuero croco y coronado con una virola de alpaca cincelada a mano.

El aplique de bronce con el número 10 lo convierte en una pieza de colección.', 'Aplique de bronce con el 10
Forrado en cuero croco
Virola de alpaca cincelada
Pieza de colección'),
  (3, 'Imperial Premium Argentina', 1, 1, 78000, 39000, 6, 'Nuevo', 'El clásico imperial con virola y guarda de alpaca, forrado en cuero croco y el sol de bronce.', 'El imperial de siempre, llevado a su versión más premium. Virola y guarda de alpaca trabajadas a mano y forrado en cuero croco.

El aplique de bronce con el sol completa una pieza elegante para regalar o para disfrutar todos los días.', 'Virola y guarda de alpaca
Forrado en cuero croco
Aplique de bronce
Hecho 100% a mano'),
  (4, 'Torpedo Uruguayo', 1, 1, 62000, 30000, 10, NULL, 'Boca ancha al estilo uruguayo, con virola de alpaca cincelada y aro de bronce.', 'El torpedo uruguayo tiene boca ancha y cuerpo firme para cebar cómodo. Va forrado en cuero y lleva virola de alpaca cincelada.

El aro de bronce le da el contraste justo. Un mate para usar todos los días.', 'Virola de alpaca cincelada
Aro de bronce
Forrado en cuero
Boca ancha'),
  (5, 'Torpedo Roma de Calabaza', 1, 5, 74000, 36000, 4, 'Últimas unidades', 'Calabaza forrada en cuero repujado, virola de alpaca labrada y patitas de alpaca en la base.', 'El Torpedo Roma combina el cuero repujado con una virola de alpaca labrada que se luce en cada cebada.

La base lleva patitas de alpaca, así el mate queda firme sobre la mesa.', 'Cuero repujado a mano
Virola de alpaca labrada
Base con patitas de alpaca
Calabaza seleccionada'),
  (6, 'Mate Exclusivo Criollo', 1, 4, 58000, 28000, 7, NULL, 'Bien de campo: base de cuero crudo con costura de tiento y virola de alpaca.', 'Un mate con alma criolla. La base va forrada en cuero crudo y cosida a mano con tiento, como se hacía siempre.

La virola de alpaca le da la terminación. Por ser cuero natural, cada pieza tiene su propio tono.', 'Base de cuero crudo
Costura de tiento a mano
Virola de alpaca
Cada pieza es única'),
  (7, 'Bombillón de Alpaca Tatuado', 3, 6, 45000, 22000, 12, 'Exclusivo', 'Bombillón de alpaca con el cuerpo tatuado a mano y pico de bronce.', 'Un bombillón de alpaca con el cuerpo grabado a mano, trazo por trazo.

La paleta ancha filtra bien la yerba y el pico de bronce le da el toque final.', 'Alpaca de primera calidad
Cuerpo tatuado a mano
Pico de bronce
Paleta ancha'),
  (8, 'Bombillón de Alpaca Joyero', 3, 6, 52000, 25000, 8, NULL, 'Bombillón de alpaca con virola cincelada, terminación de joyería y pico de bronce.', 'El bombillón joyero lleva una virola cincelada con terminación de joyería.

Alpaca de primera y pico de bronce: una pieza para lucir en la ronda.', 'Alpaca de primera calidad
Virola cincelada estilo joyero
Pico de bronce
Paleta ancha'),
  (9, 'Bombillón de Alpaca Hoja', 3, 6, 48000, 23000, 10, NULL, 'Bombillón de alpaca con detalle de hoja cincelada y pico de bronce.', 'Un bombillón de alpaca con una hoja cincelada a mano en el cuerpo.

Pico de bronce y paleta ancha que filtra bien: liviano, firme y para toda la vida.', 'Alpaca de primera calidad
Detalle de hoja cincelada
Pico de bronce
Paleta ancha'),
  (10, 'Combo Línea Hudson', 5, 7, 189000, 105000, 4, 'Nuevo', 'El equipo completo para llevar a todos lados: canasta, portabombilla, termo, mate y bombilla de acero Hudson.', 'La Línea Hudson es el equipo matero completo para salir. Trae la canasta Hudson acolchada, el portabombilla, el termo Hudson de acero y el mate con bombilla de acero.

Todo combinado en azul marino con detalles de cuero suela. Es ideal para regalar o para tener el mate siempre listo.', 'Canasta Hudson acolchada
Termo Hudson de acero inoxidable
Mate y bombilla de acero Hudson
Portabombilla incluido'),
  (11, 'Combo del 10', 5, 1, 165000, 90000, 5, 'Edición limitada', 'Para disfrutar cada previa: termo antiderrame del 10, mate imperial con alpaca premium y bombilla pico de loro.', 'El Combo del 10 es para los que viven el fútbol con un mate en la mano. Trae el termo antiderrame con el 10, el mate imperial con alpaca premium y la bombilla pico de loro.

Va todo en negro con detalles en alpaca. Es un regalo que no falla.', 'Termo antiderrame del 10
Mate imperial con alpaca premium
Bombilla pico de loro
Ideal para regalar'),
  (12, 'Termo Stanley Mate System', 2, 1, 135000, 95000, 5, 'Nuevo', 'Termo Stanley de acero inoxidable con pico cebador y vaso de acero: el agua a punto durante toda la ronda.', 'Un termo de acero inoxidable con doble pared, pensado para el mate. El pico cebador deja caer el agua justa y no te quema la yerba.

Trae un vaso de acero en la tapa y una manija firme. Viene en su caja, listo para regalar.', 'Acero inoxidable de doble pared
Pico cebador para mate
Vaso de acero incluido
Manija lateral'),
  (13, 'Termo Termolar R-Evolution', 2, 9, 72000, 48000, 6, NULL, 'Garrafa térmica Termolar de acero inoxidable con pico cebador y manija.', 'El R-Evolution de Termolar es una garrafa térmica de acero inoxidable que mantiene el agua caliente por horas.

Tiene pico cebador para el mate y una manija cómoda para llevarlo a todos lados.', 'Marca Termolar
Acero inoxidable
Pico cebador
Manija lateral'),
  (14, 'Termo Mate-Tereré', 2, 1, 58000, 38000, 8, NULL, 'Termo compacto para mate y tereré, con tapa de pico y aro dorado.', 'Un termo compacto y liviano que sirve para el mate caliente y para el tereré bien frío.

La tapa con pico permite cebar sin derrames. Es ideal para llevar en la mochila.', 'Sirve para mate y tereré
Tapa con pico cebador
Compacto y liviano
Detalle de aro dorado'),
  (15, 'Bolso Matero Blanco', 4, 8, 65000, 38000, 4, 'Nuevo', 'Bolso matero de cuero sintético blanco con cierre y tira para colgar: entra el termo, el mate y la yerba.', 'Un bolso matero prolijo y canchero, en cuero sintético blanco con vivos negros.

Tiene cierre de punta a punta y una tira para llevarlo colgado. Entran el termo, el mate, la bombilla y el yerbero.', 'Cuero sintético blanco
Cierre de punta a punta
Tira para colgar
Entra el equipo completo'),
  (16, 'Canasta Matera Hudson', 4, 7, 75000, 45000, 5, NULL, 'La canasta acolchada de la Línea Hudson, sola: azul marino con detalles de cuero suela.', 'La misma canasta que viene en el Combo Línea Hudson, ahora por separado. Es acolchada, en azul marino, con manija y detalles de cuero suela.

Entran el termo, el mate y el yerbero, y va firme a todos lados.', 'Tela acolchada
Detalles de cuero suela
Manija firme
Entra el equipo completo'),
  (17, 'Combo Tradicional', 5, 1, 145000, 85000, 4, NULL, 'Mate imperial forrado en cuero, canasta de cuero premium, bombilla a elección y yerbero de cuero gamuzado.', 'El combo de siempre para arrancar con todo. Trae un mate imperial forrado en cuero, la canasta de cuero premium y el yerbero de cuero gamuzado.

La bombilla la elegís vos: escribinos al comprar cuál preferís.', 'Mate imperial forrado en cuero
Canasta de cuero premium
Bombilla a elección
Yerbero de cuero gamuzado'),
  (18, 'Combo Campestre', 5, 3, 160000, 95000, 4, NULL, 'Torpedo imperial de calabaza, canasta “Sol de Mayo”, bombilla a elección, yerbero de cuero y yerba Rei Verde 1 kg.', 'Un combo con aire de campo: mate torpedo imperial de calabaza forrado en cuero y canasta de cuero premium con el diseño “Sol de Mayo”.

Suma yerbero de cuero, bombilla a elección y un paquete de yerba Rei Verde tradicional de 1 kg.', 'Mate torpedo imperial de calabaza
Canasta de cuero “Sol de Mayo”
Yerbero de cuero
Yerba Rei Verde 1 kg'),
  (19, 'Combo Pasión Futbolera', 5, 1, 210000, 125000, 3, 'Edición limitada', 'Mochila térmica pelota, termo, mate imperial y bombillón de alpaca, todo edición “Campeón del Mundo”.', 'Para los que siguen festejando. Trae la mochila térmica reforzada con diseño de pelota y el termo edición “Campeón del Mundo”.

Se completa con el mate imperial y el bombillón de alpaca de la misma edición.', 'Mochila térmica reforzada (pelota)
Termo “Campeón del Mundo”
Mate imperial “Campeón del Mundo”
Bombillón de alpaca'),
  (20, 'Combo Total Black', 5, 1, 230000, 140000, 3, 'Exclusivo', 'Termo System Quantium, canasta de cuero premium, imperial en cuero, yerbero y azucarero, y bombilla pico de loro.', 'Todo en negro, de punta a punta. Trae el termo “System Quantium”, la canasta de cuero premium y un imperial forrado en cuero.

Suma yerbero y azucarero a elección y una bombilla pico de loro también a elección.', 'Termo “System Quantium”
Canasta de cuero premium
Imperial forrado en cuero
Yerbero, azucarero y bombilla a elección'),
  (21, 'Yerba Mate Rojo “10” 500 g', 6, 4, 7500, 5000, 30, NULL, 'La edición especial del 10 de Mate Rojo (Mate Pampa), en paquete de 500 g.', 'Yerba mate Mate Rojo de Mate Pampa, en su edición especial con el 10.

Paquete de 500 g.', 'Edición especial “10”
Mate Pampa · Mate Rojo
Paquete de 500 g'),
  (22, 'Yerba Verdecita Selección Especial', 6, 4, 8500, 6000, 25, NULL, 'Yerba elaborada despalada, padrón uruguayo: molienda fina y sabor intenso.', 'Verdecita Selección Especial es una yerba elaborada despalada, de padrón uruguayo.

Tiene molienda fina y sabor intenso, para los que toman mate bien cargado.', 'Elaborada despalada
Padrón uruguayo
Sabor intenso'),
  (23, 'Yerba Rei Verde Export 500 g', 6, 4, 9500, 6800, 25, NULL, 'Rei Verde Export, “o sabor da tradição”: yerba brasileña de molienda fina en paquete de 500 g.', 'Rei Verde Export es una yerba mate brasileña de molienda fina y color verde intenso.

Paquete de 500 g.', 'Yerba brasileña
Molienda fina
Paquete de 500 g'),
  (24, 'Yerba Baldo 5 kg', 6, 4, 52000, 40000, 10, 'Más vendido', 'La clásica Baldo de padrón uruguayo en bolsa de 5 kg, para la ronda de todos los días.', 'Baldo es una de las yerbas de padrón uruguayo más elegidas: molienda fina y sabor fuerte.

Viene en bolsa de 5 kg, que rinde para muchas rondas.', 'Padrón uruguayo
Sabor fuerte
Bolsa de 5 kg'),
  (25, 'Yerba Canarias 1 kg', 6, 4, 14500, 10500, 20, NULL, 'Canarias Sabor Tradicional, la yerba uruguaya de siempre, en paquete de 1 kg.', 'Canarias Sabor Tradicional es la yerba uruguaya de siempre: molienda fina y sabor intenso.

Paquete de 1 kg.', 'Sabor tradicional
Padrón uruguayo
Paquete de 1 kg');

-- Colores en que se vende cada producto (el primero es el principal)
INSERT INTO producto_colores (producto_id, color_id, orden) VALUES
  (1, 1, 0),
  (1, 2, 1),
  (2, 1, 0),
  (3, 1, 0),
  (3, 6, 1),
  (4, 1, 0),
  (5, 5, 0),
  (5, 2, 1),
  (5, 1, 2),
  (6, 4, 0),
  (6, 3, 1),
  (7, 6, 0),
  (8, 6, 0),
  (9, 6, 0),
  (10, 7, 0),
  (11, 1, 0),
  (12, 1, 0),
  (13, 9, 0),
  (14, 1, 0),
  (14, 10, 1),
  (15, 8, 0),
  (16, 7, 0),
  (17, 1, 0),
  (18, 3, 0),
  (19, 1, 0),
  (20, 1, 0),
  (21, 4, 0),
  (22, 4, 0),
  (23, 4, 0),
  (24, 4, 0),
  (25, 4, 0);

-- Fotos de cada producto (la de orden 0 es la principal)
INSERT INTO producto_imagenes (producto_id, ruta, orden) VALUES
  (1, '/img/productos/torpedo-argentino-1.jpg', 0),
  (1, '/img/productos/torpedo-argentino-2.jpg', 1),
  (2, '/img/productos/torpedo-premium-argentina-1.jpg', 0),
  (2, '/img/productos/torpedo-premium-argentina-2.jpg', 1),
  (3, '/img/productos/imperial-premium-argentina-1.jpg', 0),
  (3, '/img/productos/imperial-premium-argentina-2.jpg', 1),
  (4, '/img/productos/torpedo-uruguayo-1.jpg', 0),
  (4, '/img/productos/torpedo-uruguayo-2.jpg', 1),
  (5, '/img/productos/torpedo-roma-calabaza-1.jpg', 0),
  (5, '/img/productos/torpedo-roma-calabaza-2.jpg', 1),
  (5, '/img/productos/torpedo-roma-calabaza-3.jpg', 2),
  (5, '/img/productos/torpedo-roma-calabaza-4.jpg', 3),
  (6, '/img/productos/mate-exclusivo-criollo-1.jpg', 0),
  (6, '/img/productos/mate-exclusivo-criollo-2.jpg', 1),
  (6, '/img/productos/mate-exclusivo-criollo-3.jpg', 2),
  (7, '/img/productos/bombillon-tatuado.jpg', 0),
  (8, '/img/productos/bombillon-joyero.jpg', 0),
  (9, '/img/productos/bombillon-hoja.jpg', 0),
  (10, '/img/productos/combo-linea-hudson-1.jpg', 0),
  (10, '/img/productos/combo-linea-hudson-2.jpg', 1),
  (10, '/img/productos/combo-linea-hudson-3.jpg', 2),
  (10, '/img/productos/combo-linea-hudson-4.jpg', 3),
  (10, '/img/productos/combo-linea-hudson-5.jpg', 4),
  (10, '/img/productos/combo-linea-hudson-6.jpg', 5),
  (10, '/img/productos/combo-linea-hudson-7.jpg', 6),
  (11, '/img/productos/combo-del-10-1.jpg', 0),
  (11, '/img/productos/combo-del-10-2.jpg', 1),
  (12, '/img/productos/termo-mate-system-1.webp', 0),
  (12, '/img/productos/termo-mate-system-2.webp', 1),
  (12, '/img/productos/termo-mate-system-3.webp', 2),
  (13, '/img/productos/termo-termolar-r-evolution-1.webp', 0),
  (13, '/img/productos/termo-termolar-r-evolution-2.webp', 1),
  (14, '/img/productos/termo-mate-terere-1.webp', 0),
  (14, '/img/productos/termo-mate-terere-2.webp', 1),
  (14, '/img/productos/termo-mate-terere-3.webp', 2),
  (15, '/img/productos/bolso-matero-blanco-1.jpg', 0),
  (15, '/img/productos/bolso-matero-blanco-2.jpg', 1),
  (15, '/img/productos/bolso-matero-blanco-3.jpg', 2),
  (16, '/img/productos/bolso-canasta-hudson-1.jpg', 0),
  (16, '/img/productos/bolso-canasta-hudson-2.jpg', 1),
  (17, '/img/productos/combo-tradicional.jpg', 0),
  (18, '/img/productos/combo-campestre.jpg', 0),
  (19, '/img/productos/combo-pasion-futbolera.jpg', 0),
  (20, '/img/productos/combo-total-black.jpg', 0),
  (21, '/img/productos/yerba-mate-rojo-10.webp', 0),
  (22, '/img/productos/yerba-verdecita.webp', 0),
  (23, '/img/productos/yerba-rei-verde-export.webp', 0),
  (24, '/img/productos/yerba-baldo-1.jpg', 0),
  (24, '/img/productos/yerba-baldo-2.jpg', 1),
  (24, '/img/productos/yerba-baldo-3.jpg', 2),
  (25, '/img/productos/yerba-canarias-1.jpg', 0),
  (25, '/img/productos/yerba-canarias-2.jpg', 1),
  (25, '/img/productos/yerba-canarias-3.jpg', 2);

-- ── Ficha técnica de cada producto ──────────────────────
INSERT INTO especificaciones (producto_id, clave, valor, orden) VALUES
  (1, 'Tipo', 'Torpedo', 1),
  (1, 'Material', 'Calabaza forrada en cuero croco', 2),
  (1, 'Virola', 'Alpaca maciza al lacre', 3),
  (1, 'Aplique', 'Bronce cincelado', 4),
  (1, 'Base', 'Alpaca al lacre', 5),
  (1, 'Origen', 'Hecho a mano en Argentina', 6),
  (2, 'Tipo', 'Torpedo', 1),
  (2, 'Material', 'Calabaza forrada en cuero croco', 2),
  (2, 'Virola', 'Alpaca cincelada', 3),
  (2, 'Aplique', 'Bronce', 4),
  (2, 'Origen', 'Hecho a mano en Argentina', 5),
  (3, 'Tipo', 'Imperial', 1),
  (3, 'Material', 'Calabaza forrada en cuero croco', 2),
  (3, 'Virola', 'Alpaca', 3),
  (3, 'Aplique', 'Bronce', 4),
  (3, 'Origen', 'Hecho a mano en Argentina', 5),
  (4, 'Tipo', 'Torpedo uruguayo', 1),
  (4, 'Material', 'Calabaza forrada en cuero', 2),
  (4, 'Virola', 'Alpaca cincelada', 3),
  (4, 'Aro', 'Bronce', 4),
  (4, 'Origen', 'Hecho a mano en Argentina', 5),
  (5, 'Tipo', 'Torpedo', 1),
  (5, 'Material', 'Calabaza forrada en cuero repujado', 2),
  (5, 'Virola', 'Alpaca labrada', 3),
  (5, 'Base', 'Patitas de alpaca', 4),
  (5, 'Origen', 'Hecho a mano en Argentina', 5),
  (6, 'Tipo', 'Criollo', 1),
  (6, 'Material', 'Calabaza con base de cuero crudo', 2),
  (6, 'Costura', 'Tiento', 3),
  (6, 'Virola', 'Alpaca', 4),
  (6, 'Origen', 'Hecho a mano en Argentina', 5),
  (7, 'Material', 'Alpaca', 1),
  (7, 'Terminación', 'Tatuado a mano', 2),
  (7, 'Pico', 'Bronce', 3),
  (7, 'Origen', 'Hecho a mano en Argentina', 4),
  (8, 'Material', 'Alpaca', 1),
  (8, 'Terminación', 'Cincelado joyero', 2),
  (8, 'Pico', 'Bronce', 3),
  (8, 'Origen', 'Hecho a mano en Argentina', 4),
  (9, 'Material', 'Alpaca', 1),
  (9, 'Terminación', 'Hoja cincelada', 2),
  (9, 'Pico', 'Bronce', 3),
  (9, 'Origen', 'Hecho a mano en Argentina', 4),
  (10, 'Incluye', 'Canasta, portabombilla, termo, mate y bombilla', 1),
  (10, 'Termo', 'Acero inoxidable Hudson', 2),
  (10, 'Mate', 'Acero inoxidable', 3),
  (10, 'Bombilla', 'Acero inoxidable', 4),
  (10, 'Bolso', 'Tela acolchada con detalles de cuero', 5),
  (11, 'Incluye', 'Termo, mate imperial y bombilla', 1),
  (11, 'Termo', 'Antiderrame', 2),
  (11, 'Mate', 'Imperial con alpaca premium', 3),
  (11, 'Bombilla', 'Pico de loro', 4),
  (12, 'Marca', 'Stanley', 1),
  (12, 'Material', 'Acero inoxidable', 2),
  (12, 'Pico', 'Cebador para mate', 3),
  (12, 'Incluye', 'Vaso de acero y caja', 4),
  (12, 'Color', 'Negro', 5),
  (13, 'Marca', 'Termolar', 1),
  (13, 'Modelo', 'R-Evolution', 2),
  (13, 'Material', 'Acero inoxidable', 3),
  (13, 'Pico', 'Cebador', 4),
  (14, 'Uso', 'Mate y tereré', 1),
  (14, 'Tapa', 'Con pico cebador', 2),
  (14, 'Material', 'Acero inoxidable', 3),
  (15, 'Material', 'Cuero sintético', 1),
  (15, 'Cierre', 'Cremallera', 2),
  (15, 'Lleva', 'Termo, mate, bombilla y yerbero', 3),
  (16, 'Material', 'Tela acolchada con detalles de cuero', 1),
  (16, 'Color', 'Azul marino', 2),
  (16, 'Línea', 'Hudson', 3),
  (17, 'Incluye', 'Mate, canasta, bombilla y yerbero', 1),
  (17, 'Mate', 'Imperial forrado en cuero', 2),
  (17, 'Canasta', 'Cuero premium', 3),
  (17, 'Yerbero', 'Cuero gamuzado', 4),
  (18, 'Incluye', 'Mate, canasta, bombilla, yerbero y yerba', 1),
  (18, 'Mate', 'Torpedo imperial de calabaza (cuero)', 2),
  (18, 'Canasta', 'Cuero premium “Sol de Mayo”', 3),
  (18, 'Yerba', 'Rei Verde tradicional 1 kg', 4),
  (19, 'Incluye', 'Mochila, termo, mate y bombillón', 1),
  (19, 'Edición', 'Campeón del Mundo', 2),
  (19, 'Mochila', 'Térmica reforzada', 3),
  (19, 'Bombillón', 'Alpaca', 4),
  (20, 'Incluye', 'Termo, canasta, mate, yerbero, azucarero y bombilla', 1),
  (20, 'Termo', 'System Quantium', 2),
  (20, 'Mate', 'Imperial forrado en cuero', 3),
  (20, 'Bombilla', 'Pico de loro', 4),
  (21, 'Marca', 'Mate Rojo (Mate Pampa)', 1),
  (21, 'Peso', '500 g', 2),
  (22, 'Marca', 'Verdecita', 1),
  (22, 'Tipo', 'Despalada · padrón uruguayo', 2),
  (23, 'Marca', 'Rei Verde', 1),
  (23, 'Línea', 'Export', 2),
  (23, 'Peso', '500 g', 3),
  (24, 'Marca', 'Baldo', 1),
  (24, 'Tipo', 'Padrón uruguayo', 2),
  (24, 'Peso', '5 kg', 3),
  (25, 'Marca', 'Canarias', 1),
  (25, 'Línea', 'Sabor tradicional', 2),
  (25, 'Peso', '1 kg', 3);

-- ── Cupones ─────────────────────────────────────────────
INSERT INTO cupones (codigo, descripcion, porcentaje, activo, vence_en) VALUES
  ('BIENVENIDA', '10% off en tu primera compra', 0.1000, 1, NULL),
  ('MAQUETA5', '5% off de prueba', 0.0500, 1, NULL),
  ('VERANO20', '20% off de temporada (vencido)', 0.2000, 1, CURDATE() - INTERVAL 10 DAY);

-- ── Favoritos del cliente demo ──────────────────────────
INSERT INTO favoritos (usuario_id, producto_id) VALUES
  (1, 2),
  (1, 5),
  (1, 11);

-- ── Pedidos de los últimos 30 días (80) ─────────────────
INSERT INTO pedidos (id, usuario_id, cliente, email, telefono, entrega, calle, altura, piso, codigo_postal, ciudad, provincia, medio_pago, estado, subtotal, descuento, envio, total, costo, ganancia, creado_en) VALUES
  (1001, 1, 'Cliente Demo', 'demo@tienda.com', '11 47926919', 'domicilio', 'Av. Siempre Viva', '2837', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 114000, 0, 6500, 120500, 70000, 44000, TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '18:41:00')),
  (1002, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 47934838', 'domicilio', 'Av. Siempre Viva', '2874', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 58000, 5800, 6500, 58700, 28000, 24200, TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '13:10:00')),
  (1003, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 47942757', 'domicilio', 'Av. Siempre Viva', '2911', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'entregado', 135000, 13500, 6500, 128000, 95000, 26500, TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '10:15:00')),
  (1004, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 47950676', 'domicilio', 'Av. Siempre Viva', '2948', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 7500, 0, 6500, 14000, 5000, 2500, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '11:01:00')),
  (1005, NULL, 'Mateo Sánchez', 'mateo.sanchez@mail.com', '11 47958595', 'domicilio', 'Av. Siempre Viva', '2985', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 145000, 0, 6500, 151500, 85000, 60000, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '17:41:00')),
  (1006, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 47966514', 'domicilio', 'Av. Siempre Viva', '3022', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 127000, 0, 6500, 133500, 85000, 42000, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:16:00')),
  (1007, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 47974433', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 264000, 0, 0, 264000, 150000, 114000, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '13:14:00')),
  (1008, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 47982352', 'domicilio', 'Av. Siempre Viva', '3096', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 9500, 0, 6500, 16000, 6800, 2700, TIMESTAMP(CURDATE() - INTERVAL 27 DAY, '14:18:00')),
  (1009, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 47990271', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 58000, 0, 0, 58000, 28000, 30000, TIMESTAMP(CURDATE() - INTERVAL 27 DAY, '17:33:00')),
  (1010, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 47998190', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 78000, 0, 0, 78000, 39000, 39000, TIMESTAMP(CURDATE() - INTERVAL 26 DAY, '11:17:00')),
  (1011, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48006109', 'domicilio', 'Av. Siempre Viva', '3207', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'entregado', 74000, 7400, 6500, 73100, 36000, 30600, TIMESTAMP(CURDATE() - INTERVAL 25 DAY, '15:41:00')),
  (1012, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48014028', 'domicilio', 'Av. Siempre Viva', '3244', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'entregado', 160000, 16000, 0, 144000, 95000, 49000, TIMESTAMP(CURDATE() - INTERVAL 25 DAY, '20:44:00')),
  (1013, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48021947', 'domicilio', 'Av. Siempre Viva', '3281', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 263000, 0, 0, 263000, 141000, 122000, TIMESTAMP(CURDATE() - INTERVAL 25 DAY, '17:41:00')),
  (1014, 1, 'Cliente Demo', 'demo@tienda.com', '11 48029866', 'domicilio', 'Av. Siempre Viva', '3318', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 54500, 5450, 6500, 55550, 28800, 20250, TIMESTAMP(CURDATE() - INTERVAL 24 DAY, '20:27:00')),
  (1015, NULL, 'Martín Gómez', 'martin.gomez@mail.com', '11 48037785', 'domicilio', 'Av. Siempre Viva', '3355', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 189000, 0, 0, 189000, 105000, 84000, TIMESTAMP(CURDATE() - INTERVAL 24 DAY, '13:57:00')),
  (1016, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48045704', 'domicilio', 'Av. Siempre Viva', '3392', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'entregado', 74000, 7400, 6500, 73100, 36000, 30600, TIMESTAMP(CURDATE() - INTERVAL 24 DAY, '15:30:00')),
  (1017, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48053623', 'domicilio', 'Av. Siempre Viva', '3429', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 58000, 0, 6500, 64500, 28000, 30000, TIMESTAMP(CURDATE() - INTERVAL 23 DAY, '14:49:00')),
  (1018, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48061542', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'entregado', 62000, 6200, 0, 55800, 30000, 25800, TIMESTAMP(CURDATE() - INTERVAL 22 DAY, '15:42:00')),
  (1019, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 48069461', 'domicilio', 'Av. Siempre Viva', '3503', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 8500, 0, 6500, 15000, 6000, 2500, TIMESTAMP(CURDATE() - INTERVAL 22 DAY, '14:22:00')),
  (1020, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48077380', 'domicilio', 'Av. Siempre Viva', '3540', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 189000, 0, 0, 189000, 105000, 84000, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '20:30:00')),
  (1021, NULL, 'Juan Pérez', 'juan.perez@mail.com', '11 48085299', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 52000, 0, 0, 52000, 40000, 12000, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '10:54:00')),
  (1022, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48093218', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 62000, 0, 0, 62000, 30000, 32000, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '20:44:00')),
  (1023, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48101137', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'entregado', 58000, 5800, 0, 52200, 28000, 24200, TIMESTAMP(CURDATE() - INTERVAL 21 DAY, '19:51:00')),
  (1024, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48109056', 'domicilio', 'Av. Siempre Viva', '3688', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'entregado', 8500, 850, 6500, 14150, 6000, 1650, TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '19:52:00')),
  (1025, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48116975', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 68000, 0, 0, 68000, 34000, 34000, TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '16:16:00')),
  (1026, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48124894', 'domicilio', 'Av. Siempre Viva', '3762', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 130000, 0, 6500, 136500, 64000, 66000, TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '13:36:00')),
  (1027, 1, 'Cliente Demo', 'demo@tienda.com', '11 48132813', 'domicilio', 'Av. Siempre Viva', '3799', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 104000, 0, 6500, 110500, 65000, 39000, TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '16:36:00')),
  (1028, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48140732', 'domicilio', 'Av. Siempre Viva', '3836', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'entregado', 9500, 950, 6500, 15050, 6800, 1750, TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '20:23:00')),
  (1029, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48148651', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 74000, 0, 0, 74000, 36000, 38000, TIMESTAMP(CURDATE() - INTERVAL 18 DAY, '17:28:00')),
  (1030, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48156570', 'domicilio', 'Av. Siempre Viva', '3910', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'entregado', 126000, 12600, 6500, 119900, 72000, 41400, TIMESTAMP(CURDATE() - INTERVAL 17 DAY, '21:24:00')),
  (1031, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48164489', 'domicilio', 'Av. Siempre Viva', '3947', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'cancelado', 48000, 0, 6500, 54500, 23000, 25000, TIMESTAMP(CURDATE() - INTERVAL 17 DAY, '18:44:00')),
  (1032, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48172408', 'domicilio', 'Av. Siempre Viva', '3984', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 62000, 0, 6500, 68500, 30000, 32000, TIMESTAMP(CURDATE() - INTERVAL 17 DAY, '13:32:00')),
  (1033, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48180327', 'domicilio', 'Av. Siempre Viva', '4021', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'entregado', 85000, 8500, 6500, 83000, 42000, 34500, TIMESTAMP(CURDATE() - INTERVAL 16 DAY, '12:56:00')),
  (1034, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48188246', 'domicilio', 'Av. Siempre Viva', '4058', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 61500, 0, 6500, 68000, 46800, 14700, TIMESTAMP(CURDATE() - INTERVAL 16 DAY, '15:35:00')),
  (1035, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48196165', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 78000, 0, 0, 78000, 39000, 39000, TIMESTAMP(CURDATE() - INTERVAL 16 DAY, '14:48:00')),
  (1036, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48204084', 'domicilio', 'Av. Siempre Viva', '4132', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 65000, 0, 6500, 71500, 38000, 27000, TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '12:54:00')),
  (1037, NULL, 'Martín Gómez', 'martin.gomez@mail.com', '11 48212003', 'domicilio', 'Av. Siempre Viva', '4169', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 130000, 0, 6500, 136500, 64000, 66000, TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '18:24:00')),
  (1038, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48219922', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 145000, 0, 0, 145000, 85000, 60000, TIMESTAMP(CURDATE() - INTERVAL 14 DAY, '16:43:00')),
  (1039, NULL, 'Julieta Romero', 'julieta.romero@mail.com', '11 48227841', 'domicilio', 'Av. Siempre Viva', '4243', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 160000, 16000, 0, 144000, 87000, 57000, TIMESTAMP(CURDATE() - INTERVAL 14 DAY, '16:19:00')),
  (1040, 1, 'Cliente Demo', 'demo@tienda.com', '11 48235760', 'domicilio', 'Av. Siempre Viva', '4280', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 24000, 0, 6500, 30500, 17300, 6700, TIMESTAMP(CURDATE() - INTERVAL 14 DAY, '15:10:00')),
  (1041, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48243679', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 90000, 0, 0, 90000, 44000, 46000, TIMESTAMP(CURDATE() - INTERVAL 13 DAY, '11:49:00')),
  (1042, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48251598', 'domicilio', 'Av. Siempre Viva', '4354', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 90000, 0, 6500, 96500, 44000, 46000, TIMESTAMP(CURDATE() - INTERVAL 13 DAY, '15:52:00')),
  (1043, NULL, 'Juan Pérez', 'juan.perez@mail.com', '11 48259517', 'domicilio', 'Av. Siempre Viva', '4391', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'cancelado', 135000, 0, 6500, 141500, 95000, 40000, TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '10:22:00')),
  (1044, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48267436', 'domicilio', 'Av. Siempre Viva', '4428', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'cancelado', 160000, 16000, 0, 144000, 95000, 49000, TIMESTAMP(CURDATE() - INTERVAL 11 DAY, '19:03:00')),
  (1045, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48275355', 'domicilio', 'Av. Siempre Viva', '4465', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'entregado', 104000, 0, 6500, 110500, 50000, 54000, TIMESTAMP(CURDATE() - INTERVAL 11 DAY, '21:24:00')),
  (1046, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48283274', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'entregado', 14500, 1450, 0, 13050, 10500, 2550, TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '19:13:00')),
  (1047, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48291193', 'domicilio', 'Av. Siempre Viva', '4539', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 9500, 0, 6500, 16000, 6800, 2700, TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '21:06:00')),
  (1048, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48299112', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 85000, 0, 0, 85000, 42000, 43000, TIMESTAMP(CURDATE() - INTERVAL 9 DAY, '13:14:00')),
  (1049, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 48307031', 'domicilio', 'Av. Siempre Viva', '4613', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 230000, 23000, 0, 207000, 140000, 67000, TIMESTAMP(CURDATE() - INTERVAL 9 DAY, '14:18:00')),
  (1050, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48314950', 'domicilio', 'Av. Siempre Viva', '4650', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'cancelado', 78000, 0, 6500, 84500, 39000, 39000, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '21:15:00')),
  (1051, NULL, 'Tomás Díaz', 'tomas.diaz@mail.com', '11 48322869', 'domicilio', 'Av. Siempre Viva', '4687', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'entregado', 200000, 0, 0, 200000, 133000, 67000, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '09:35:00')),
  (1052, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 48330788', 'domicilio', 'Av. Siempre Viva', '4724', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 45000, 0, 6500, 51500, 22000, 23000, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '09:22:00')),
  (1053, 1, 'Cliente Demo', 'demo@tienda.com', '11 48338707', 'domicilio', 'Av. Siempre Viva', '4761', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 135000, 0, 6500, 141500, 95000, 40000, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '16:13:00')),
  (1054, NULL, 'Sofía Rodríguez', 'sofia.rodriguez@mail.com', '11 48346626', 'domicilio', 'Av. Siempre Viva', '4798', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'entregado', 74000, 7400, 6500, 73100, 36000, 30600, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '14:48:00')),
  (1055, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48354545', 'domicilio', 'Av. Siempre Viva', '4835', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'entregado', 104000, 0, 6500, 110500, 50000, 54000, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '17:54:00')),
  (1056, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48362464', 'domicilio', 'Av. Siempre Viva', '4872', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'transferencia', 'enviado', 9500, 950, 6500, 15050, 6800, 1750, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '20:59:00')),
  (1057, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48370383', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'cancelado', 52000, 0, 0, 52000, 40000, 12000, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '14:50:00')),
  (1058, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 48378302', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'enviado', 58000, 0, 0, 58000, 38000, 20000, TIMESTAMP(CURDATE() - INTERVAL 7 DAY, '21:52:00')),
  (1059, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48386221', 'domicilio', 'Av. Siempre Viva', '4983', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'entregado', 68000, 0, 6500, 74500, 34000, 34000, TIMESTAMP(CURDATE() - INTERVAL 6 DAY, '14:47:00')),
  (1060, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48394140', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'enviado', 153000, 15300, 0, 137700, 76000, 61700, TIMESTAMP(CURDATE() - INTERVAL 6 DAY, '09:18:00')),
  (1061, NULL, 'Santiago Morales', 'santiago.morales@mail.com', '11 48402059', 'domicilio', 'Av. Siempre Viva', '157', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'enviado', 78000, 0, 6500, 84500, 39000, 39000, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '21:53:00')),
  (1062, NULL, 'Micaela Ortiz', 'micaela.ortiz@mail.com', '11 48409978', 'domicilio', 'Av. Siempre Viva', '194', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'enviado', 117000, 11700, 6500, 111800, 63000, 42300, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '11:29:00')),
  (1063, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48417897', 'domicilio', 'Av. Siempre Viva', '231', NULL, '5500', 'Mendoza', 'Mendoza', 'tarjeta', 'entregado', 230000, 0, 0, 230000, 140000, 90000, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '13:19:00')),
  (1064, NULL, 'Facundo Ruiz', 'facundo.ruiz@mail.com', '11 48425816', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'entregado', 68000, 0, 0, 68000, 34000, 34000, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '17:33:00')),
  (1065, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48433735', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'enviado', 14500, 0, 0, 14500, 10500, 4000, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '13:06:00')),
  (1066, 1, 'Cliente Demo', 'demo@tienda.com', '11 48441654', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'tarjeta', 'enviado', 189000, 0, 0, 189000, 105000, 84000, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '12:30:00')),
  (1067, NULL, 'Lucía Fernández', 'lucia.fernandez@mail.com', '11 48449573', 'domicilio', 'Av. Siempre Viva', '379', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'entregado', 126000, 12600, 6500, 119900, 72000, 41400, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '19:47:00')),
  (1068, NULL, 'Mateo Sánchez', 'mateo.sanchez@mail.com', '11 48457492', 'domicilio', 'Av. Siempre Viva', '416', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'pagado', 135000, 13500, 6500, 128000, 95000, 26500, TIMESTAMP(CURDATE() - INTERVAL 3 DAY, '11:54:00')),
  (1069, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48465411', 'domicilio', 'Av. Siempre Viva', '453', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'enviado', 68000, 6800, 6500, 67700, 34000, 27200, TIMESTAMP(CURDATE() - INTERVAL 3 DAY, '20:18:00')),
  (1070, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48473330', 'domicilio', 'Av. Siempre Viva', '490', NULL, '1900', 'La Plata', 'Buenos Aires', 'transferencia', 'enviado', 68000, 6800, 6500, 67700, 34000, 27200, TIMESTAMP(CURDATE() - INTERVAL 3 DAY, '11:23:00')),
  (1071, NULL, 'Nicolás Álvarez', 'nicolas.alvarez@mail.com', '11 48481249', 'domicilio', 'Av. Siempre Viva', '527', NULL, '1900', 'La Plata', 'Buenos Aires', 'tarjeta', 'cancelado', 68000, 0, 6500, 74500, 34000, 34000, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '11:30:00')),
  (1072, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48489168', 'domicilio', 'Av. Siempre Viva', '564', NULL, '2000', 'Rosario', 'Santa Fe', 'transferencia', 'pagado', 230000, 23000, 0, 207000, 140000, 67000, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '12:31:00')),
  (1073, NULL, 'Martín Gómez', 'martin.gomez@mail.com', '11 48497087', 'domicilio', 'Av. Siempre Viva', '601', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'pagado', 8500, 0, 6500, 15000, 6000, 2500, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '09:57:00')),
  (1074, NULL, 'Agustina Torres', 'agustina.torres@mail.com', '11 48505006', 'domicilio', 'Av. Siempre Viva', '638', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'pagado', 65000, 0, 6500, 71500, 38000, 27000, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '09:09:00')),
  (1075, NULL, 'Mateo Sánchez', 'mateo.sanchez@mail.com', '11 48512925', 'domicilio', 'Av. Siempre Viva', '675', NULL, '5000', 'Córdoba', 'Córdoba', 'transferencia', 'pagado', 45000, 4500, 6500, 47000, 22000, 18500, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '21:57:00')),
  (1076, NULL, 'Florencia Castro', 'florencia.castro@mail.com', '11 48520844', 'domicilio', 'Av. Siempre Viva', '712', NULL, '5500', 'Mendoza', 'Mendoza', 'transferencia', 'pendiente', 160000, 16000, 0, 144000, 95000, 49000, NOW() - INTERVAL 32 MINUTE),
  (1077, NULL, 'Tomás Díaz', 'tomas.diaz@mail.com', '11 48528763', 'domicilio', 'Av. Siempre Viva', '749', NULL, '2000', 'Rosario', 'Santa Fe', 'tarjeta', 'pagado', 160000, 0, 0, 160000, 95000, 65000, NOW() - INTERVAL 109 MINUTE),
  (1078, NULL, 'Camila Martínez', 'camila.martinez@mail.com', '11 48536682', 'domicilio', 'Av. Siempre Viva', '786', NULL, '5000', 'Córdoba', 'Córdoba', 'tarjeta', 'pagado', 14500, 0, 6500, 21000, 10500, 4000, NOW() - INTERVAL 145 MINUTE),
  (1079, 1, 'Cliente Demo', 'demo@tienda.com', '11 48544601', 'domicilio', 'Av. Siempre Viva', '823', NULL, '1405', 'CABA', 'Ciudad Autónoma de Buenos Aires', 'tarjeta', 'pagado', 52000, 0, 6500, 58500, 40000, 12000, NOW() - INTERVAL 184 MINUTE),
  (1080, NULL, 'Valentina López', 'valentina.lopez@mail.com', '11 48552520', 'retiro', NULL, NULL, NULL, NULL, NULL, NULL, 'transferencia', 'pendiente', 68000, 6800, 0, 61200, 34000, 27200, NOW() - INTERVAL 253 MINUTE);

-- Cobro: los pedidos pagados/enviados/entregados tienen el pago aprobado
UPDATE pedidos SET pago_estado = 'aprobado', pagado_en = creado_en
WHERE estado IN ('pagado', 'enviado', 'entregado');
UPDATE pedidos
SET pago_detalle = ELT(1 + MOD(id, 4), 'Visa terminada en 4242 · 3 cuotas', 'Mastercard terminada en 5100 · 1 cuota',
                       'Naranja terminada en 6019 · 6 cuotas', 'Dinero en cuenta de Mercado Pago'),
    pago_id = CONCAT('demo-', id)
WHERE medio_pago = 'tarjeta' AND pago_estado = 'aprobado';
UPDATE pedidos SET pago_detalle = 'Transferencia acreditada'
WHERE medio_pago = 'transferencia' AND pago_estado = 'aprobado';

-- Dirección guardada del cliente demo (se usa para completar el checkout)
UPDATE usuarios SET dni = '30111222', calle = 'Av. Siempre Viva', altura = '2837', codigo_postal = '1405',
       ciudad = 'CABA', provincia = 'Ciudad Autónoma de Buenos Aires'
WHERE email = 'demo@tienda.com';

UPDATE pedidos SET actualizado_en = creado_en;

-- ── Renglones de los pedidos (96) ─────────────────────────
INSERT INTO pedido_items (pedido_id, producto_id, nombre, color, precio, costo, cantidad) VALUES
  (1001, 24, 'Yerba Baldo 5 kg', 'Natural', 52000, 40000, 1),
  (1001, 4, 'Torpedo Uruguayo', 'Negro', 62000, 30000, 1),
  (1002, 6, 'Mate Exclusivo Criollo', 'Suela', 58000, 28000, 1),
  (1003, 12, 'Termo Stanley Mate System', 'Negro', 135000, 95000, 1),
  (1004, 21, 'Yerba Mate Rojo “10” 500 g', 'Natural', 7500, 5000, 1),
  (1005, 17, 'Combo Tradicional', 'Negro', 145000, 85000, 1),
  (1006, 16, 'Canasta Matera Hudson', 'Azul marino', 75000, 45000, 1),
  (1006, 24, 'Yerba Baldo 5 kg', 'Natural', 52000, 40000, 1),
  (1007, 10, 'Combo Línea Hudson', 'Azul marino', 189000, 105000, 1),
  (1007, 16, 'Canasta Matera Hudson', 'Azul marino', 75000, 45000, 1),
  (1008, 23, 'Yerba Rei Verde Export 500 g', 'Natural', 9500, 6800, 1),
  (1009, 6, 'Mate Exclusivo Criollo', 'Suela', 58000, 28000, 1),
  (1010, 3, 'Imperial Premium Argentina', 'Negro', 78000, 39000, 1),
  (1011, 5, 'Torpedo Roma de Calabaza', 'Negro', 74000, 36000, 1),
  (1012, 18, 'Combo Campestre', 'Suela', 160000, 95000, 1),
  (1013, 5, 'Torpedo Roma de Calabaza', 'Marrón', 74000, 36000, 1),
  (1013, 10, 'Combo Línea Hudson', 'Azul marino', 189000, 105000, 1),
  (1014, 23, 'Yerba Rei Verde Export 500 g', 'Natural', 9500, 6800, 1),
  (1014, 7, 'Bombillón de Alpaca Tatuado', 'Plateado', 45000, 22000, 1),
  (1015, 10, 'Combo Línea Hudson', 'Azul marino', 189000, 105000, 1),
  (1016, 5, 'Torpedo Roma de Calabaza', 'Marrón', 74000, 36000, 1),
  (1017, 6, 'Mate Exclusivo Criollo', 'Suela', 58000, 28000, 1),
  (1018, 4, 'Torpedo Uruguayo', 'Negro', 62000, 30000, 1),
  (1019, 22, 'Yerba Verdecita Selección Especial', 'Natural', 8500, 6000, 1),
  (1020, 10, 'Combo Línea Hudson', 'Azul marino', 189000, 105000, 1),
  (1021, 24, 'Yerba Baldo 5 kg', 'Natural', 52000, 40000, 1),
  (1022, 4, 'Torpedo Uruguayo', 'Negro', 62000, 30000, 1),
  (1023, 6, 'Mate Exclusivo Criollo', 'Natural', 58000, 28000, 1),
  (1024, 22, 'Yerba Verdecita Selección Especial', 'Natural', 8500, 6000, 1),
  (1025, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1026, 1, 'Torpedo Argentino', 'Marrón', 68000, 34000, 1),
  (1026, 4, 'Torpedo Uruguayo', 'Negro', 62000, 30000, 1),
  (1027, 8, 'Bombillón de Alpaca Joyero', 'Plateado', 52000, 25000, 1),
  (1027, 24, 'Yerba Baldo 5 kg', 'Natural', 52000, 40000, 1),
  (1028, 23, 'Yerba Rei Verde Export 500 g', 'Natural', 9500, 6800, 1),
  (1029, 5, 'Torpedo Roma de Calabaza', 'Rojo', 74000, 36000, 1),
  (1030, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1030, 14, 'Termo Mate-Tereré', 'Negro', 58000, 38000, 1),
  (1031, 9, 'Bombillón de Alpaca Hoja', 'Plateado', 48000, 23000, 1),
  (1032, 4, 'Torpedo Uruguayo', 'Negro', 62000, 30000, 1),
  (1033, 2, 'Torpedo Premium Argentina', 'Negro', 85000, 42000, 1),
  (1034, 23, 'Yerba Rei Verde Export 500 g', 'Natural', 9500, 6800, 1),
  (1034, 24, 'Yerba Baldo 5 kg', 'Natural', 52000, 40000, 1),
  (1035, 3, 'Imperial Premium Argentina', 'Plateado', 78000, 39000, 1),
  (1036, 15, 'Bolso Matero Blanco', 'Blanco', 65000, 38000, 1),
  (1037, 4, 'Torpedo Uruguayo', 'Negro', 62000, 30000, 1),
  (1037, 1, 'Torpedo Argentino', 'Marrón', 68000, 34000, 1),
  (1038, 17, 'Combo Tradicional', 'Negro', 145000, 85000, 1),
  (1039, 2, 'Torpedo Premium Argentina', 'Negro', 85000, 42000, 1),
  (1039, 16, 'Canasta Matera Hudson', 'Azul marino', 75000, 45000, 1),
  (1040, 23, 'Yerba Rei Verde Export 500 g', 'Natural', 9500, 6800, 1),
  (1040, 25, 'Yerba Canarias 1 kg', 'Natural', 14500, 10500, 1),
  (1041, 7, 'Bombillón de Alpaca Tatuado', 'Plateado', 45000, 22000, 2),
  (1042, 7, 'Bombillón de Alpaca Tatuado', 'Plateado', 45000, 22000, 2),
  (1043, 12, 'Termo Stanley Mate System', 'Negro', 135000, 95000, 1),
  (1044, 18, 'Combo Campestre', 'Suela', 160000, 95000, 1),
  (1045, 8, 'Bombillón de Alpaca Joyero', 'Plateado', 52000, 25000, 2),
  (1046, 25, 'Yerba Canarias 1 kg', 'Natural', 14500, 10500, 1),
  (1047, 23, 'Yerba Rei Verde Export 500 g', 'Natural', 9500, 6800, 1),
  (1048, 2, 'Torpedo Premium Argentina', 'Negro', 85000, 42000, 1),
  (1049, 20, 'Combo Total Black', 'Negro', 230000, 140000, 1),
  (1050, 3, 'Imperial Premium Argentina', 'Negro', 78000, 39000, 1),
  (1051, 15, 'Bolso Matero Blanco', 'Blanco', 65000, 38000, 1),
  (1051, 12, 'Termo Stanley Mate System', 'Negro', 135000, 95000, 1),
  (1052, 7, 'Bombillón de Alpaca Tatuado', 'Plateado', 45000, 22000, 1),
  (1053, 12, 'Termo Stanley Mate System', 'Negro', 135000, 95000, 1),
  (1054, 5, 'Torpedo Roma de Calabaza', 'Rojo', 74000, 36000, 1),
  (1055, 8, 'Bombillón de Alpaca Joyero', 'Plateado', 52000, 25000, 2),
  (1056, 23, 'Yerba Rei Verde Export 500 g', 'Natural', 9500, 6800, 1),
  (1057, 24, 'Yerba Baldo 5 kg', 'Natural', 52000, 40000, 1),
  (1058, 14, 'Termo Mate-Tereré', 'Celeste', 58000, 38000, 1),
  (1059, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1060, 2, 'Torpedo Premium Argentina', 'Negro', 85000, 42000, 1),
  (1060, 1, 'Torpedo Argentino', 'Marrón', 68000, 34000, 1),
  (1061, 3, 'Imperial Premium Argentina', 'Negro', 78000, 39000, 1),
  (1062, 15, 'Bolso Matero Blanco', 'Blanco', 65000, 38000, 1),
  (1062, 8, 'Bombillón de Alpaca Joyero', 'Plateado', 52000, 25000, 1),
  (1063, 20, 'Combo Total Black', 'Negro', 230000, 140000, 1),
  (1064, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1065, 25, 'Yerba Canarias 1 kg', 'Natural', 14500, 10500, 1),
  (1066, 10, 'Combo Línea Hudson', 'Azul marino', 189000, 105000, 1),
  (1067, 14, 'Termo Mate-Tereré', 'Negro', 58000, 38000, 1),
  (1067, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1068, 12, 'Termo Stanley Mate System', 'Negro', 135000, 95000, 1),
  (1069, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1070, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1071, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1),
  (1072, 20, 'Combo Total Black', 'Negro', 230000, 140000, 1),
  (1073, 22, 'Yerba Verdecita Selección Especial', 'Natural', 8500, 6000, 1),
  (1074, 15, 'Bolso Matero Blanco', 'Blanco', 65000, 38000, 1),
  (1075, 7, 'Bombillón de Alpaca Tatuado', 'Plateado', 45000, 22000, 1),
  (1076, 18, 'Combo Campestre', 'Suela', 160000, 95000, 1),
  (1077, 18, 'Combo Campestre', 'Suela', 160000, 95000, 1),
  (1078, 25, 'Yerba Canarias 1 kg', 'Natural', 14500, 10500, 1),
  (1079, 24, 'Yerba Baldo 5 kg', 'Natural', 52000, 40000, 1),
  (1080, 1, 'Torpedo Argentino', 'Negro', 68000, 34000, 1);

ALTER TABLE pedidos AUTO_INCREMENT = 1081;

-- ── Notificaciones para el admin (las 2 compras más recientes, sin leer) ──
INSERT INTO notificaciones (tipo, titulo, mensaje, url, pedido_id, leida, creado_en)
SELECT 'pedido',
       CONCAT('Nueva compra #', id),
       CONCAT(cliente, ' · $', FORMAT(total, 2, 'es_AR')),
       CONCAT('/admin/pedidos?q=', id),
       id, 0, creado_en
  FROM pedidos
 ORDER BY creado_en DESC
 LIMIT 2;
