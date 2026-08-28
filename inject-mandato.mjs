#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// inject-mandato — hook UserPromptSubmit COMPARTIDO por los 4 proyectos.
//
// Es el único mecanismo que se REPITE. Los CLAUDE.md se leen una vez al arrancar y
// a las tres horas de conversación están enterrados bajo el trabajo; este vuelve a
// decirlo antes de cada mensaje, así que la personalidad no depende de recordar.
//
// ── Por qué LEE el archivo en vez de tenerlo adentro ─────────────────────────
//
// Hasta el 2026-08-28 este hook llevaba los 6 puntos escritos aquí. Era la cuarta
// copia a mano de la doctrina, y las copias a mano divergen: se midió dos veces en
// cinco días —el 24 entre NexusObras y Jarvis, el 28 entre Jarvis y
// ~/.claude/CLAUDE.md, que tenía 8 reglas que el canónico no tenía—.
//
// Los CLAUDE.md ya no copian: usan `@ruta` y Claude Code los expande al arrancar.
// Un hook no puede: es un ejecutable, no un CLAUDE.md. Así que hace lo más cercano
// que existe — lee la fuente en cada disparo. Cambiar el MANDATO en el repo de
// doctrina lo cambia acá sin tocar este archivo.
//
// ── Si la fuente no está ─────────────────────────────────────────────────────
//
// Falla RUIDOSO, no silencioso. Un hook que calla cuando no encuentra la doctrina
// produce exactamente lo que no se ve: sesiones sin mandato que parecen normales.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs'

const FUENTE = new URL('./MANDATO.md', import.meta.url)

try {
  // Se descartan los comentarios HTML de cabecera: son notas para quien edita el
  // archivo, no parte del mandato que se le dice al modelo.
  const texto = readFileSync(FUENTE, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()

  if (!texto) throw new Error(`${FUENTE} existe pero quedó vacío tras quitar comentarios`)

  process.stdout.write(texto)
} catch (err) {
  process.stdout.write(
    [
      '⚠️ MANDATO NO CARGADO — la doctrina no llegó a este turno.',
      `   Fuente esperada: ${FUENTE}`,
      `   Causa: ${err.message}`,
      '',
      'Dilo en la respuesta antes de trabajar. Una sesión sin mandato se ve igual que',
      'una normal, y esa es justamente la falla que este aviso existe para evitar.',
    ].join('\n'),
  )
}
