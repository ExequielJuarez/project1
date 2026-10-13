-- ==========================================================
-- MIGRACIÓN 008 — Botón de arrepentimiento
--
-- Para bases creadas ANTES de este cambio. Crea la tabla donde se
-- guardan las solicitudes del Botón de arrepentimiento. No borra datos.
-- (La app también la crea sola al arrancar.)
--
-- Uso: abrir en Workbench y ejecutar (⚡).
-- ==========================================================

USE tienda_mates;

CREATE TABLE IF NOT EXISTS arrepentimientos (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  codigo         VARCHAR(20)   NOT NULL COMMENT 'código que recibe el cliente, ej: ARR-7K2Q9M',
  usuario_id     INT UNSIGNED  NULL,
  pedido_id      INT UNSIGNED  NULL COMMENT 'el pedido, si el número y el email coinciden',
  numero_pedido  VARCHAR(20)   NOT NULL COMMENT 'el número que escribió el cliente',
  nombre         VARCHAR(90)   NOT NULL,
  email          VARCHAR(120)  NOT NULL,
  telefono       VARCHAR(20)   NULL,
  motivo         VARCHAR(500)  NULL,
  estado         ENUM('recibida', 'resuelta') NOT NULL DEFAULT 'recibida',
  resuelta_en    DATETIME      NULL,
  creado_en      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_arrepentimientos_codigo (codigo),
  KEY idx_arrepentimientos_estado (estado, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
