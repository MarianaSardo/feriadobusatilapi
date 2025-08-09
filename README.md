# 🚀 API de Feriados Bursátiles Argentinos

**URL Base:** `https://feriadosbursatiles.ddns.net/api`

**Documentación Interactiva:** `https://feriadosbursatiles.ddns.net/docs` (Swagger UI)

**Frontend Web:** `https://feriadosbursatiles.ddns.net` 

---

## 🔌 Endpoints Disponibles

### 🔍 **Consultas (Sin autenticación)**

#### 1. **Información General**
- **GET** `/`
- **Descripción:** Información de la API y endpoints disponibles
- **Ejemplo:** `curl https://feriadosbursatiles.ddns.net/api/`

#### 2. **Todos los Feriados**
- **GET** `/feriados/all`
- **Descripción:** Obtiene todos los feriados de todos los años
- **Ejemplo:** `curl https://feriadosbursatiles.ddns.net/api/feriados/all`

#### 3. **Feriados por Año**
- **GET** `/feriados/{anio}`
- **Descripción:** Obtiene los feriados de un año específico
- **Ejemplo:** `curl https://feriadosbursatiles.ddns.net/api/feriados/2024`

#### 4. **Consultar Fecha Específica**
- **GET** `/feriados/consultar/{fecha}`
- **Descripción:** Verifica si una fecha es feriado
- **Formato:** YYYY-MM-DD
- **Ejemplo:** `curl https://feriadosbursatiles.ddns.net/api/feriados/consultar/2024-01-01`
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
- **Ejemplo:** `curl "https://feriadosbursatiles.ddns.net/api/feriados/proximos?cantidad=10"`

### 🔧 **Gestión (Requiere API Key)**

#### 6. **Agregar Feriado**
- **POST** `/feriados/agregar/`
- **Headers:** `X-API-Key: tu_api_key`
- **Parámetros:** `anio`, `fecha`, `nombre`
- **Ejemplo:**
  ```bash
  curl -X POST "https://feriadosbursatiles.ddns.net/api/feriados/agregar/" \
    -H "X-API-Key: tu_api_key" \
    -d "anio=2024&fecha=2024-12-25&nombre=Navidad"
  ```

#### 7. **Eliminar Feriado**
- **DELETE** `/feriados/eliminar/`
- **Headers:** `X-API-Key: tu_api_key`
- **Parámetros:** `anio`, `fecha`
- **Ejemplo:**
  ```bash
  curl -X DELETE "https://feriadosbursatiles.ddns.net/api/feriados/eliminar/" \
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

### 🔐 **Autenticación**

Para operaciones administrativas (agregar/eliminar feriados), se requiere una API Key válida. La API Key se configura en el archivo `.env` del backend. Para obtener acceso administrativo, contacta al administrador del sistema.

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

# 5. Ejecutar Frontend (en otra terminal)
python -m http.server 3000
```

### 🌐 **Acceso a la Aplicación**

#### **Desarrollo Local:**
- **API:** `http://localhost:8000`
- **Documentación:** `http://localhost:8000/docs`
- **Frontend:** `http://localhost:3000`

#### **Producción:**
- **API:** `https://feriadosbursatiles.ddns.net/api`
- **Documentación:** `https://feriadosbursatiles.ddns.net/docs`
- **Frontend:** `https://feriadosbursatiles.ddns.net`

### 🔧 **Configuración del Frontend**

El frontend está compuesto por archivos estáticos:
- `index.html` - Página principal
- `styles.css` - Estilos modernos
- `script.js` - Funcionalidad interactiva

**No requiere instalación adicional** - solo abrir `index.html` en el navegador.

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

### 🔧 **Backend (API)**
- ✅ **Documentación automática** con Swagger UI
- ✅ **Validación robusta** de fechas y años
- ✅ **Autenticación por API Key** para operaciones de escritura
- ✅ **CORS habilitado** para uso desde aplicaciones web
- ✅ **Manejo de errores** descriptivo
- ✅ **Respuestas estructuradas** y consistentes
- ✅ **Ordenamiento automático** de feriados por fecha

### 🎨 **Frontend (Interfaz Web)**
- ✅ **Diseño moderno** con glassmorphism y gradientes
- ✅ **Dashboard interactivo** con estadísticas en tiempo real
- ✅ **Calendario visual** con feriados marcados e interactivo
- ✅ **Búsqueda avanzada** por año y fecha específica
- ✅ **Panel de administración** con autenticación segura
- ✅ **Diseño responsive** para todos los dispositivos
- ✅ **Notificaciones elegantes** y feedback visual
- ✅ **Navegación intuitiva** entre secciones

---

## 🔗 **Repositorio**

https://github.com/MarianaSardo/feriadobusatilapi.git

---

## 🎯 **Casos de Uso**

### Para Desarrolladores
- **Integración con aplicaciones** que necesiten datos de feriados
- **APIs públicas** que requieran información de fechas especiales
- **Sistemas de planificación** y calendarios

### Para Usuarios Finales
- **Consulta rápida** de feriados argentinos
- **Planificación** de actividades y viajes
- **Verificación** de fechas laborables

### Para Portafolios
- **Demostración de habilidades** en desarrollo full-stack
- **Integración frontend-backend** moderna
- **Sistema de autenticación** y seguridad
- **Diseño responsive** y UX profesional

## 📞 **Soporte**

Para consultas o problemas, crear un issue en el repositorio de GitHub. 