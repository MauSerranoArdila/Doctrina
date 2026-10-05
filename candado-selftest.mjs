#!/usr/bin/env node
// Prueba el transporte y la validación estructural del mandato con Node real.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, copyFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(fileURLToPath(import.meta.url))
const hook = join(raiz, 'inject-mandato.mjs')
const aviso = 'MANDATO NO CARGADO'
const temporal = resolve(mkdtempSync(join(tmpdir(), 'doctrina-selftest-')))
const sano = '# Mandato\n\n' + Array.from({ length: 8 }, (_, i) => `${i + 1}) Regla de prueba ${i + 1}.`).join('\n\n')
let pruebas = 0
let fallas = 0

function correr(dir, cwd = temporal) {
  const resultado = spawnSync(process.execPath, [join(dir, 'inject-mandato.mjs')], {
    encoding: 'utf8', cwd,
  })
  assert.ifError(resultado.error)
  assert.equal(resultado.status, 0, resultado.stderr || 'El proceso falló.')
  assert.equal(resultado.stderr, '')
  return resultado.stdout
}

function conFuente(contenido) {
  const dir = mkdtempSync(join(temporal, 'caso-'))
  copyFileSync(hook, join(dir, 'inject-mandato.mjs'))
  if (contenido !== null) writeFileSync(join(dir, 'MANDATO.md'), contenido)
  return correr(dir)
}

function test(nombre, fn) {
  pruebas++
  try {
    fn()
    console.log(`✅ ${nombre}`)
  } catch (error) {
    fallas++
    console.error(`❌ ${nombre}: ${error.message}`)
  }
}

try {
  for (const [nombre, fuente, causa] of [
    ['fuente ausente', null, 'ENOENT'],
    ['fuente vacía', '', 'vacía'],
    ['solo comentarios', '<!-- nota -->\n', 'vacía'],
    ['fuente truncada', '# Mandato\n\n1) Una sola regla.', 'Se esperan 8 reglas'],
    ['numeración duplicada', sano.replace('8)', '7)'), 'sin duplicados'],
    ['numeración fuera de orden', sano.replace('1)', '9)'), 'en orden'],
    ['regla vacía', sano.replace('8) Regla de prueba 8.', '8)'), 'regla 8 está vacía'],
    ['encabezado ausente', sano.replace('# Mandato', '# Otro'), 'encabezado'],
    ['regla adicional', sano + '\n\n9) Otra.', 'Se esperan 8 reglas'],
    ['comentario sin cerrar', sano + '\n<!-- nota', 'sin cerrar'],
  ]) {
    test(`rechaza ${nombre}`, () => {
      const salida = conFuente(fuente)
      assert.ok(salida.startsWith(`⚠️ ${aviso}`), salida)
      assert.ok(salida.includes(causa), salida)
    })
  }

  test('entrega íntegra la fuente sana', () => assert.equal(conFuente(sano), sano))
  test('quita comentarios y admite BOM y CRLF', () => {
    const fuente = '\uFEFF<!-- nota -->\r\n' + sano.replace(/\n/g, '\r\n') + '\r\n'
    assert.equal(conFuente(fuente), sano)
  })
  test('preserva reglas con varias líneas', () => {
    const fuente = sano.replace('1) Regla de prueba 1.', '1) Regla de prueba 1.\nContinuación.')
    assert.equal(conFuente(fuente), fuente)
  })
  test('fuente real íntegra desde otro directorio de trabajo', () => {
    const fuente = readFileSync(join(raiz, 'MANDATO.md'), 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '').replace(/\r\n/g, '\n').trim()
    const salida = correr(raiz)
    assert.ok(!salida.includes(aviso))
    assert.equal(salida, fuente)
    assert.equal([...salida.matchAll(/^\d+\)/gm)].length, 8)
  })
} finally {
  // El borrado queda limitado al directorio temporal creado por esta ejecución.
  const contencion = relative(resolve(tmpdir()), temporal)
  if (!contencion || contencion.startsWith('..') || isAbsolute(contencion))
    throw new Error(`Directorio temporal fuera del límite esperado: ${temporal}`)
  rmSync(temporal, { recursive: true, force: true })
}

console.log(`\n${pruebas - fallas}/${pruebas} pruebas correctas. Se comprueba carga y estructura, no conducta del agente.`)
process.exitCode = fallas ? 1 : 0
