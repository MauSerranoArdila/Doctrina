#!/usr/bin/env node
// Adaptadores de instrucciones; no modifica permisos, modelos ni configuración de ejecución.
import { readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync, renameSync, lstatSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { createHash, randomUUID } from 'node:crypto'

export const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const fuentes = ['MANDATO.md', '00-mandato.md', '01-hablar.md', '02-verificar.md', '03-cerrar.md', '04-entorno.md', '05-limites.md']
const inicio = '<!-- doctrina:inicio -->'
const fin = '<!-- doctrina:fin -->'

export function version(origen = raiz) {
  const hash = createHash('sha256')
  for (const nombre of fuentes) hash.update(nombre + '\n' + readFileSync(join(origen, nombre), 'utf8').replace(/\r\n/g, '\n'))
  return hash.digest('hex')
}

export function bloque(tipo, origen = raiz) {
  const ruta = resolve(origen).replaceAll('\\', '/')
  if (/[\r\n<>]/.test(ruta)) throw new Error('La ruta contiene caracteres incompatibles con los adaptadores.')
  if (tipo === 'claude' && /\s/.test(ruta)) throw new Error('Para los imports de Claude, ubica Doctrina en una ruta sin espacios.')
  const cuerpo = tipo === 'codex'
    ? ['## Doctrina compartida',
      `Antes de trabajar, lee el núcleo vigente en [MANDATO.md](<${ruta}/MANDATO.md>).`,
      `Para decisiones importantes, lee [00-mandato.md](<${ruta}/00-mandato.md>).`,
      `Consulta los demás módulos según la tarea: ${fuentes.slice(2).map(n => `[${n}](<${ruta}/${n}>)`).join(', ')}.`,
      'Son criterios predeterminados: respeta la instrucción actual del usuario, las instrucciones aplicables del proyecto y las restricciones de la plataforma.',
      'Si la fuente no es accesible, declara la limitación; no afirmes haberla cargado. No hace falta narrar lecturas rutinarias.',
      'Este bloque contiene referencias, no una copia de las reglas. No cargues casos históricos ni evaluaciones como instrucciones.'].join('\n\n')
    : fuentes.map(n => `@${ruta}/${n}`).join('\n')
  return `${inicio}\n${cuerpo}\n${fin}`
}

export function integrar(anterior, nuevo, tipo, origen = raiz) {
  const aperturas = anterior.split(inicio).length - 1
  const cierres = anterior.split(fin).length - 1
  if (aperturas || cierres) {
    if (aperturas !== 1 || cierres !== 1 || anterior.indexOf(fin) < anterior.indexOf(inicio))
      throw new Error('Bloque administrado ambiguo; no se sobrescribe.')
    return anterior.slice(0, anterior.indexOf(inicio)) + nuevo + anterior.slice(anterior.indexOf(fin) + fin.length)
  }
  // Migra únicamente los imports antiguos de ESTA fuente; conserva el resto del archivo.
  if (tipo === 'claude') {
    const conocidos = new Set(['README.md', ...fuentes].map(n => resolve(origen, n).replaceAll('\\', '/').toLowerCase()))
    anterior = anterior.split(/(?<=\n)/).filter(linea => {
      const match = /^@(?:"([^"]+)"|([^\r\n]+))\s*$/.exec(linea.trim())
      return !match || !conocidos.has((match[1] || match[2]).replaceAll('\\', '/').toLowerCase())
    }).join('')
  }
  return anterior + (anterior && !anterior.endsWith('\n') ? '\n\n' : anterior ? '\n' : '') + nuevo + '\n'
}

export function planificar({ origen = raiz, codexHome = process.env.CODEX_HOME || join(homedir(), '.codex'), claudeHome = join(homedir(), '.claude'), destino = 'ambos' } = {}) {
  version(origen) // Verifica que las fuentes existan antes de proponer cambios.
  if (!['codex', 'claude', 'ambos'].includes(destino)) throw new Error('Destino inválido.')
  const planes = []
  for (const [tipo, carpeta, nombre] of [['codex', codexHome, 'AGENTS.md'], ['claude', claudeHome, 'CLAUDE.md']]) {
    if (destino !== 'ambos' && destino !== tipo) continue
    if (tipo === 'codex') {
      const override = join(carpeta, 'AGENTS.override.md')
      if (existsSync(override) && readFileSync(override, 'utf8').trim())
        throw new Error(`${override} tiene precedencia; resuelve ese conflicto antes de instalar.`)
    }
    const archivo = resolve(carpeta, nombre)
    if (existsSync(archivo) && (!lstatSync(archivo).isFile() || lstatSync(archivo).isSymbolicLink()))
      throw new Error(`El destino no es un archivo regular: ${archivo}`)
    const anterior = existsSync(archivo) ? readFileSync(archivo, 'utf8') : ''
    const siguiente = integrar(anterior, bloque(tipo, origen), tipo, origen)
    planes.push({ tipo, archivo, anterior, siguiente, cambia: anterior !== siguiente })
  }
  return planes
}

export function aplicar(planes) {
  // Revalida todos los destinos antes de empezar para no pisar una edición concurrente.
  for (const p of planes) {
    const actual = existsSync(p.archivo) ? readFileSync(p.archivo, 'utf8') : ''
    if (actual !== p.anterior) throw new Error(`Cambió desde la revisión: ${p.archivo}`)
  }
  for (const p of planes.filter(p => p.cambia)) {
    mkdirSync(dirname(p.archivo), { recursive: true })
    if (existsSync(p.archivo)) {
      p.respaldo = `${p.archivo}.doctrina-${Date.now()}-${randomUUID()}.bak`
      copyFileSync(p.archivo, p.respaldo)
    }
    const temporal = `${p.archivo}.doctrina-${randomUUID()}.tmp`
    writeFileSync(temporal, p.siguiente, { encoding: 'utf8', flag: 'wx' })
    renameSync(temporal, p.archivo)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    const opciones = {}
    let modo = 'plan'
    for (let i = 0; i < args.length; i++) {
      if (['--apply', '--check'].includes(args[i])) {
        if (modo !== 'plan') throw new Error('Elige --apply o --check.')
        modo = args[i] === '--apply' ? 'apply' : 'check'
      } else {
        const clave = { '--codex-home': 'codexHome', '--claude-home': 'claudeHome', '--destino': 'destino' }[args[i]]
        if (!clave || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Argumento inválido: ${args[i]}`)
        opciones[clave] = args[++i]
      }
    }
    const planes = planificar(opciones)
    console.log(`Fuente: ${raiz}\nSHA-256: ${version()}`)
    if (modo === 'apply') aplicar(planes)
    for (const p of planes) {
      console.log(`${p.tipo}: ${p.cambia ? modo === 'apply' ? 'INSTALADO' : 'PENDIENTE' : 'VIGENTE'} ${p.archivo}`)
      if (p.respaldo) console.log(`Respaldo: ${p.respaldo}`)
      if (modo === 'plan' && p.cambia) console.log(p.siguiente)
    }
    if (modo === 'check' && planes.some(p => p.cambia)) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
