# Sistema de Enfermería de Campo

Aplicación web profesional para enfermeras que trabajan en campo, diseñada para recopilar, gestionar y dar seguimiento a datos de personas visitadas.

## Características Principales

### Dashboard Intuitivo
- Estadísticas en tiempo real de todos los registros
- Total de registros, visitados, sin visita, cambios de domicilio, etc.
- Últimos registros modificados
- Accesos rápidos a funciones principales

### Gestión de Personas
- **Agregar nuevos registros** con validaciones completas
- **Editar registros existentes** con toda la información
- **Ver detalles completos** de cada persona
- **Búsqueda inteligente** en tiempo real con múltiples opciones:
  - Buscar por nombre
  - Buscar por domicilio
  - Buscar por colonia
  - Buscar por teléfono
  - Buscar en todos los campos
  - Coincidencia parcial o exacta

### Filtros Avanzados
- **Estados múltiples** (una persona puede tener varios estados):
  - Fuera del país
  - Sin visita
  - No se encontró en el momento
  - No quiso el programa
  - Cambio de domicilio
- **Filtrar por cualquiera** de los estados seleccionados
- **Filtrar por todos** los estados seleccionados
- Combinar búsqueda con filtros de estado

### Ordenamiento de Datos
- Ordenar por nombre (alfabéticamente)
- Ordenar por colonia
- Ordenar por calle
- Ordenar por número de casa
- Orden ascendente o descendente

### Importar y Exportar
- **Importar desde CSV/Excel**: Carga masiva de datos desde archivos CSV
- **Exportar a CSV**: Descarga todos los datos para uso en Excel
- Compatible con formato estándar de hojas de cálculo

### Almacenamiento
- **Almacenamiento local** en el navegador (localStorage)
- Los datos persisten entre sesiones
- No requiere conexión a internet para funcionar
- Datos de ejemplo incluidos para comenzar

## Diseño Mobile-First

La aplicación está optimizada para uso en campo:
- ✅ Diseño responsivo para celular, tablet y computadora
- ✅ Botones grandes y fáciles de presionar
- ✅ Alto contraste para lectura bajo el sol
- ✅ Interfaz simple y rápida
- ✅ Validaciones claras y mensajes en español
- ✅ Navegación intuitiva

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/           # Componentes reutilizables
│   │   ├── DashboardCards.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatusTags.tsx
│   │   ├── PersonForm.tsx
│   │   ├── ImportCSV.tsx
│   │   ├── ExportButton.tsx
│   │   └── ui/              # Componentes de interfaz base
│   ├── pages/               # Páginas principales
│   │   ├── DashboardPage.tsx
│   │   ├── PeopleListPage.tsx
│   │   ├── PersonDetailPage.tsx
│   │   └── PersonFormPage.tsx
│   ├── models/              # Modelos de datos
│   │   └── person.model.ts
│   ├── services/            # Servicios
│   │   ├── csvService.ts
│   │   └── storageService.ts
│   ├── utils/               # Utilidades
│   │   ├── validators.ts
│   │   ├── filters.ts
│   │   └── sorters.ts
│   └── App.tsx             # Componente principal
└── styles/                 # Estilos
    ├── theme.css
    └── ...
```

## Campos de Información

Cada registro de persona incluye:
- **Nombre completo** (obligatorio)
- **Calle** (obligatorio)
- **Número de casa**
- **Colonia** (obligatorio)
- **Teléfono** (opcional, con validación de formato)
- **Referencias del domicilio**
- **Observaciones**
- **Estados/validaciones** (múltiples)
- **Fecha de visita**
- **Enfermera responsable**
- **Fecha de creación**
- **Última actualización**

## Navegación

La aplicación tiene las siguientes rutas:

- `/` - Dashboard principal
- `/personas` - Listado completo con búsqueda y filtros
- `/personas/nuevo` - Formulario para nuevo registro
- `/personas/:id` - Detalle de una persona
- `/personas/:id/editar` - Editar registro existente

## Tecnologías Utilizadas

- **React 18** con TypeScript
- **React Router** para navegación
- **Tailwind CSS v4** para estilos
- **shadcn/ui** para componentes de interfaz
- **Lucide React** para iconos
- **Sonner** para notificaciones
- **LocalStorage** para persistencia de datos

## Próximos Pasos (Futuro)

La aplicación está preparada para conectarse a:

### Opción 1: Google Sheets como Base de Datos
- Permitiría colaboración entre múltiples enfermeras
- Sincronización en tiempo real
- Acceso desde cualquier dispositivo

### Opción 2: Base de Datos Web
- Supabase, Firebase o PostgreSQL
- Autenticación de usuarios
- Backup automático
- Mayor seguridad

## Uso de la Aplicación

### Importar Datos desde CSV

1. Haz clic en "Importar CSV" en el dashboard
2. Selecciona tu archivo CSV/Excel
3. El sistema importará automáticamente las columnas que coincidan con:
   - Nombre, Calle, Número, Colonia, Teléfono, Referencias, Observaciones, Enfermera

### Exportar Datos a CSV

1. Haz clic en "Exportar CSV"
2. Se descargará un archivo con todos los registros
3. Abre el archivo en Excel para análisis o respaldo

### Agregar Nueva Persona

1. Haz clic en "Nuevo Registro"
2. Llena los campos obligatorios (nombre, calle, colonia)
3. Selecciona los estados que apliquen
4. Agrega observaciones si es necesario
5. Haz clic en "Crear Registro"

### Buscar y Filtrar

1. Usa la barra de búsqueda en la parte superior
2. Selecciona el tipo de búsqueda (nombre, domicilio, etc.)
3. Activa filtros de estado en el panel lateral
4. Los resultados se actualizan en tiempo real

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Desarrollado para facilitar el trabajo en campo de enfermeras comunitarias**
