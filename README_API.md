# 🚀 API de Feriados Bursátiles Argentinos

**URL Base:** `http://50.18.187.142:8000`

**Documentación Interactiva:** `http://50.18.187.142:8000/docs` (Swagger UI)

---

## 🔌 Endpoints Disponibles

### 🔍 **Consultas (Sin autenticación)**

#### 1. **Información General**
- **GET** `/`
- **Descripción:** Información de la API y endpoints disponibles
- **Ejemplo:** `curl http://50.18.187.142:8000/`

#### 2. **Todos los Feriados**
- **GET** `/feriados/all`
- **Descripción:** Obtiene todos los feriados de todos los años
- **Ejemplo:** `curl http://50.18.187.142:8000/feriados/all`

#### 3. **Feriados por Año**
- **GET** `/feriados/{anio}`
- **Descripción:** Obtiene los feriados de un año específico
- **Ejemplo:** `curl http://50.18.187.142:8000/feriados/2024`

#### 4. **Consultar Fecha Específica**
- **GET** `/feriados/consultar/{fecha}`
- **Descripción:** Verifica si una fecha es feriado
- **Formato:** YYYY-MM-DD
- **Ejemplo:** `curl http://50.18.187.142:8000/feriados/consultar/2024-01-01`
- **Respuesta:**
  ```json
  {
    "fecha": "2024-01-01",
    "es_feriado": true,
    "nombre": "Año Nuevo"
  }
  ```

#### 5. **Próximos Feriados**
- **GET** `/feriados/proximos?cantidad=5`
- **Descripción:** Obtiene los próximos feriados desde hoy
- **Parámetro opcional:** `cantidad` (1-20, default: 5)
- **Ejemplo:** `curl "http://50.18.187.142:8000/feriados/proximos?cantidad=10"`

### 🔧 **Gestión (Requiere API Key)**

#### 6. **Agregar Feriado**
- **POST** `/feriados/agregar/`
- **Headers:** `X-API-Key: tu_api_key`
- **Parámetros:** `anio`, `fecha`, `nombre`
- **Ejemplo:**
  ```bash
  curl -X POST "http://50.18.187.142:8000/feriados/agregar/" \
    -H "X-API-Key: tu_api_key" \
    -d "anio=2024&fecha=2024-12-25&nombre=Navidad"
  ```

#### 7. **Eliminar Feriado**
- **DELETE** `/feriados/eliminar/`
- **Headers:** `X-API-Key: tu_api_key`
- **Parámetros:** `anio`, `fecha`
- **Ejemplo:**
  ```bash
  curl -X DELETE "http://50.18.187.142:8000/feriados/eliminar/" \
    -H "X-API-Key: tu_api_key" \
    -d "anio=2024&fecha=2024-12-25"
  ```

---

## 🔑 **Configuración**

### Variables de Entorno (archivo `.env`):
```env
API_KEY=tu_api_key_secreta
FERIADOS_FILE=feriados.json
MIN_YEAR=1900
MAX_YEAR_OFFSET=10
MAX_PROXIMOS_FERIADOS=20
```

---

## 🛠️ **Instalación y Uso**

```bash
# 1. Clonar repositorio
git clone https://github.com/MarianaSardo/feriadobusatilapi.git
cd feriadobusatilapi

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
# Crear archivo .env con tu API_KEY

# 4. Ejecutar API
python app.py
```

---

## 📋 **Ejemplos de Respuestas**

### Feriados por año (2024):
```json
{
  "anio": 2024,
  "feriados": [
    {
      "fecha": "2024-01-01",
      "nombre": "Año Nuevo"
    },
    {
      "fecha": "2024-05-01",
      "nombre": "Día del Trabajador"
    }
  ]
}
```

### Próximos feriados:
```json
[
  {
    "fecha": "2024-12-25",
    "nombre": "Navidad",
    "dias_restantes": 15
  },
  {
    "fecha": "2025-01-01",
    "nombre": "Año Nuevo",
    "dias_restantes": 22
  }
]
```

### Respuesta de agregar feriado:
```json
{
  "mensaje": "Feriado 'Navidad' agregado correctamente",
  "detalles": {
    "fecha": "2024-12-25",
    "anio": 2024,
    "total_feriados_anio": 15
  }
}
```

---

## 🚀 **Características**

- ✅ **Documentación automática** con Swagger UI
- ✅ **Validación robusta** de fechas y años
- ✅ **Autenticación por API Key** para operaciones de escritura
- ✅ **CORS habilitado** para uso desde aplicaciones web
- ✅ **Manejo de errores** descriptivo
- ✅ **Respuestas estructuradas** y consistentes
- ✅ **Ordenamiento automático** de feriados por fecha

---

## 🔗 **Repositorio**

https://github.com/MarianaSardo/feriadobusatilapi.git

---

## 📞 **Soporte**

Para consultas o problemas, crear un issue en el repositorio de GitHub. 