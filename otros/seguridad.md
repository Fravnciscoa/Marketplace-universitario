# Seguridad Implementada (EF3)

## 1. Encriptación de Contraseñas (bcrypt)
- **Ubicación**: `backend/src/controllers/auth.controller.ts`
- **Implementación**: bcrypt con 10 salt rounds
- **Funciones**: `bcrypt.hash()` en registro, `bcrypt.compare()` en login

## 2. CORS Seguro
- **Ubicación**: `backend/src/server.ts`
- **Orígenes permitidos**: localhost:8100, 4200, 8080
- **Configuración**: Validación estricta de orígenes, credentials habilitados

## 3. Protección SQL Injection
- **Ubicación**: Todos los controllers (auth, producto)
- **Implementación**: Consultas parametrizadas con pg ($1, $2, etc.)
- **Ejemplo**: `pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo])`

## 4. Protección XSS (Helmet)
- **Ubicación**: `backend/src/server.ts`
- **Headers seguros**: CSP, HSTS (1 año), X-Content-Type-Options

## 5. Rate Limiting
- **General**: 100 requests/15min
- **Autenticación**: 5 intentos/15min
- **Protección**: Ataques de fuerza bruta
