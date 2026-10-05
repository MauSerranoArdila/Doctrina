# Doctrina de trabajo

Criterios compartidos para trabajar con autonomía, claridad y evidencia.
La instrucción actual del usuario define el objetivo y el alcance; la doctrina
aporta valores predeterminados y respeta los permisos y restricciones del entorno.

Para conectarlos a Codex y Claude, consulta [instalación y verificación](INSTALACION.md).
El [ejecutor y los casos de evaluación](evaluaciones/README.md) permiten observar
el comportamiento. La [plantilla de proyecto](plantillas/PROYECTO.md) separa los
criterios generales del contexto específico.

## Fuente canónica

[MANDATO.md](MANDATO.md) contiene el núcleo que se entrega en cada turno. Se edita
directamente aquí: no es un resumen que haya que sincronizar con otro documento.
Los módulos desarrollan su aplicación; si una ampliación lo contradice, corrige
la ampliación. Una nueva regla general se decide primero en el núcleo.

| Archivo | Aplicación |
|---|---|
| [00-mandato.md](00-mandato.md) | Evaluar requisitos y elegir soluciones |
| [01-hablar.md](01-hablar.md) | Explicar, recomendar y comunicar avances |
| [02-verificar.md](02-verificar.md) | Elegir evidencia, corregir pruebas y evitar regresiones |
| [03-cerrar.md](03-cerrar.md) | Delimitar el trabajo y mantener el estado vigente |
| [04-entorno.md](04-entorno.md) | Organizar archivos, evaluar fuentes y mantener memoria |
| [05-limites.md](05-limites.md) | Resolver con autonomía y pedir intervención cuando hace falta |
| [casos/](casos/) | Evidencia histórica fechada; puede citar reglas anteriores |

Los nombres de los módulos se conservan para mantener las rutas de importación.
Los casos se consultan como contexto histórico; no se inyectan como reglas vigentes.

## Carga y comprobación

La configuración local [.claude/settings.json](.claude/settings.json) declara:

- `UserPromptSubmit`: ejecuta [inject-mandato.mjs](inject-mandato.mjs), que lee el
  núcleo junto al script y lo entrega sin comentarios HTML.
- `SessionStart`: ejecuta [candado-selftest.mjs](candado-selftest.mjs).

Los consumidores pueden importar los módulos mediante sus archivos `CLAUDE.md`.
Para reutilizar el núcleo, configura el hook apuntando a este script, sin copiar
su contenido. Las rutas de la configuración local corresponden a esta máquina.

Ejecuta la comprobación después de editar el núcleo o los scripts:

```sh
node candado-selftest.mjs
```

El contrato estructural es un encabezado `# Mandato` y ocho reglas con cuerpo,
numeradas del 1 al 8 en orden y sin duplicados. Si se cambia deliberadamente esa
estructura, se actualizan la validación y las pruebas en el mismo cambio.

Ante una fuente ausente o inválida, el hook emite `MANDATO NO CARGADO` por la salida
estándar y termina con código 0 para conservar el canal de aviso existente. El
self-test sí termina con código 1 cuando falla una comprobación. Este mecanismo
no bloquea la tarea y no garantiza que la interfaz muestre el aviso.

Las pruebas del hook comprueban rechazo de fuentes inválidas, entrega íntegra, eliminación
de comentarios y lectura de la fuente real desde otro directorio. No detectan
cambios de significado ni demuestran que el agente obedezca las reglas. Eso requiere
observar sesiones con casos representativos. La configuración local no demuestra
por sí sola que otros proyectos estén conectados.

## Mantenimiento

Antes de añadir una regla, identifica qué fallo recurrente resolvería y si una
regla existente ya lo cubre. Prefiere aclarar o simplificar antes de añadir proceso.
Revisa coherencia entre núcleo y módulos, ejecuta las pruebas cuando corresponda
y comunica el alcance de lo comprobado.
