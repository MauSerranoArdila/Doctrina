#!/usr/bin/env node
// Entrega el núcleo canónico al hook UserPromptSubmit.
// Comprueba estructura, no el significado de las reglas ni su cumplimiento.
import { readFileSync } from 'node:fs'

const fuente = new URL('./MANDATO.md', import.meta.url)

try {
  const texto = readFileSync(fuente, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\r\n/g, '\n')
    .trim()

  if (!texto) throw new Error('La fuente está vacía tras quitar comentarios.')
  if (texto.includes('<!--')) throw new Error('Hay un comentario HTML sin cerrar.')
  if (!texto.startsWith('# Mandato\n')) throw new Error('Falta el encabezado # Mandato.')

  // Contrato editorial: ocho reglas, numeradas del 1 al 8, con cuerpo.
  // Un cambio deliberado de estructura exige actualizar esta validación y sus pruebas.
  const puntos = [...texto.matchAll(/^(\d+)\)[ \t]*(.*)$/gm)]
  if (puntos.length !== 8) throw new Error(`Se esperan 8 reglas; se encontraron ${puntos.length}.`)
  for (const [indice, punto] of puntos.entries()) {
    if (punto[1] !== String(indice + 1))
      throw new Error('Las reglas deben estar numeradas del 1 al 8, en orden y sin duplicados.')
    const fin = puntos[indice + 1]?.index ?? texto.length
    const cuerpo = texto.slice(punto.index + punto[1].length + 1, fin).trim()
    if (!cuerpo) throw new Error(`La regla ${punto[1]} está vacía.`)
  }

  process.stdout.write(texto)
} catch (err) {
  // Conserva el canal de aviso por stdout usado por la integración existente.
  // Es una advertencia de carga, no un bloqueo de la tarea ni un error de proceso.
  process.stdout.write([
    '⚠️ MANDATO NO CARGADO — no se pudo cargar la doctrina de este turno.',
    `Fuente: ${fuente}`,
    `Causa: ${err.message}`,
    'Informa esta limitación y continúa con las instrucciones disponibles cuando sea posible.',
  ].join('\n'))
}
