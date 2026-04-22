# EcoHome Store Backend (Unidad 1)

Backend en Node.js + Express + PostgreSQL con autenticacion JWT, autorizacion por rol y CRUD completo de productos.

## Stack
- Node.js 18+
- Express 4.x
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Seguridad HTTP (`helmet`, `cors`)
- Validaciones (`express-validator`)

## Estructura
```
.
|-- docs/
|   |-- API_DOC.md
|   |-- POSTMAN_GUIA.md
|   `-- postman_collection.json
|-- migrations/
|   `-- init.sql
|-- scripts/
|   |-- migrate.js
|   `-- seed.js
|-- src/
|   |-- config/db.js
|   |-- controllers/
|   |   |-- authController.js
|   |   `-- productsController.js
|   |-- middleware/
|   |   |-- authJWT.js
|   |   |-- authorizeRole.js
|   |   |-- errorHandler.js
|   |   `-- validateRequest.js
|   |-- routes/
|   |   |-- auth.js
|   |   `-- products.js
|   |-- services/
|   |   |-- productService.js
|   |   `-- userService.js
|   |-- utils/validators.js
|   `-- server.js
|-- .env.example
`-- package.json
```

## Instalacion
1. Instalar dependencias:
```bash
npm install
```
2. Crear archivo `.env` basado en `.env.example` y configurar tu PostgreSQL real.

## Variables de entorno requeridas
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecohome_store
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=
JWT_EXPIRES_IN=1h
ADMIN_SEED_USERNAME=ecohome_admin
ADMIN_SEED_EMAIL=admin@ecohome.local
ADMIN_SEED_PASSWORD=
```

## Scripts npm
- `npm start`: inicia API con Node.
- `npm run dev`: inicia API con nodemon.
- `npm run migrate`: ejecuta todos los `.sql` en `migrations/` en orden (`init.sql` primero, luego `010_*.sql`, etc.).
- `npm run seed`: crea usuario admin + productos demo.

## Migracion y seed (comandos exactos)
```bash
npm run migrate
npm run seed
```

### Ver tablas con psql (opcional)
```bash
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_NAME> -c "\dt"
```

## Flujo de autenticacion (signup -> login -> token)
1. `POST /auth/signup` para crear cliente.
2. `POST /auth/login` para obtener JWT.
3. Usar header: `Authorization: Bearer <token>`.
4. Rutas de escritura en productos requieren rol `admin`.

## Pruebas rapidas con cURL

### 1) Signup cliente
```bash
curl -X POST http://localhost:3000/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"cliente1\",\"email\":\"cliente1@example.com\",\"password\":\"SuperPass123\"}"
```

### 2) Login admin (creado por seed)
```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@ecohome.local\",\"password\":\"Samir11\"}"
```

### 3) POST /products sin token (espera 401)
```bash
curl -X POST http://localhost:3000/products ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Sin token\",\"price\":10}"
```

### 4) CRUD admin (usar token del login)
```bash
curl -X POST http://localhost:3000/products ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -d "{\"name\":\"Producto Demo\",\"price\":77.7}"
```

```bash
curl http://localhost:3000/products
```

```bash
curl -X PUT http://localhost:3000/products/1 ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -d "{\"name\":\"Producto Demo v2\",\"price\":88.8}"
```

```bash
curl -X PATCH http://localhost:3000/products/1 ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -d "{\"price\":89.9}"
```

```bash
curl -X DELETE http://localhost:3000/products/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Evidencia de persistencia
1. Crear producto con token admin.
2. Confirmar con `GET /products`.
3. Reiniciar servidor (`Ctrl+C` y `npm start`).
4. Ejecutar `GET /products` otra vez.
5. Si aparece el producto, la persistencia en PostgreSQL esta validada.
6. En consola veras logs como:
   - `create_product user_id=... product_id=...`
   - `API listening on port ...`

## Notas de seguridad incluidas
- Passwords hasheadas con `bcrypt`.
- JWT firmado con `JWT_SECRET` y expiracion configurable.
- `helmet` + `cors` habilitados.
- Consultas SQL parametrizadas (`$1`, `$2`, ...).
- Manejo de errores HTTP: `400`, `401`, `403`, `404`, `500`.

## Evidencia automatizada (Actividades 1–3)
En Git Bash / WSL / Linux: `chmod +x scripts/collect_evidence.sh && ./scripts/collect_evidence.sh` o `npm run collect-evidence`. Instrucciones y cURL manual: `scripts/README_evidence.md`.
