import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, relative, isAbsolute } from 'node:path'
import { planificar, aplicar, integrar, bloque, raiz } from './instalar.mjs'

function entorno(fn) {
  const temporal = resolve(mkdtempSync(join(tmpdir(), 'doctrina-instalar-')))
  try {
    const opciones = { codexHome: join(temporal, 'codex'), claudeHome: join(temporal, 'claude') }
    mkdirSync(opciones.codexHome)
    mkdirSync(opciones.claudeHome)
    fn(opciones)
  } finally {
    const limite = relative(resolve(tmpdir()), temporal)
    assert.ok(limite && !limite.startsWith('..') && !isAbsolute(limite))
    rmSync(temporal, { recursive: true, force: true })
  }
}

test('instala ambos adaptadores y repetir no cambia nada', () => entorno(opciones => {
  const planes = planificar(opciones)
  assert.equal(planes.length, 2)
  aplicar(planes)
  assert.ok(planificar(opciones).every(p => !p.cambia))
  assert.ok(readFileSync(join(opciones.codexHome, 'AGENTS.md'), 'utf8').includes('/MANDATO.md'))
  assert.ok(readFileSync(join(opciones.claudeHome, 'CLAUDE.md'), 'utf8').includes('/MANDATO.md\n'))
}))

test('preserva instrucciones y respalda el original', () => entorno(opciones => {
  const archivo = join(opciones.codexHome, 'AGENTS.md')
  const anterior = '# Preferencias propias\r\nConservar este texto.\r\n'
  writeFileSync(archivo, anterior)
  aplicar(planificar(opciones))
  assert.ok(readFileSync(archivo, 'utf8').startsWith(anterior))
  const respaldos = readdirSync(opciones.codexHome).filter(n => n.endsWith('.bak'))
  assert.equal(respaldos.length, 1)
  assert.equal(readFileSync(join(opciones.codexHome, respaldos[0]), 'utf8'), anterior)
}))

test('actualiza solo el bloque administrado', () => {
  const viejo = `Prefijo\n${bloque('codex', 'C:/anterior')}\nSufijo`
  const nuevo = integrar(viejo, bloque('codex', raiz), 'codex')
  assert.ok(nuevo.startsWith('Prefijo\n'))
  assert.ok(nuevo.endsWith('\nSufijo'))
  assert.ok(!nuevo.includes('C:/anterior'))
})

test('migra imports conocidos sin quitar otros imports o reglas', () => {
  const ruta = raiz.replaceAll('\\', '/')
  const viejo = `# Mi configuración\n@${ruta}/README.md\n@${ruta}/00-mandato.md\n@C:/otro/README.md\nRegla propia.\n`
  const nuevo = integrar(viejo, bloque('claude'), 'claude')
  assert.ok(!nuevo.includes(`@${ruta}/README.md`))
  assert.ok(nuevo.includes('@C:/otro/README.md'))
  assert.ok(nuevo.includes('Regla propia.'))
  assert.equal(nuevo.split('/00-mandato.md').length - 1, 1)
})

test('rechaza bloque incompleto sin escribir', () => entorno(opciones => {
  const archivo = join(opciones.codexHome, 'AGENTS.md')
  writeFileSync(archivo, '<!-- doctrina:inicio -->\nTexto')
  assert.throws(() => planificar(opciones), /ambiguo/)
  assert.equal(readFileSync(archivo, 'utf8'), '<!-- doctrina:inicio -->\nTexto')
}))

test('rechaza override activo antes de cambiar archivos', () => entorno(opciones => {
  writeFileSync(join(opciones.codexHome, 'AGENTS.override.md'), 'Instrucción temporal')
  assert.throws(() => planificar(opciones), /precedencia/)
  assert.deepEqual(readdirSync(opciones.claudeHome), [])
}))

test('detecta una edición posterior a la planificación', () => entorno(opciones => {
  const planes = planificar(opciones)
  writeFileSync(join(opciones.codexHome, 'AGENTS.md'), 'Cambio del usuario')
  assert.throws(() => aplicar(planes), /Cambió/)
  assert.equal(readFileSync(join(opciones.codexHome, 'AGENTS.md'), 'utf8'), 'Cambio del usuario')
}))

test('permite instalar solo un consumidor', () => entorno(opciones => {
  const planes = planificar({ ...opciones, destino: 'codex' })
  aplicar(planes)
  assert.equal(planes.length, 1)
  assert.deepEqual(readdirSync(opciones.claudeHome), [])
}))

test('Codex delimita espacios; Claude rechaza imports de compatibilidad no comprobada', () => {
  assert.ok(bloque('codex', 'C:/Mi Doctrina').includes('/Mi Doctrina/MANDATO.md>)'))
  assert.throws(() => bloque('claude', 'C:/Mi Doctrina'), /sin espacios/)
})
