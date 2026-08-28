# Casos · 01-hablar

<!-- evidencia fechada. NO se cablea: se lee cuando alguien discute la regla -->

## Por qué el plugin `caveman` está apagado


> **Por qué el plugin `caveman` está apagado** (`~/.claude/settings.json`,
> `CAVEMAN_DEFAULT_MODE: off`). Medido el 2026-08-24 sobre una sesión real de
> **218 llamadas**: la salida del modelo es el **0,6 %** del gasto y la entrada
> más caché el **99,4 %**. Caveman sólo comprime la salida, así que su ahorro
> máximo es el **0,2 % del total** — y a cambio rompe el español, de donde salen
> correos a clientes y PDF que viajan solos.
>
> Es el paso 3 del algoritmo aplicado antes del paso 2: optimizar algo que no
> debía existir. Lo que sí quedó vivo del plugin son sus **agentes**
> (`cavecrew-investigator` y hermanos), porque comprimen lo que un subagente
> devuelve **al contexto** — o sea atacan el 99,4 %, no el 0,6 %.

