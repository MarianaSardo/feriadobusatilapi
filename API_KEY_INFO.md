# Información de API Key - Uso Interno

## 🔑 API Key para Operaciones Administrativas

**API Key:** `bbsa-report`

## 📝 Uso

Esta API Key es necesaria para realizar operaciones administrativas en la API de Feriados Bursátiles:

- ✅ **Agregar feriados**
- ✅ **Eliminar feriados**

## 🔒 Seguridad

- **NO compartir** esta API Key públicamente
- **NO incluir** en el código del frontend
- **NO subir** a repositorios públicos
- **Usar solo** para operaciones administrativas legítimas

## 🎯 Operaciones que NO requieren API Key

- ✅ Consultar todos los feriados
- ✅ Buscar feriados por año
- ✅ Consultar fecha específica
- ✅ Obtener próximos feriados

## 🛡️ Recomendaciones de Seguridad

1. **Cambiar la API Key** regularmente
2. **Usar variables de entorno** en producción
3. **Limitar acceso** a usuarios autorizados
4. **Monitorear** el uso de la API Key

## 🔧 Configuración

La API Key se configura en el archivo `.env`:

```env
API_KEY=bbsa-report
```

## 📋 Para el Portafolio

En el portafolio, puedes mencionar:
- "Sistema de autenticación con API Key"
- "Panel de administración protegido"
- "Operaciones CRUD seguras"

**Sin revelar la API Key específica.**

---

**⚠️ IMPORTANTE: Este archivo es solo para uso interno del desarrollador.** 