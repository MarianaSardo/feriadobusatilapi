# Frontend - API de Feriados Bursátiles Argentina

Un frontend moderno y responsive para la API de Feriados Bursátiles Argentina, diseñado para portafolios profesionales.

## 🚀 Características

### ✨ Diseño Moderno
- **Interfaz elegante** con gradientes y efectos de glassmorphism
- **Diseño responsive** que se adapta a todos los dispositivos
- **Animaciones suaves** y transiciones fluidas
- **Iconografía moderna** con Font Awesome

### 📊 Dashboard Interactivo
- **Estadísticas en tiempo real** del total de feriados
- **Próximos feriados** con contador de días restantes
- **Búsqueda avanzada** por año o fecha específica
- **Resultados visuales** con tarjetas atractivas

### 📅 Calendario Interactivo
- **Vista mensual** con navegación intuitiva
- **Marcado de feriados** con iconos especiales
- **Día actual resaltado** para fácil identificación
- **Tooltips informativos** al pasar el mouse sobre feriados

### 🔧 Panel de Administración
- **Agregar feriados** con validación de API Key
- **Eliminar feriados** de forma segura
- **Mensajes de confirmación** para todas las operaciones
- **Validación de formularios** en tiempo real

### 🔔 Notificaciones
- **Toast notifications** para feedback inmediato
- **Mensajes de error** descriptivos
- **Indicadores de carga** durante operaciones

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Flexbox y Grid
- **JavaScript ES6+** - Funcionalidad interactiva
- **Fetch API** - Comunicación con el backend
- **Font Awesome** - Iconografía
- **Google Fonts** - Tipografía Inter

## 📁 Estructura de Archivos

```
frontend/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
└── README_FRONTEND.md  # Este archivo
```

## 🚀 Cómo Usar

### 1. Preparación
Asegúrate de que tu API esté ejecutándose en `http://localhost:8000`

### 2. Ejecutar el Frontend
Simplemente abre el archivo `index.html` en tu navegador web.

### 3. Navegación
- **Dashboard**: Vista principal con estadísticas y búsqueda
- **Calendario**: Vista mensual de feriados
- **Admin**: Panel de administración (requiere API Key)

## 🎯 Funcionalidades Principales

### Dashboard
- **Estadísticas**: Muestra el total de feriados, próximos feriados y año actual
- **Búsqueda**: Consulta feriados por año o fecha específica
- **Próximos Feriados**: Lista los próximos 5 feriados con días restantes

### Calendario
- **Navegación**: Cambia entre meses con botones intuitivos
- **Visualización**: Los feriados se marcan con colores especiales
- **Interactividad**: Hover effects y tooltips informativos

### Administración
- **Agregar Feriados**: Formulario con validación completa
- **Eliminar Feriados**: Eliminación segura con confirmación
- **Autenticación**: Requiere API Key para operaciones sensibles

## 🎨 Características de Diseño

### Paleta de Colores
- **Primario**: Gradiente azul-púrpura (#667eea → #764ba2)
- **Éxito**: Verde (#56ab2f)
- **Error**: Rojo (#ff416c)
- **Advertencia**: Amarillo (#ffd700)

### Efectos Visuales
- **Glassmorphism**: Efectos de vidrio esmerilado
- **Backdrop Filter**: Desenfoque de fondo
- **Box Shadows**: Sombras suaves y elegantes
- **Gradientes**: Transiciones de color fluidas

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Adaptación automática a diferentes pantallas
- **Touch Friendly**: Botones y controles optimizados para touch

## 🔧 Configuración

### Cambiar URL de la API
En `script.js`, línea 2:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Cambia por tu URL
```

### Personalizar Colores
En `styles.css`, puedes modificar las variables CSS para cambiar la paleta de colores.

## 📱 Compatibilidad

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🚀 Optimizaciones

- **Lazy Loading**: Carga de datos bajo demanda
- **Error Handling**: Manejo robusto de errores
- **Performance**: Código optimizado para velocidad
- **Accessibility**: Navegación por teclado y lectores de pantalla

## 🎯 Casos de Uso

### Para Portafolios
- **Demostración técnica** de habilidades frontend
- **Integración con APIs** reales
- **Diseño moderno** que impresiona
- **Funcionalidad completa** que muestra capacidades

### Para Usuarios
- **Consulta rápida** de feriados
- **Planificación** de actividades
- **Administración** de datos (con permisos)

## 🔒 Seguridad

- **API Key Protection**: Las operaciones sensibles requieren autenticación
- **Input Validation**: Validación en frontend y backend
- **CORS Configuration**: Configurado para permitir comunicación segura

## 📈 Próximas Mejoras

- [ ] **Modo oscuro** toggle
- [ ] **Exportar datos** a PDF/Excel
- [ ] **Notificaciones push** para feriados próximos
- [ ] **Filtros avanzados** por tipo de feriado
- [ ] **Gráficos estadísticos** con Chart.js

## 🤝 Contribución

Si quieres contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para mostrar habilidades de desarrollo frontend** 