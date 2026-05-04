Actúa como un diseñador UX/UI senior y desarrollador frontend senior. Necesito crear una interfaz web profesional, rápida, fluida y muy fácil de usar para una enfermera que trabaja en campo recopilando datos de personas desde una lista tipo Excel/CSV.

Contexto:
La usuaria principal será una enfermera que anda en la calle, bajo el sol, con poco tiempo y posiblemente usando celular o tablet. Por eso la interfaz debe ser extremadamente clara, rápida, con botones grandes, pocos pasos, buena legibilidad, buen contraste y navegación sencilla.

Objetivo del sistema:
Crear una aplicación web para registrar, consultar, editar, filtrar y exportar información de personas visitadas. Los datos vienen originalmente de un archivo Excel/CSV con campos como nombre, domicilio, calle, número de casa, colonia, teléfono y observaciones. La aplicación debe permitir trabajar con esos registros de forma ordenada y rápida.

Diseño general:
Crear un dashboard moderno, limpio y responsivo, optimizado para celular, tablet y computadora. El diseño debe ser amigable para personal de salud en campo. Usar una estética profesional, clara, con colores suaves pero de alto contraste. Evitar saturación visual. Priorizar velocidad de uso.

Pantallas necesarias:

1. Pantalla de inicio / Dashboard
Debe mostrar:
- Total de registros.
- Registros visitados.
- Registros sin visita.
- Registros con cambio de domicilio.
- Registros que no quisieron el programa.
- Registros fuera del país.
- Acceso rápido a “Nuevo registro”.
- Acceso rápido a “Buscar persona”.
- Acceso rápido a “Exportar CSV”.
- Últimos registros modificados.

2. Pantalla de listado de personas
Debe tener una tabla o lista responsiva con:
- Nombre completo.
- Calle.
- Número de casa.
- Colonia.
- Teléfono.
- Estado o etiquetas de validación.
- Botón para ver detalle.
- Botón para editar.

La tabla debe permitir:
- Ordenar alfabéticamente por nombre.
- Ordenar por colonia.
- Ordenar por calle/domicilio.
- Ordenar por número de casa.
- Filtrar por colonia.
- Filtrar por calle.
- Filtrar por número.
- Filtrar por estado.
- Buscar mientras se escribe.

La búsqueda debe ser rápida y debe permitir encontrar registros por:
- Nombre.
- Calle.
- Colonia.
- Número de casa.
- Teléfono.

3. Barra buscadora inteligente
Crear una barra de búsqueda visible y grande.
Debe funcionar mientras se escribe.
Debe tener selector de tipo de búsqueda:
- Buscar por nombre.
- Buscar por domicilio.
- Buscar por colonia.
- Buscar por teléfono.
- Buscar en todos los campos.

También debe permitir búsqueda exacta o búsqueda por coincidencia parcial, similar a un equals o contains.

4. Filtros avanzados
Crear una sección de filtros rápidos con chips, botones o checkboxes.
Los estados disponibles deben ser:
- Fuera del país.
- Sin visita.
- No se encontró en el momento.
- No quiso el programa.
- Cambio de domicilio.

Importante:
Un mismo registro puede tener más de un estado al mismo tiempo. Por ejemplo, una persona puede estar marcada como “Sin visita” y también “Fuera del país”. Por eso los estados deben funcionar como etiquetas múltiples, no como una sola opción obligatoria.

Los filtros deben permitir:
- Mostrar personas que tengan cualquiera de los estados seleccionados.
- Mostrar personas que tengan todos los estados seleccionados.
- Limpiar filtros fácilmente.
- Combinar filtros de estado con colonia, calle y búsqueda.

5. Formulario de nuevo registro / edición
Crear un formulario simple, rápido y validado.

Campos sugeridos:
- Nombre completo.
- Calle.
- Número de casa.
- Colonia.
- Teléfono.
- Referencias del domicilio.
- Observaciones.
- Estados/validaciones múltiples:
  - Fuera del país.
  - Sin visita.
  - No se encontró en el momento.
  - No quiso el programa.
  - Cambio de domicilio.
- Fecha de visita.
- Nombre de la enfermera o responsable.
- Última actualización.

Validaciones:
- Nombre obligatorio.
- Calle obligatoria.
- Colonia obligatoria.
- Número de casa obligatorio si aplica.
- Teléfono opcional, pero si se llena debe validar formato.
- Estados deben poder seleccionarse como múltiples opciones.
- Observaciones opcionales.
- Mostrar mensajes claros y humanos, no técnicos.

6. Pantalla de detalle del registro
Debe mostrar toda la información de la persona:
- Datos personales.
- Domicilio.
- Teléfono.
- Estados asignados.
- Observaciones.
- Historial de cambios.
- Fecha de última actualización.
- Botón editar.
- Botón marcar como visitado.
- Botón exportar o copiar información.

7. Exportación e importación
La aplicación debe permitir:
- Importar datos desde CSV.
- Exportar datos a CSV para abrirlos en Excel.
- Descargar respaldo CSV.
- Mostrar mensaje de confirmación después de exportar.
- Evitar pérdida de datos.

Flujo de almacenamiento recomendado:
Diseñar la interfaz considerando tres posibles modos de almacenamiento:

Modo 1: Local CSV
La enfermera puede importar un CSV, trabajar con los datos y descargar un CSV actualizado. Este modo es simple y útil si no hay internet estable.

Modo 2: Google Sheets como base de datos
La aplicación puede conectarse a Google Sheets para guardar y consultar datos en línea. Esto permite que varias personas consulten información actualizada. Se debe considerar una integración mediante API o Apps Script.

Modo 3: Base de datos web
Preparar la estructura para que en el futuro pueda conectarse a una base de datos real como Firebase, Supabase, PostgreSQL o MySQL.

Para el diseño y estructura del proyecto, dejar claro dónde se conectaría cada opción de almacenamiento.

Requisitos técnicos para cuando se pase a desarrollo:
Usar buenas prácticas de programación.
Crear una arquitectura limpia y fácil de modificar.
Documentar todo en español.
Separar componentes, servicios, modelos y utilidades.

Estructura sugerida del proyecto:

src/
  components/
    SearchBar/
    FilterPanel/
    DataTable/
    StatusTags/
    PersonForm/
    DashboardCards/
    ExportButton/
    ImportCSV/
  pages/
    DashboardPage/
    PeopleListPage/
    PersonDetailPage/
    PersonFormPage/
  services/
    csvService.js
    googleSheetsService.js
    storageService.js
  models/
    person.model.js
  utils/
    validators.js
    filters.js
    sorters.js
  data/
    sample-data.csv
  docs/
    README.md
    GUIA_USUARIO.md
    FLUJO_DATOS.md

Componentes principales:

SearchBar:
Debe manejar búsqueda en tiempo real, búsqueda exacta y búsqueda parcial.

FilterPanel:
Debe manejar filtros por colonia, calle, número y estados múltiples.

DataTable:
Debe mostrar los registros de forma clara, permitir ordenar y abrir detalles.

StatusTags:
Debe mostrar etiquetas visuales para:
- Fuera del país.
- Sin visita.
- No se encontró en el momento.
- No quiso el programa.
- Cambio de domicilio.

PersonForm:
Debe validar campos antes de guardar.

csvService:
Debe encargarse de importar y exportar archivos CSV.

googleSheetsService:
Debe quedar preparado para conectar con Google Sheets.

storageService:
Debe decidir si los datos se guardan localmente, en CSV, Google Sheets o base de datos.

validators:
Debe contener todas las reglas de validación.

filters:
Debe contener la lógica de búsqueda y filtrado.

sorters:
Debe contener la lógica para ordenar por nombre, colonia, calle y número.

README:
Debe explicar:
- Cómo instalar el proyecto.
- Cómo ejecutar el proyecto.
- Cómo importar un CSV.
- Cómo exportar un CSV.
- Cómo modificar campos.
- Cómo conectar Google Sheets.
- Cómo cambiar colores y diseño.
- Cómo agregar nuevos filtros.

Experiencia de usuario:
La enfermera debe poder hacer todo en pocos toques.
La búsqueda debe estar siempre visible.
Los botones principales deben ser grandes.
Los filtros deben ser fáciles de activar y desactivar.
Los estados deben verse como etiquetas de colores.
Debe haber confirmaciones claras al guardar.
Debe haber mensajes de error simples.
La interfaz debe cargar rápido.
Debe ser usable en exteriores, con buena lectura bajo luz fuerte.

Diseño visual:
Usar un diseño tipo sistema médico/comunitario.
Colores sugeridos:
- Fondo claro.
- Verde o azul como color principal.
- Gris suave para secciones.
- Etiquetas de colores para estados.
- Botones grandes y redondeados.
- Tipografía clara y legible.
- Espaciado amplio.

Elementos importantes:
- Modo móvil primero.
- Dashboard simple.
- Tabla/lista rápida.
- Buscador grande.
- Filtros visibles.
- Formulario corto.
- Exportar CSV.
- Importar CSV.
- Preparado para Google Sheets.
- Documentación en español.

Genera:
1. Diseño completo de la interfaz.
2. Flujo de navegación entre pantallas.
3. Componentes reutilizables.
4. Propuesta visual moderna y profesional.
5. Documentación en español.
6. Explicación clara de la arquitectura.
7. Recomendaciones para conectar Google Sheets como base de datos.
8. Código o estructura preparada para que después pueda continuar el desarrollo en Codex.

No hagas una interfaz complicada. Prioriza rapidez, claridad, buena validación de datos y facilidad de uso en campo.