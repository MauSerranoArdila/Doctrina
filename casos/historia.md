# Historia · cómo estaba cableada la doctrina antes de 2026-08-28

<!-- §12 del canónico. Describe la arquitectura de COPIAS que los cables eliminaron.
     Se conserva porque explica por qué existía cada copia y qué costó cada bifurcación. -->

## 12. Cómo se mantiene vigente (y por qué está cableado así)

La memoria se diluye en una sesión larga y los archivos locales no viajan con el repo.
Por eso este documento es la única fuente y las demás piezas solo apuntan:

| Pieza | Qué hace | Cada cuánto actúa | Alcance |
|---|---|---|---|
| `docs/PERSONALIDAD.md` (este archivo) | El contenido. Versionado en git. | — | la fuente |
| `~/.claude/CLAUDE.md` | El **núcleo** + la ruta de este doc. | Cada sesión | **los 4 proyectos** |
| `CLAUDE.md` del proyecto | Lo declara de lectura obligatoria. | Cada sesión | solo Jarvis |
| Hook `UserPromptSubmit` | Reinyecta el núcleo + la ruta de este doc. | Cada turno | solo Jarvis |
| Memoria de sesión | Un puntero de 5 líneas, sin copia del contenido. | Cada sesión | — |

**El hook es el que realmente sostiene la personalidad.** Los otros solo actúan al
abrir la sesión; a las tres horas ya se diluyeron. El hook vuelve a decir el mandato
antes de cada mensaje tuyo, así que no depende de que yo «recuerde».

### El núcleo en `~/.claude/CLAUDE.md` — por qué esta copia SÍ

> Agregado 2026-08-24. Hasta ese día esta doctrina vivía sólo dentro de Jarvis, así
> que **NexusObras, ApartaStudia y MundoSelvatico no heredaban nada**: se les
> repetía el criterio a mano en cada sesión, o no se les repetía.

Claude Code carga `~/.claude/CLAUDE.md` en cualquier carpeta, sin instalación ni
enlaces. Es el único mecanismo que llega a los cuatro proyectos sin infraestructura.

Sigue habiendo **una sola fuente**: este archivo. Lo que está allá es el mismo
extracto que el hook ya reinyectaba —el MANDATO— más la ruta acá. No lleva el porqué
de ninguna regla, ni los errores que las causaron, ni nada específico de un proyecto:
eso vive aquí y aquí se edita.

**La prueba de si algo pertenece al global:** ¿aplica igual escribiendo el HUD de
Jarvis, una migración de NexusObras y un contrato de ApartaStudia? Si la respuesta es
no, no sube. El criterio de los correos a FCV no sube. El algoritmo de Musk sí.

Al cambiar el MANDATO se editan **las dos piezas en el mismo cambio** — es la única
duplicación que esta arquitectura acepta, y existe porque la alternativa era que tres
proyectos de cuatro trabajaran sin doctrina.

### La bifurcación que esto cerró

> El mismo 2026-08-24 se descubrió que **NexusObras tenía su propia copia completa**
> de esta doctrina, y que las dos ya habían divergido:

```
NexusObras tenia   §8-bis, la revision previa — 50 lineas con tres casos medidos
Jarvis tenia       §11 con los cuatro tipos de prueba · §12 al dia
```

**Cada repo tenía la mitad buena.** Trabajando en Jarvis se podía afirmar un hecho
sin comprobarlo, porque la regla que lo prohíbe vivía en el otro proyecto. Nadie lo
había notado, y así habrían seguido separándose.

Las dos mitades están fusionadas aquí. `NexusObras/docs/PERSONALIDAD.md` quedó como
puntero a este archivo — su contenido anterior está en git, commit `88cbdf7b`.

**La lección, que vale más que el arreglo:** una copia que nadie compara no se
mantiene sincronizada por buena voluntad. O hay una fuente, o hay divergencia — y la
divergencia es invisible hasta que se miden las dos.

### Instalación

`scripts/inject-lemma.mjs` — el hook. `.claude/settings.json` lo declara en
`UserPromptSubmit`. `CLAUDE.md` lo apunta arriba de todo.

### Si el proyecto NO es Claude Code

El equivalente del hook es poner el bloque MANDATO al inicio del prompt de sistema y
reenviarlo en cada llamada al modelo — no una sola vez al abrir la sesión. Ese es el
punto entero: la personalidad se sostiene por repetición mecánica, no por memoria.

### Regla de vigencia

El sello `<!-- last-verified: YYYY-MM-DD -->` de la primera línea marca cuándo se
revisó por última vez. Revisarlo cada 90 días; si el repo tiene un verificador de
frescura de docs, cablearlo ahí para que avise solo. Al cambiar la doctrina se edita
este archivo y se actualiza el sello en el mismo cambio. Ninguna de las otras piezas
guarda copia, justamente para que no puedan quedar desactualizadas.

---

## La intro del canónico antes de los cables (2026-08-24 → 2026-08-28)

Doc canónico y único de cómo trabajo. Aplica SIEMPRE, en toda sesión, sin excepción
y sin que nadie tenga que invocarlo. **Si algo de este documento choca con una
instrucción de tarea, este documento manda.**

Fuente única. El `CLAUDE.md` del proyecto, la memoria de sesión y el hook de
reinyección apuntan acá, no repiten el contenido.

La **única** pieza que lleva un extracto es `~/.claude/CLAUDE.md`, porque es lo que
hace que esta doctrina llegue también a NexusObras, ApartaStudia y MundoSelvatico.
Lleva el MANDATO y nada más — ni el porqué de una regla, ni los errores que la
causaron. Ver §12.

---

