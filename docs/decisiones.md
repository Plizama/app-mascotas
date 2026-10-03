# Alcance de la primera versión

- Fuente utilizada para implementación: solo pantallas 01 a 22 de la sección D. No se integraron las láminas A, B y C como pantallas ni funcionalidades adicionales. Perfil es el acceso de prueba necesario para la quinta pestaña presente en el diseño.
- Nombre de trabajo: App mascotas. No se define una marca nueva.
- El mapa se reproduce como esquema local. La extensión de escritorio añade una lista lateral para aprovechar el espacio; móvil mantiene la tarjeta inferior y navegación fija.
- Las vistas comparten una ficha y los cambios se agregan a su historial. Un interés de adopción nunca transfiere responsabilidad. Confirmar recepción sin aceptación produce un error.
- Las acciones de gestión se restringen en el controlador a la persona simulada responsable. Registrar una novedad puede hacerlo un cuidador, pero cambiar situación importante requiere responsable. Adoptado solo se obtiene por transferencia, no por el selector de situación.
- La pantalla 08 refleja eventos reales de la demo. Los eventos futuros del wireframe se incorporan al completar el flujo; no son actividades que hayan sucedido realmente.
- No se comunica con servicios ni personas externas. Todos los nombres y casos iniciales vienen de ejemplos de las pantallas.
- Tipografías Figtree y Bricolage Grotesque obtenidas del documento; uso local para reproducirlo. Las ilustraciones SVG de animales se crean con código y no se presentan como fotografías.
- La referencia del wireframe dice Canelo en hogar temporal y, en otro momento de su recorrido, adoptado. Se resuelve en una sola ficha mutable. El mismo criterio aplica a mascotas perdidas y encontradas.
- Sin dependencias npm, sin API keys ni instalaciones de paquetes Python; servido por Python 3 o Node.js.
- Limitaciones conocidas: selector de identidad sin autenticación, relaciones de amistad y me gusta simplificados para demo, sin múltiples sesiones conectadas, sin mapa geográfico real. Eventos, actividad y distancia iniciales son ejemplos estáticos. No existe importación JSON, solo exportación.
