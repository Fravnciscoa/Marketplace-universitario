# Créditos - Marketplace Universitario

Todas las rutas requieren autenticación (`Authorization: Bearer <token>`).

## GET /api/creditos
Devuelve el saldo actual de créditos del usuario y los créditos pendientes por reclamar.

**Response 200:**
```json
{
  "saldo": 0,
  "pendientes": [
    {
      "id": 1,
      "user_id": 5,
      "monto": "1000.00",
      "motivo": "Bono de bienvenida",
      "reclamado": false,
      "fecha_reclamo": null,
      "created_at": "2026-01-01T12:00:00.000Z"
    }
  ],
  "totalPendiente": 1000
}
```

## POST /api/creditos/claim
Reclama todos los créditos pendientes del usuario y los suma a su saldo.

**Response 200:**
```json
{
  "message": "Créditos reclamados exitosamente",
  "montoReclamado": 1000,
  "saldo": 1000,
  "cantidadReclamada": 1
}
```

**Response 404** (sin créditos pendientes):
```json
{
  "message": "No tienes créditos disponibles para reclamar"
}
```

## Notas
- Al registrarse, cada usuario recibe automáticamente un bono de bienvenida pendiente por reclamar (ver `otorgarCreditoDisponible` en `backend/src/models/credito.model.ts`).
- El esquema de base de datos necesario está en `backend/src/db/credits.sql`; debe ejecutarse igual que el resto de los scripts SQL del proyecto (ver README principal).
