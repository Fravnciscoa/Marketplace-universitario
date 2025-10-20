# Autenticación - Marketplace Universitario

## POST /api/auth/register
**Body:**
```json
{
  "username": "fran",
  "rut": "12345678-5",
  "email": "fran@mail.pucv.cl",
  "region": "Valparaíso",
  "comuna": "Viña del Mar",
  "password": "MiClave123!",
  "acceptedTerms": true
}

**Response 201:**
{
  "message": "Usuario registrado correctamente"
}

{
  "email": "fran@mail.pucv.cl",
  "password": "MiClave123!"
}

{
  "token": "JWT_TOKEN",
  "user": {
    "id": "uuid",
    "username": "fran",
    "email": "fran@mail.pucv.cl"
  }
}

