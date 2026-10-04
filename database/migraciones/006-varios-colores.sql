-- ==========================================================
-- MIGRACIÓN 006 — Varios colores por producto
--
-- Para bases creadas ANTES de este cambio. Crea la tabla
-- producto_colores y le pasa a cada producto el color que ya
-- tenía. No borra datos.
-- (La app también lo hace sola al arrancar.)
--
-- Uso: abrir en Workbench y ejecutar (⚡).
-- ==========================================================

USE tienda_mates;

CREATE TABLE IF NOT EXISTS producto_colores (
  producto_id  INT UNSIGNED      NOT NULL,
  color_id     SMALLINT UNSIGNED NOT NULL,
  orden        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (producto_id, color_id),
  KEY idx_producto_colores_color (color_id),
  CONSTRAINT fk_pcolores_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pcolores_color FOREIGN KEY (color_id) REFERENCES colores (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO producto_colores (producto_id, color_id, orden)
  SELECT id, color_id, 0 FROM productos;
