# Pagos con Mercado Pago

La tienda cobra con **Mercado Pago Checkout Pro**. El cliente paga en la página segura
de Mercado Pago con tarjeta de crédito o débito (Visa, Mastercard, Amex, Naranja,
Cabal, Maestro…), dinero en cuenta o cuotas sin tarjeta. Los datos de la tarjeta
**nunca pasan por este servidor**. La plata entra a tu cuenta de Mercado Pago y desde
ahí la podés pasar a tu banco o a otra billetera (por ejemplo, Naranja X).

La transferencia bancaria sigue disponible, con 10% de descuento. El pedido queda
pendiente hasta que el admin lo marca como **Pagado** en Admin → Pedidos.

## Cómo activarlo

1. Entrá a <https://www.mercadopago.com.ar/developers/panel/app> con la cuenta
   de Mercado Pago que va a recibir el dinero y creá una aplicación
   (tipo "Pagos online", producto "Checkout Pro").
2. En **Credenciales de prueba** copiá el *Access Token* (empieza con `TEST-`).
3. En el archivo `.env` (nunca en el código ni en el repositorio):

   ```
   MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxx
   MP_NOMBRE_TIENDA=Nombre de tu marca
   ```

4. Reiniciá la app. En la consola tiene que aparecer
   `💳 Pagos con Mercado Pago (credenciales de PRUEBA)`.
5. Probá una compra con las
   [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)
   y un [usuario de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/accounts)
   como comprador. Para simular un rechazo, poné `OTHE` como nombre del titular.
6. Cuando todo ande, cambiá a las **Credenciales de producción** (activalas en el
   mismo panel) y reemplazá `MP_ACCESS_TOKEN`. Desde ese momento se cobra de verdad.

Sin `MP_ACCESS_TOKEN` la tienda funciona en **modo demo**: una página simula el pago
aprobado, rechazado o en proceso, y no se cobra nada.

## Con la tienda publicada (https)

- Poné `APP_URL=https://tu-dominio.com` en `.env`. Así Mercado Pago vuelve solo a la
  tienda después de pagar.
- En tu aplicación de Mercado Pago → **Webhooks**, cargá
  `https://tu-dominio.com/pagos/webhook` con el evento **Pagos**. Copiá la clave
  secreta que te muestra en `MP_WEBHOOK_SECRET`. Con el webhook el pedido se marca
  como pagado aunque el cliente cierre la página antes de volver.

## Cómo funciona

| Momento | Qué pasa |
|---|---|
| El cliente confirma el pago | Se crea el pedido **pendiente**, se descuenta el stock y va a Mercado Pago |
| Vuelve de Mercado Pago o llega el webhook | Se **consulta el pago a Mercado Pago** (nunca se cree lo que dice la URL). Si está aprobado, cubre el total y es en pesos, el pedido pasa a **Pagado** y el admin recibe la notificación "Pago aprobado" |
| Pago rechazado | El cliente ve el motivo y puede reintentar desde la página del pedido o desde Mis pedidos |
| No paga en `PAGO_VENCE_HORAS` (48 h) | El pedido se cancela solo y el stock vuelve |
| El admin cancela un pedido ya pagado | El stock vuelve, pero **el dinero hay que devolverlo desde Mercado Pago** (Actividad → el pago → Devolver) |
