# Tienda publicada en DonWeb (Cloud Server)

Guía de cómo se instaló la tienda en el servidor de DonWeb y cómo mantenerla.
Hoy funciona en **http://201.32.130.87**.

> ⚠️ Este repositorio es **público**: acá no van contraseñas. Las claves reales
> están solo en `/var/www/tienda/.env`, dentro del servidor.

---

## 0. El servidor

- **Plan:** DonWeb Cloud Server con la imagen **"Node.js 22 en Ubuntu 24.04"** (trajo Node 24, PM2 y Nginx).
- **Recursos:** 1 GB de RAM, más 2 GB de memoria de intercambio (swap) que agregamos.
- **IP:** `201.32.130.87`
- **SSH:** DonWeb bloquea el puerto 22 desde afuera. Se entra por el **5048**.

## 1. Conectarse desde Windows (PowerShell)

1. Abrí **PowerShell** desde el menú Inicio.
2. Escribí:

```powershell
ssh -p 5048 root@201.32.130.87
```

3. La primera vez pregunta por el *fingerprint*: escribí `yes`.
4. Poné la contraseña de root. Mientras la escribís no se ve nada; es normal.
5. Para **pegar**, usá clic derecho.

> La consola web del panel de DonWeb también sirve, pero no deja pegar y
> algunas teclas (como `|`) no salen bien. Usala solo para emergencias.

## 2. Lo que se instaló (en orden)

### 2.1 Actualizar el sistema, Git y la base de datos
```bash
apt update && apt upgrade -y
apt install -y git mariadb-server
node -v          # tiene que ser v20 o más (tenemos v24)
```

### 2.2 Sacar la app de ejemplo de DonWeb (usaba el puerto 3000)
```bash
pm2 delete all
```

### 2.3 Memoria extra (swap de 2 GB)
```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h          # en "Swap" tiene que decir 2.0Gi
```

### 2.4 Base de datos y su usuario
La contraseña de `tienda` se inventó en este paso y es la que va en `DB_PASSWORD` del `.env`.
```bash
systemctl enable --now mariadb
mysql -e "CREATE DATABASE tienda_mates CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'tienda'@'localhost' IDENTIFIED BY 'LA_CLAVE_DE_LA_BASE'; GRANT ALL PRIVILEGES ON tienda_mates.* TO 'tienda'@'localhost'; FLUSH PRIVILEGES;"
mysql -e "SHOW DATABASES;"
```

### 2.5 Bajar el proyecto de GitHub
```bash
mkdir -p /var/www && cd /var/www
git clone -b claude/responsive-mockup-design-qjojmq https://github.com/ExequielJuarez/project1.git tienda
cd tienda
npm ci --omit=dev
```

### 2.6 Crear el `.env` del servidor
Este bloque crea el archivo solo. `SESSION_SECRET` se genera al azar.
```bash
cd /var/www/tienda
rm -f .env
cat > .env <<EOF
NODE_ENV=production
PORT=3000
SESSION_SECRET=$(openssl rand -hex 32)
APP_URL=http://201.32.130.87

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=tienda
DB_PASSWORD=LA_CLAVE_DE_LA_BASE
DB_NAME=tienda_mates
DB_TIMEZONE=-03:00
DB_POOL_MAX=5

MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
MP_NOMBRE_TIENDA=Santiago Mates
MP_MAX_CUOTAS=6
PAGO_VENCE_HORAS=48

TRANSFERENCIA_ALIAS=
TRANSFERENCIA_CBU=
TRANSFERENCIA_TITULAR=
TRANSFERENCIA_BANCO=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
MAIL_FROM=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://201.32.130.87/auth/google/callback

TIENDA_DIRECCION=
TIENDA_TELEFONO=
TIENDA_EMAIL=
TIENDA_CUIT=
EOF
```

Para editarlo más adelante: `nano /var/www/tienda/.env`. Guardás con **Ctrl+O** y Enter, salís con **Ctrl+X**, y aplicás los cambios con `pm2 restart tienda --update-env`.

Con Mercado Pago, SMTP y Google vacíos, la tienda funciona igual:
- Se paga **solo por transferencia**.
- Se entra con **email y contraseña**.

Cómo completarlos: `PAGOS.md` y `ACCESO.md`.

### 2.7 Cargar tablas y productos
```bash
npm run db:instalar
```
Al final tiene que decir `✅ Base de datos lista.`, con 25 productos.

> ⚠️ Este comando **borra todo y vuelve a cargar** los datos de prueba.
> Corrélo una sola vez. Con la tienda ya en uso, **no lo vuelvas a correr**:
> se pierden los pedidos y los clientes reales.

### 2.8 Encender la tienda con PM2 (y que arranque sola al reiniciar)
```bash
pm2 start src/app.js --name tienda
pm2 logs tienda --lines 15 --nostream   # tiene que decir "✅ Conectado a la base de datos"
pm2 save
pm2 startup
```

### 2.9 Nginx: recibe las visitas en el puerto 80 y se las pasa a la tienda
```bash
rm -f /etc/nginx/sites-enabled/*
cat > /etc/nginx/sites-available/tienda <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;
    client_max_body_size 20M;

    location /admin/notificaciones/stream {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 1h;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/tienda /etc/nginx/sites-enabled/tienda
nginx -t && systemctl reload nginx
```

Listo: **http://201.32.130.87**.

---

## 3. Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | demo@tienda.com | Demo1234 |
| Admin (el dueño de la tienda) | admin@tienda.com | Admin1234 |
| Super admin (edita el inicio) | super@tienda.com | Super1234 |

### Antes de abrir al público: limpiar los datos de prueba
1. Creá desde la web tu cuenta y la del cliente.
2. Corré esto, cambiando los emails:

```bash
mysql tienda_mates -e "
DELETE FROM notificaciones; DELETE FROM pedido_items; DELETE FROM pedidos; DELETE FROM favoritos;
ALTER TABLE pedidos AUTO_INCREMENT = 1001;
UPDATE usuarios SET rol='superadmin' WHERE email='TU-EMAIL@gmail.com';
UPDATE usuarios SET rol='admin' WHERE email='EMAIL-DEL-CLIENTE@gmail.com';
DELETE FROM usuarios WHERE email IN ('demo@tienda.com','admin@tienda.com','super@tienda.com','ana.perez@gmail.com');
DELETE FROM cupones WHERE codigo IN ('MAQUETA5','VERANO20');"
```

Los productos quedan como están.

---

## 4. Uso diario

| Para… | Comando |
|---|---|
| Ver si la tienda está prendida | `pm2 status` |
| Ver los últimos mensajes o errores | `pm2 logs tienda --lines 50 --nostream` |
| Reiniciar la tienda | `pm2 restart tienda` |
| Reiniciar después de editar el `.env` | `pm2 restart tienda --update-env` |
| Entrar a la base por consola | `mysql tienda_mates` (salís con `exit`) |
| Ver la memoria | `free -h` |

### Actualizar la tienda cuando hay cambios nuevos en GitHub
```bash
cd /var/www/tienda
git pull
npm ci --omit=dev
pm2 restart tienda
```

> **Cambios en la base:** al arrancar, la tienda agrega sola las tablas y columnas nuevas, sin borrar nada.
> Las subcategorías de las secciones, por ejemplo, vienen en `database/migraciones/007` y `008`.
> Si todavía tenés los **datos de prueba** y querés las subcategorías ya cargadas, corré
> `npm run db:instalar` y después `pm2 restart tienda`. Ojo: borra todo, así que **no lo hagas con ventas reales**.
> Con ventas reales, asigná las subcategorías desde **Panel → Categorías** y editando cada producto.

### Ver la base con MySQL Workbench desde tu PC
Nueva conexión con estos datos:

| Campo | Valor |
|---|---|
| Connection Method | **Standard TCP/IP over SSH** |
| SSH Hostname | `201.32.130.87:5048` |
| SSH Username | `root` |
| SSH Password | la de root |
| MySQL Hostname | `127.0.0.1` |
| Port | `3306` |
| Username | `tienda` |
| Password | la de la base |

### Copia de seguridad de la base
```bash
mysqldump tienda_mates > /root/backup-$(date +%F).sql
```

---

## 5. Pendiente: dominio y https (candado)

Hoy el navegador muestra **"No seguro"** porque se entra por IP con http. El certificado
gratuito (Let's Encrypt) solo se puede sacar para un dominio.

Además, el https hace falta para dos cosas:
- **Mercado Pago:** que vuelva solo a la tienda después de pagar y que avise los pagos (webhook).
- **Login con Google:** Google lo exige en producción.

Cuando tengas el dominio (ejemplo: `santiagomates.com.ar`):

1. En la zona DNS, creá un registro **A** para `@` y otro para `www`, los dos apuntando a `201.32.130.87`.
2. Cuando el dominio ya abra la tienda, corré en el servidor:

```bash
sed -i 's/server_name _;/server_name santiagomates.com.ar www.santiagomates.com.ar;/' /etc/nginx/sites-available/tienda
nginx -t && systemctl reload nginx
apt install -y certbot python3-certbot-nginx
certbot --nginx -d santiagomates.com.ar -d www.santiagomates.com.ar
```

3. En el `.env`, poné `APP_URL=https://santiagomates.com.ar` y
   `GOOGLE_CALLBACK_URL=https://santiagomates.com.ar/auth/google/callback`.
4. Aplicá los cambios con `pm2 restart tienda --update-env`.

El certificado se renueva solo.

## 6. Otros pendientes

- **Cambiar las claves que quedaron públicas** en GitHub: base de Clever Cloud, secreto de Google, token y webhook de Mercado Pago. Después cargá las nuevas en el `.env` del servidor.
- **Completar Mercado Pago:** `PAGOS.md`.
- **Completar el email con Gmail y el login con Google:** `ACCESO.md`.
- **Completar los datos de transferencia y del comprobante:** las variables `TRANSFERENCIA_*` y `TIENDA_*` del `.env`.
- **Guardar las sesiones en MySQL:** hoy viven en memoria, así que al reiniciar la tienda los clientes tienen que volver a entrar.
