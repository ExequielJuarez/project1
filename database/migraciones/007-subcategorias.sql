-- ==========================================================
-- MIGRACIÓN 007 — Subcategorías (filtros de cada sección)
--
-- Para bases creadas ANTES de este cambio. Agrega el slug de las
-- categorías (para las URLs /categoria/mates), crea la tabla
-- subcategorias y la columna productos.subcategoria_id. No borra datos.
-- (La app también lo hace sola al arrancar.)
--
-- Uso: abrir en Workbench y ejecutar (⚡).
-- ==========================================================

USE tienda_mates;

ALTER TABLE categorias ADD COLUMN slug VARCHAR(60) NULL AFTER nombre;
UPDATE categorias SET slug = LOWER(REPLACE(TRIM(nombre), ' ', '-'));
-- Si alguna categoría tiene acentos, revisá que el slug quede sin tildes:
-- UPDATE categorias SET slug = 'nombre-sin-acentos' WHERE id = X;
ALTER TABLE categorias MODIFY slug VARCHAR(60) NOT NULL, ADD UNIQUE KEY uq_categorias_slug (slug);

CREATE TABLE IF NOT EXISTS subcategorias (
  id            SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  categoria_id  SMALLINT UNSIGNED NOT NULL,
  nombre        VARCHAR(40)       NOT NULL,
  slug          VARCHAR(40)       NOT NULL,
  orden         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subcategorias_slug (categoria_id, slug),
  CONSTRAINT fk_subcategorias_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE productos
  ADD COLUMN subcategoria_id SMALLINT UNSIGNED NULL AFTER categoria_id,
  ADD KEY idx_productos_subcategoria (subcategoria_id),
  ADD CONSTRAINT fk_productos_subcategoria FOREIGN KEY (subcategoria_id) REFERENCES subcategorias (id)
    ON UPDATE CASCADE ON DELETE SET NULL;
