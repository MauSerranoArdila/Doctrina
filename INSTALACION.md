# Instalación y verificación

Requiere Node.js y una copia local de este repositorio accesible por el agente.
Para instalar también en Claude, usa una ruta sin espacios, como `C:/dev/Doctrina`.
Los adaptadores apuntan a esa copia; no descargan ni actualizan el repositorio.

## Preparar y aplicar

Desde el repositorio:

```sh
node scripts/instalar.mjs
node scripts/instalar.mjs --apply
node scripts/instalar.mjs --check
```

El primer comando muestra el resultado sin escribir. El segundo instala referencias
globales en `~/.codex/AGENTS.md` y `~/.claude/CLAUDE.md`. El tercero comprueba si
coinciden con los adaptadores esperados, sin ejecutar un modelo. Un resultado
pendiente devuelve código 1. La huella SHA-256 identifica el contenido de los siete
archivos de doctrina; no demuestra qué contenido leyó una sesión.

Usa `--destino codex` o `--destino claude` para un solo consumidor. Para perfiles
distintos, usa `--codex-home <directorio>` o `--claude-home <directorio>`.
Codex respeta `CODEX_HOME` cuando está definido; verifica que coincida con el perfil
desde el que abres la aplicación. Claude apunta por defecto a `~/.claude`.

El instalador conserva instrucciones ajenas, reemplaza solo su bloque administrado
y migra los imports antiguos que apuntan a esta misma fuente. Crea un respaldo
`.bak` antes de modificar un archivo existente. Se detiene ante bloques ambiguos
o un `AGENTS.override.md` global con contenido. No modifica ese override ni los
permisos, modelos, credenciales o configuraciones de ejecución.

Para revertir una modificación, restaura el respaldo identificado en la salida.
Si el archivo no existía, retira únicamente el bloque entre `doctrina:inicio` y
`doctrina:fin`. Conserva cualquier edición posterior del usuario.

## Qué se hereda

Codex recibe la instrucción global de leer el núcleo vigente, y consultar los módulos
pertinentes. Claude importa el núcleo y los seis módulos al iniciar. Los hooks
locales existentes de Claude siguen entregando el núcleo en cada turno; el
instalador no añade hooks a otros proyectos ni promete esa repetición global.

Los proyectos nuevos bajo ese perfil reciben la entrada global. Las instrucciones
específicas pueden modificar esos valores predeterminados. Otros computadores,
perfiles, contenedores o servicios en la nube requieren su propia instalación y
acceso a la fuente. Cambiar de ruta exige volver a ejecutar el instalador.

Los cambios de texto se toman de la fuente, sin regenerar copias. Abre una sesión
nueva para comprobar cambios de instrucciones iniciales; no asumas que una sesión
en curso ya los recibió.

## Comprobar una sesión real

Primero ejecuta los controles locales:

```sh
node candado-selftest.mjs
node --test scripts/instalar.test.mjs scripts/evaluar.test.mjs
node scripts/instalar.mjs --check
```

Después abre una sesión nueva en un proyecto distinto y solicita las fuentes de
instrucciones recibidas. En Codex, comprueba en la traza que efectivamente lee
`MANDATO.md`; una afirmación del agente por sí sola no prueba la lectura. En Claude,
revisa las fuentes de memoria con `/context`.

Para evaluar decisiones, utiliza los [casos de comportamiento](evaluaciones/README.md).
El ejecutor puede enviar doctrina e instrucciones cargadas al proveedor configurado:
requiere acceso de red y autorización para ese envío. Nunca convierte una ejecución
fallida o una respuesta sin revisar en conducta aprobada.

## Contexto propio de cada proyecto

Adapta [PROYECTO.md](plantillas/PROYECTO.md) al proyecto existente, conservando sus
instrucciones. No propagues comandos de pruebas ni decisiones de negocio a toda
la doctrina. Este instalador conecta criterios generales; no audita contradicciones
dentro de todos los proyectos.

Mecanismos documentados: [AGENTS.md de Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
y [memoria e imports de Claude Code](https://code.claude.com/docs/en/memory).
