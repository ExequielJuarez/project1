# Legales de la tienda (Argentina)

La tienda ya trae las páginas y los botones que exige la normativa argentina para vender por internet.
Este documento dice qué hay, y qué tenés que completar o tramitar vos.

> ⚠️ Los textos son un **modelo basado en las leyes vigentes**, no asesoramiento legal.
> Antes de abrir al público, que los revise un abogado o un contador.

## Qué trae la web

| Qué | Dónde | Norma |
|---|---|---|
| Términos y condiciones | `/terminos` | Ley 24.240 de Defensa del Consumidor, Código Civil y Comercial |
| Política de privacidad (con la leyenda obligatoria de la AAIP) | `/privacidad` | Ley 25.326 de Protección de Datos Personales |
| Política de cookies + aviso la primera vez que se entra | `/cookies` | Buena práctica: la tienda usa solo cookies necesarias |
| Cambios y devoluciones | `/cambios-y-devoluciones` | Ley 24.240 (art. 34 y garantía del art. 11), CCyC (arts. 1110 y 1116) |
| **Botón de arrepentimiento** (siempre visible en el pie) | `/arrepentimiento` | Res. 424/2020 de la Secretaría de Comercio Interior |
| Link "Defensa de las y los consumidores. Para reclamos ingrese aquí" | Pie de página | Obligatorio para los sitios de venta |
| Data fiscal (QR de ARCA) | Pie de página, cuando completes el link | RG AFIP 1/2002 (formulario 960/NM) |

**Botón de arrepentimiento:** el cliente lo completa con el número de pedido. En el momento recibe un **código de identificación** (ej. `ARR-7K2Q9M`), y por email también si configuraste SMTP. A vos te llega en la campanita del panel. Las solicitudes se ven en **Panel → Arrepentimientos**: ahí contactás al cliente, coordinás la devolución y la marcás como resuelta.

## Lo que tenés que completar en el `.env` del servidor

Mientras falten, las páginas legales muestran un recuadro amarillo `[completar …]`.

```env
TIENDA_RAZON_SOCIAL=Nombre y Apellido del titular (o la empresa)
TIENDA_CUIT=20-12345678-9
TIENDA_DIRECCION=Calle 123, Ciudad, Provincia
TIENDA_EMAIL=contacto@tudominio.com.ar
TIENDA_TELEFONO=385 412-3456
TIENDA_WHATSAPP=5493854123456
TIENDA_INSTAGRAM=https://instagram.com/santiagomates
TIENDA_DATA_FISCAL_URL=
```

En el servidor: `nano /var/www/tienda/.env`, guardás, y después `pm2 restart tienda --update-env`.

## Trámites que hacés vos

1. **Data fiscal (ARCA, ex AFIP):** entrá con tu clave fiscal y adherí el servicio **"Data Fiscal"**. Completá el formulario **960/NM** con la dirección de tu web y copiá el link que te da. Pegalo en `TIENDA_DATA_FISCAL_URL` y en el pie aparece "Data fiscal".
2. **Registro de la base de datos personales (AAIP):** como guardás datos de clientes, corresponde inscribir la base en el Registro Nacional de Bases de Datos de la Agencia de Acceso a la Información Pública. Se hace online con clave fiscal y es gratis.
3. **Facturación:** el comprobante que imprime el panel dice "no válido como factura". Las facturas se emiten en ARCA, o con un sistema de facturación conectado a ARCA.
4. **Revisión:** que un abogado o contador revise los textos. En especial plazos, garantías y excepciones, según lo que vendas.

## Dónde se editan los textos

Están en `src/views/legal/`: `terminos.ejs`, `privacidad.ejs`, `cookies.ejs` y `cambios.ejs`.
Si los cambiás, actualizá también la fecha de "Última actualización" en `src/controllers/legalController.js`.
