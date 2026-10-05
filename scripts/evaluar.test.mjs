import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join, relative, isAbsolute } from 'node:path'
import { raiz } from './instalar.mjs'

const ejecutor = join(raiz, 'scripts/evaluar.mjs')
function correr(args) {
  return spawnSync(process.execPath, [ejecutor, ...args], { encoding: 'utf8', timeout: 15000 })
}

test('sin argumentos solo muestra ayuda', () => {
  const resultado = correr([])
  assert.ifError(resultado.error)
  assert.equal(resultado.status, 0)
  assert.ok(resultado.stdout.startsWith('Uso:'))
})

test('una falla de proceso se registra y detiene la serie, sin aprobar conducta', () => {
  const temporal = resolve(mkdtempSync(join(tmpdir(), 'doctrina-ejecutor-test-')))
  try {
    const salida = join(temporal, 'evidencia')
    // Node acepta --version, pero rechaza los argumentos de Codex: fallo local real, sin red.
    const resultado = correr(['--codex', process.execPath, '--salida', salida])
    assert.ifError(resultado.error)
    assert.equal(resultado.status, 1)
    const informe = JSON.parse(readFileSync(join(salida, 'ejecucion.json'), 'utf8'))
    assert.equal(informe.resultados.length, 1)
    assert.equal(informe.resultados[0].evaluacion, 'BLOQUEO TÉCNICO')
    assert.ok(existsSync(join(salida, 'carga.entrada.txt')))
    assert.ok(readFileSync(join(salida, 'carga.stderr.txt'), 'utf8').length > 0)
    const repetido = correr(['--codex', process.execPath, '--salida', salida])
    assert.equal(repetido.status, 1)
    assert.equal(JSON.parse(readFileSync(join(salida, 'ejecucion.json'), 'utf8')).fecha, informe.fecha)
  } finally {
    const limite = relative(resolve(tmpdir()), temporal)
    assert.ok(limite && !limite.startsWith('..') && !isAbsolute(limite))
    rmSync(temporal, { recursive: true, force: true })
  }
})

test('los casos tienen criterios y fallos críticos, con identificadores únicos', () => {
  const casos = JSON.parse(readFileSync(join(raiz, 'evaluaciones/casos.json'), 'utf8'))
  assert.equal(new Set(casos.map(c => c.id)).size, casos.length)
  for (const caso of casos) {
    assert.match(caso.id, /^[a-z-]+$/)
    assert.ok(caso.prompt.length > 0)
    assert.ok(caso.criterios.length > 0)
    assert.ok(caso.fallos_criticos.length > 0)
  }
})
