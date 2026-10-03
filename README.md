# App mascotas · primera versión funcional

Aplicación web responsiva basada en las **22 pantallas de D · Wireframes, desde 01 · Mapa principal** del documento proporcionado. El diseño conserva la paleta crema/verde, la navegación de cinco pestañas, las tipografías locales y la separación entre situación, salud aparente y roles. Las fotografías del original son marcadores de color; aquí se representan con ilustraciones simples. Puedes subir fotos propias.

## Iniciar en Windows (la opción más fácil)

1. Extrae el ZIP completo. No abras el proyecto desde dentro del ZIP.
2. Abre la carpeta `app-mascotas`.
3. Haz doble clic en **INICIAR-WINDOWS.bat**. Usa Python 3, sin instalar paquetes.
4. Entra a **http://localhost:8000**. Si el navegador se abre antes que el servidor, recarga.
5. Deja abierta la ventana del servidor. Para detenerlo: Ctrl+C.

Si ya ejecutas archivos `.py` en tu PC, normalmente tienes todo lo necesario. No necesita Kivy.

También puedes abrir PowerShell en la carpeta y ejecutar:

```powershell
py -m http.server 8000 --bind 0.0.0.0
```

Si `py` no existe, usa `python` en su lugar. Si el puerto está ocupado, reemplaza `8000` por `8001` tanto en el comando como en la URL.

## Alternativa con Node.js 20 o superior

```sh
npm start
```

No necesitas `npm install`: no hay dependencias externas. `npm test` ejecuta las pruebas del modelo de datos.

## Ver en tu celular

Conecta PC y celular a la misma Wi-Fi. En Windows ejecuta `ipconfig`, identifica la dirección IPv4 del adaptador Wi-Fi y abre `http://ESA-IP:8000` en el navegador del celular. Si Windows pregunta, permite acceso del servidor en tu red privada. Los datos de cada navegador son independientes. Para visualizar solo el tamaño móvil en el PC, usa F12 y el modo de dispositivo.

La ubicación automática normalmente exige HTTPS o localhost: en el celular puedes escribir el lugar manualmente. Para las alertas se requieren coordenadas reales en la ficha; los puntos ficticios de la demo no generan avisos. Las imágenes se guardan reducidas en el navegador.

## Qué puedes probar

- Buscar animales, seleccionar marcadores y filtrar por situación, especie, salud, distancia y actividad.
- Usar Agregar mascota, revisar comentarios entrantes de tus casos en Mensajes y consultar alertas graves próximas.
- Consultar fichas, historial y roles; registrar avistamientos, fotos y comentarios.
- Reportar un animal con un paso de posibles coincidencias para evitar duplicados.
- Ofrecer ayuda, asumir tareas de rescate y expresar interés en adoptar antes del rescate.
- Ver mascotas propias y animales que cuidas; marcar mascotas como perdidas/encontradas y ponerlas en adopción.
- Administrar Chocolate como responsable, aceptar su cuidador y registrar novedades.
- Completar una adopción con doble confirmación sin crear una ficha nueva.
- Publicar fotos y texto en PetSocial, dar me gusta, comentar, agregar amigos y cambiar de mascota.

**Perfil** incluye un índice con las 22 pantallas y un selector de persona para probar permisos. No es un login real.

### Prueba rápida de adopción

1. En Perfil cambia la persona activa a **Carolina M.**.
2. Desde el índice abre **15 · Transferencia / adopción** de Canelo.
3. Acepta la adopción para **Sofía L.**.
4. En Perfil cambia a **Sofía L.** y vuelve a la pantalla 15.
5. Pulsa **Confirmo que recibí a Canelo**.
6. Revisa Mis mascotas y el historial: conserva el ID A-2041 y todos sus eventos.

### Qué está simulado

Esta es una primera versión funcional para validar diseño y flujos, no un servicio público. El mapa es esquemático como en el documento; no utiliza mapas reales ni calcula distancias geográficas. La comparación de duplicados usa especie y ejemplos cercanos, no reconocimiento visual. Las distancias y horas de los animales iniciales son de demostración; no se actualizan con el reloj. Las ofertas, mensajes y adopciones ocurren únicamente en el navegador: no envían avisos reales ni contactan personas.

Los cambios de prueba se guardan en `sessionStorage`: sobreviven a recargas de la misma pestaña y se descartan al cerrarla. No se escriben en `localStorage` ni en una base de datos. Puedes exportar JSON en Perfil; ese archivo descargado sí queda bajo tu control. Mensajes reúne comentarios nuevos de los casos en que participa la persona activa; las alertas se calculan dentro de la app y no son notificaciones push. No hay servidor de base de datos, autenticación, chat entre PCs, notificaciones, Registro Nacional de Mascotas ni validación veterinaria. Las cuentas simuladas están disponibles para probar permisos, no ofrecen seguridad de producción. La ficha de historial refleja el estado actual: Canelo empieza en hogar temporal y queda adoptado después de completar ambos pasos; no se muestra adoptado artificialmente antes.

## Estructura

```text
app-mascotas/
  index.html                 Entrada de la aplicación
  INICIAR-WINDOWS.bat         Inicio sencillo con Python
  server.mjs                 Servidor estático opcional con Node
  package.json               Comandos de ejecución y pruebas
  src/
    app.js                   Navegación y acciones
    components/ui.js         Componentes HTML compartidos
    data/seed.js             Datos iniciales de demostración
    data/catalog.js          Opciones y catálogo de pantallas
    services/repository.js   Acceso a datos de demo por sesión
    services/store.js        Reglas y consultas del estado
    views/views.js           Pantallas y formularios
    styles/app.css           Diseño y adaptación a tamaños de pantalla
  public/assets/             Tipografías locales del diseño
  docs/                      Cobertura de pantallas y decisiones
  tests/                     Pruebas de las reglas principales
```

## Cómo seguir modificándola

Para colores, tamaños y responsividad: `src/styles/app.css`. Para textos y contenido de pantallas: `src/views/views.js`. Para cambiar los ejemplos iniciales: `src/data/seed.js` y después Restablecer demo en Perfil. `src/services/repository.js` es el punto de acceso que usa la app; hoy carga esos ejemplos y conserva los cambios solo en la sesión de la pestaña. Para comportamientos: `src/app.js`; para opciones: `src/data/catalog.js`; para reglas de adopción: `src/services/store.js`.

Los cambios de código se ven al recargar el navegador. El proyecto usa HTML, CSS y módulos JavaScript nativos para mantenerlo fácil de ejecutar y editar. No requiere compilación. La siguiente etapa técnica puede separar cada pantalla en un archivo, agregar un backend, cuentas reales y un proveedor de mapa.

Para trabajar con Codex, abre esta carpeta como proyecto y pídele un cambio concreto, indicando pantalla, comportamiento esperado y cómo verificarlo. Este README y `docs/pantallas.md` proporcionan el contexto base.
