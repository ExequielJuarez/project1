# Inicio de sesión: Google y código por email

Para comprar en la tienda hay que iniciar sesión. El cliente tiene tres formas de entrar:

1. **Email y contraseña.** Al crear la cuenta le mandamos un código para confirmar que el email es suyo.
2. **Continuar con Google.**
3. **Recibir un código por email**, sin contraseña. Lo mismo sirve para "¿Olvidaste tu contraseña?".

Las dos primeras opciones de abajo se configuran con variables en el `.env` en tu compu, o en **Environment** en Render.

---

## 1. Emails con Gmail (códigos de 6 números)

Vas a necesitar una cuenta de Gmail para la tienda, por ejemplo `santiagomates.tienda@gmail.com`.

1. Entrá a esa cuenta y activá la **verificación en 2 pasos**: https://myaccount.google.com/security
2. Entrá a https://myaccount.google.com/apppasswords
3. Creá una contraseña de aplicación con el nombre "Tienda". Google te muestra **16 letras**.
4. Completá en el `.env` (y en Render):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=santiagomates.tienda@gmail.com
SMTP_PASS=abcdefghijklmnop        # las 16 letras, sin espacios
MAIL_FROM=Santiago Mates <santiagomates.tienda@gmail.com>
```

5. Reiniciá la app. En la consola vas a ver `✉️ Emails: enviando con SMTP`.

> Gmail deja mandar unos 500 emails por día. Para una tienda que arranca, alcanza y sobra.
> Si algún día necesitás más, sirve cualquier proveedor SMTP (Brevo, Mailgun, Zoho, el de tu hosting):
> solo cambiás `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASS`.

**Sin configurar:**
- **En tu compu:** el código aparece en pantalla y en la consola (modo demostración), así podés probar.
- **Publicada (`NODE_ENV=production`):** la opción de código no aparece y las cuentas nuevas se crean sin confirmar el email.

---

## 2. Continuar con Google

1. Entrá a https://console.cloud.google.com y creá un proyecto, por ejemplo "Santiago Mates".
2. Andá a **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**.
   - Nombre de la app: *Santiago Mates*.
   - Email de asistencia: el tuyo.
   - Permisos: `email`, `profile` y `openid`. No hace falta agregar nada raro.
   - Al final tocá **Publicar app**. Si no lo hacés, solo pueden entrar los "usuarios de prueba" que agregues.
3. Andá a **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - En **URI de redireccionamiento autorizados** agregá las dos:
     - `http://localhost:3000/auth/google/callback` (para probar en tu compu)
     - `https://TU-TIENDA.onrender.com/auth/google/callback` (tu dirección real; si tenés dominio propio, también `https://tudominio.com.ar/auth/google/callback`)
4. Copiá el **ID de cliente** y el **Secreto** al `.env` (y a Render):

```env
GOOGLE_CLIENT_ID=1234567890-xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://TU-TIENDA.onrender.com/auth/google/callback
```

`GOOGLE_CALLBACK_URL` tiene que ser **exactamente igual** a una de las URIs que cargaste en Google. Si no coincide, Google muestra el error `redirect_uri_mismatch`.

**Sin configurar:**
- **En tu compu:** "Continuar con Google" abre una pantalla de demostración.
- **Publicada:** el botón avisa que todavía no está disponible.

---

## Cómo funciona por dentro (para el que mantenga el código)

- Los códigos tienen 6 números y vencen a los **10 minutos**.
- Se aceptan **5 intentos**. Para pedir otro hay que esperar **60 segundos**, y hay un máximo de **5 códigos cada 15 minutos**.
- En la sesión se guarda solo el *hash* del código, nunca el código.
- **Registro:** la cuenta recién se crea cuando el cliente escribe el código. Hasta ese momento los datos esperan en la sesión, con la contraseña ya hasheada.
- **Recuperar:** después del código el cliente entra a *Mis datos* y durante 30 minutos puede elegir una contraseña nueva sin escribir la anterior.
- **Checkout:** `/checkout/*` exige sesión iniciada (`src/middlewares/loginParaComprar.js`). El carrito se conserva al iniciar sesión.

Archivos: `src/services/correoService.js`, `src/services/codigoService.js`, `src/controllers/usuarioController.js`, vistas `login-codigo.ejs` y `verificar-codigo.ejs`.
