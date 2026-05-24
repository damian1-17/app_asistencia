# Guia de Estilo UI

## Objetivo
Esta guia define el lenguaje visual de `app_asistencia` para que nuevas pantallas, componentes y ajustes mantengan una apariencia moderna, profesional y consistente.

La referencia viva del sistema esta en [src/style.css](D:/Programacion/RegistroApp/app_asistencia/src/style.css).

## Direccion visual
- La interfaz debe sentirse institucional, tecnologica y confiable.
- El estilo evita recursos infantiles, emojis y efectos decorativos sin proposito.
- La prioridad visual es claridad, jerarquia y sensacion de producto serio para eventos.
- Los acentos deben usarse para guiar acciones y estados, no para saturar la interfaz.

## Principios
- Claridad primero: cada pantalla debe dejar evidente que informacion es principal y que accion sigue.
- Sobriedad: preferir composiciones limpias antes que interfaces ruidosas.
- Consistencia: botones, tarjetas, badges, inputs e iconos deben comportarse igual en toda la app.
- Accion visible: estados de carga, error, exito y disponibilidad deben ser faciles de reconocer.
- Movilidad real: los layouts deben sentirse correctos tanto en desktop como en mobile.

## Tipografia
- Fuente principal: `Manrope`.
- Tono tipografico: firme, limpio, contemporaneo.
- Titulares:
  - Usar pesos `700` u `800`.
  - Reducir ligeramente el tracking en encabezados grandes.
  - Mantener alto contraste y line-height corto.
- Texto secundario:
  - Usar `--color-text-secondary`.
  - Evitar bloques muy largos; preferir mensajes directos.
- Etiquetas:
  - Usar uppercase con tracking amplio para kicker, labels y metadata.

## Paleta
### Colores base
- `--color-bg-primary`: `#06111f`
- `--color-bg-secondary`: `#0d1b2c`
- `--color-bg-tertiary`: `#13243a`

### Colores de marca
- `--color-mtts-cyan`: `#00A9E0`
- `--color-mtts-blue`: `#00629B`
- `--color-epn-red`: `#E2001A`
- `--color-epn-blue`: `#002D62`

### Texto
- `--color-text-primary`: `#f5f7fb`
- `--color-text-secondary`: `#afbed3`
- `--color-text-muted`: `#73839a`

### Estados
- Exito: `--color-success`
- Advertencia: `--color-warning`
- Error: `--color-danger`
- Acento principal: `--color-accent`

## Fondos y superficies
- El fondo general usa `--gradient-hero`.
- Las superficies premium usan `--gradient-card`.
- `.glass` se usa para paneles destacados o modales visualmente importantes.
- `.card` se usa para bloques principales con jerarquia alta.
- `.card-flat` se usa para estados vacios, bloques auxiliares o contenido menos prioritario.

## Bordes, radios y sombras
- Radios:
  - Tarjetas: entre `1rem` y `1.5rem`.
  - Botones principales: `999px`.
  - Inputs: `1rem`.
- Bordes:
  - Siempre sutiles, usando `--color-border` o `--color-border-subtle`.
- Sombras:
  - Deben dar profundidad sin parecer brillo artificial.
  - Evitar glow excesivo salvo en acentos puntuales.

## Botones
### Tipos
- `.btn-primary`: accion principal de la pantalla.
- `.btn-secondary`: accion secundaria con peso medio.
- `.btn-ghost`: accion terciaria o contextual.
- `.btn-danger`: acciones destructivas o cierre de sesion.

### Reglas
- Incluir icono cuando mejore escaneo rapido.
- No usar mas de una accion primaria dominante por bloque.
- Mantener copy corto y directo.
- Los estados hover deben ser sutiles: elevacion leve y mejor contraste.

## Inputs y formularios
- Los inputs usan fondo oscuro, borde suave y foco con halo de acento.
- Los labels deben permanecer visibles; no depender solo del placeholder.
- Los mensajes de error deben acompañarse con icono y texto concreto.
- En formularios largos, agrupar acciones y feedback cerca del campo afectado.

## Iconografia
- No usar emojis en interfaz.
- Todo icono debe salir de [src/components/shared/AppIcon.vue](D:/Programacion/RegistroApp/app_asistencia/src/components/shared/AppIcon.vue).
- Los iconos son lineales, simples y funcionales.
- Usarlos para:
  - Navegacion
  - Estados
  - Metadatos
  - Acciones
- No usarlos como decoracion gratuita.

## Layout
- El contenedor base usa `.container` con max-width de `1200px`.
- Los bloques principales deben respirar; evitar pantallas demasiado compactas.
- En desktop, preferir composiciones de 2 columnas solo si aportan jerarquia clara.
- En mobile, colapsar a una sola columna sin perder prioridad visual.

## Componentes clave
### Navbar
- Transparencia oscura con blur.
- Logo compacto y reconocible.
- Acciones de usuario agrupadas y limpias.

### Dashboard
- Sidebar con identidad clara del usuario.
- Navegacion breve, escaneable y con estado activo fuerte.

### QR Cards
- Deben sentirse como credenciales digitales.
- El QR es el protagonista visual.
- Metadata y acciones deben ser secundarias pero accesibles.

### Alerts
- Mensaje corto, icono claro y color por estado.
- No usar alertas invasivas si el contexto puede resolverse inline.

## Movimiento
- Usar transiciones cortas y naturales.
- La animacion debe comunicar cambio de estado, no decorar por decorar.
- Mantener `fade`, `slideInUp` y transiciones de elevacion leves.
- Evitar rebotes, spins innecesarios o animaciones demasiado vistosas.

## Tono de contenido UI
- Profesional y directo.
- Claro para usuarios no tecnicos.
- Evitar frases exageradas o marketing vacio.
- Preferir verbos concretos:
  - `Iniciar sesion`
  - `Descargar`
  - `Actualizar`
  - `Reintentar`

## Do
- Reutilizar tokens CSS existentes.
- Reutilizar componentes base antes de crear variantes nuevas.
- Mantener consistencia entre vistas publicas y privadas.
- Usar badges y estados con moderacion.
- Diseñar pensando primero en legibilidad.

## Don't
- No introducir emojis.
- No mezclar estilos glossy, neomorphism o glass sin criterio.
- No usar colores aleatorios fuera de la paleta.
- No llenar cada bloque con bordes, sombras y gradientes al mismo tiempo.
- No convertir pantallas serias en landings decorativas.

## Checklist antes de cerrar una UI
- La accion principal se identifica en menos de 3 segundos.
- Los estados de error, carga y exito son claros.
- Los iconos vienen del sistema compartido.
- La pantalla funciona bien en mobile.
- Los contrastes son consistentes con el resto de la app.
- El resultado se siente institucional y no generico.

## Archivos fuente del sistema
- [src/style.css](D:/Programacion/RegistroApp/app_asistencia/src/style.css)
- [src/components/shared/AppIcon.vue](D:/Programacion/RegistroApp/app_asistencia/src/components/shared/AppIcon.vue)
- [src/components/shared/AlertMessage.vue](D:/Programacion/RegistroApp/app_asistencia/src/components/shared/AlertMessage.vue)
- [src/components/layout/AppNavbar.vue](D:/Programacion/RegistroApp/app_asistencia/src/components/layout/AppNavbar.vue)
- [src/components/qr/QrCard.vue](D:/Programacion/RegistroApp/app_asistencia/src/components/qr/QrCard.vue)
