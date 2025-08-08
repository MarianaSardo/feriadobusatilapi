# Configuración CORS para Frontend

## ¿Qué es CORS?

CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad que permite que las aplicaciones web hagan solicitudes a dominios diferentes al que sirve la página web.

## Configuración Actual

Tu API ya tiene CORS configurado en `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Esta configuración permite:
- ✅ Todas las origenes (`allow_origins=["*"]`)
- ✅ Credenciales (`allow_credentials=True`)
- ✅ Todos los métodos HTTP (`allow_methods=["*"]`)
- ✅ Todos los headers (`allow_headers=["*"]`)

## Para Producción

En un entorno de producción, deberías ser más específico:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tudominio.com",
        "https://www.tudominio.com",
        "http://localhost:3000"  # Para desarrollo
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)
```

## Solución de Problemas

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

1. **Verifica que la API esté ejecutándose**
2. **Confirma la URL en script.js**
3. **Revisa la configuración CORS en app.py**

### Error: "CORS policy: Request header field X-API-Key is not allowed"

Agrega el header específico:

```python
allow_headers=["*", "X-API-Key"]
```

## Testing CORS

Puedes probar CORS con curl:

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-API-Key" \
     -X OPTIONS \
     http://localhost:8000/feriados/all
```

## Configuración para Diferentes Entornos

### Desarrollo Local
```python
allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]
```

### Staging
```python
allow_origins=["https://staging.tudominio.com"]
```

### Producción
```python
allow_origins=["https://tudominio.com", "https://www.tudominio.com"]
```

## Headers Personalizados

Si necesitas enviar headers personalizados desde el frontend:

```javascript
// En script.js
const response = await fetch(url, {
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-Custom-Header': 'valor'
    }
});
```

Y en la API:

```python
allow_headers=["*", "X-API-Key", "X-Custom-Header"]
```

## Seguridad

### Recomendaciones para Producción:

1. **Especifica orígenes exactos** en lugar de `["*"]`
2. **Limita los métodos HTTP** a los que realmente necesitas
3. **Especifica headers exactos** en lugar de `["*"]`
4. **Usa HTTPS** en producción
5. **Considera usar un proxy** para evitar CORS completamente

### Ejemplo Seguro:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://feriados-bursatiles.com",
        "https://www.feriados-bursatiles.com"
    ],
    allow_credentials=False,  # Si no necesitas cookies
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "X-API-Key"],
)
```

## Debugging

Para debuggear problemas de CORS:

1. **Abre las DevTools** del navegador
2. **Ve a la pestaña Network**
3. **Busca la solicitud que falla**
4. **Revisa los headers de respuesta**

Los headers importantes son:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`

## Alternativas

### 1. Proxy de Desarrollo
Si tienes problemas con CORS en desarrollo, puedes usar un proxy:

```javascript
// En script.js para desarrollo
const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? '/api'  // Proxy
    : 'https://tuapi.com';  // Producción
```

### 2. CORS Proxy
Para testing rápido:

```javascript
const API_BASE_URL = 'https://cors-anywhere.herokuapp.com/http://localhost:8000';
```

**⚠️ No usar en producción**

### 3. Servidor de Desarrollo
Usar un servidor que maneje CORS automáticamente:

```bash
npx live-server --cors
```

---

**Nota**: La configuración actual debería funcionar perfectamente para desarrollo y portafolio. Solo ajusta para producción según tus necesidades específicas. 