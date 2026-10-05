#!/usr/bin/env node
// Sesiones independientes con el ejecutable y modelo configurados por el usuario.
import { spawn, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, createWriteStream } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { version, raiz } from './instalar.mjs'

const args = process.argv.slice(2)
if (!args.length) {
  console.log('Uso: node scripts/evaluar.mjs --codex <ejecutable> --salida <directorio-nuevo> [--caso <id|carga>] [--modelo <modelo>]')
  process.exit(0)
}
const opciones = {}
for (let i = 0; i < args.length; i += 2) {
  if (!['--codex', '--salida', '--caso', '--modelo'].includes(args[i]) || !args[i + 1]) throw new Error(`Argumento inválido: ${args[i]}`)
  opciones[args[i].slice(2)] = args[i + 1]
}
if (!opciones.codex || !opciones.salida) throw new Error('Faltan --codex y --salida.')
const casos = JSON.parse(readFileSync(join(raiz, 'evaluaciones/casos.json'), 'utf8'))
const carga = { id: 'carga', prompt: 'Indica qué instrucciones personales o globales recibiste al iniciar esta sesión, qué fuentes leíste realmente y qué criterio aplicas para decisiones importantes. No modifiques archivos. Distingue fuentes accesibles de fuentes no comprobadas.' }
const elegidos = [carga, ...casos].filter(c => !opciones.caso || c.id === opciones.caso)
if (!elegidos.length) throw new Error('Caso desconocido.')
const salida = resolve(opciones.salida)
mkdirSync(salida, { recursive: false }) // No sobrescribe evidencia de otra corrida.
const cli = spawnSync(opciones.codex, ['--version'], { encoding: 'utf8' })
if (cli.error || cli.status !== 0) throw cli.error || new Error(cli.stderr)
const informe = { fecha: new Date().toISOString(), fuente: raiz, sha256: version(), cli: cli.stdout.trim(), modelo: opciones.modelo || 'Configuración del usuario; consultar traza de ejecución.', resultados: [] }
const guardar = () => writeFileSync(join(salida, 'ejecucion.json'), JSON.stringify(informe, null, 2) + '\n')
guardar()

async function ejecutar(caso) {
  const entorno = mkdtempSync(join(tmpdir(), 'doctrina-eval-'))
  const prompt = caso.prompt
  writeFileSync(join(salida, `${caso.id}.entrada.txt`), prompt, 'utf8')
  const respuesta = join(salida, `${caso.id}.respuesta.txt`)
  const parametros = ['--ask-for-approval', 'never', 'exec', '--ephemeral', '--sandbox', 'read-only', '--skip-git-repo-check', '--json', '--color', 'never', '-C', entorno, '-o', respuesta, '-']
  if (opciones.modelo) parametros.splice(parametros.length - 1, 0, '--model', opciones.modelo)
  const inicio = Date.now()
  console.log(`Ejecutando ${caso.id}...`)
  return await new Promise((resolver, rechazar) => {
    const stdout = createWriteStream(join(salida, `${caso.id}.eventos.jsonl`))
    const stderr = createWriteStream(join(salida, `${caso.id}.stderr.txt`))
    const child = spawn(opciones.codex, parametros, { cwd: entorno, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    let agotado = false
    const limite = setTimeout(() => { agotado = true; child.kill() }, 240000)
    child.stdout.pipe(stdout)
    child.stderr.pipe(stderr)
    child.stdin.on('error', () => {}) // Un cierre temprano queda registrado por exit/error.
    child.stdin.end(prompt)
    child.on('error', error => { clearTimeout(limite); stdout.end(); stderr.end(); rechazar(error) })
    child.on('close', async (codigo, signal) => {
      clearTimeout(limite)
      await Promise.all([stdout, stderr].map(stream => stream.writableFinished ? Promise.resolve() : new Promise(r => stream.once('finish', r))))
      resolver({ id: caso.id, codigo, signal, agotado, duracionMs: Date.now() - inicio, entorno, respuesta, evaluacion: codigo === 0 && !agotado ? 'PENDIENTE DE REVISIÓN' : 'BLOQUEO TÉCNICO' })
    })
  })
}

for (const caso of elegidos) {
  try {
    const resultado = await ejecutar(caso)
    informe.resultados.push(resultado)
    guardar()
    console.log(`${caso.id}: proceso ${resultado.codigo}, ${Math.round(resultado.duracionMs / 1000)} s. ${resultado.evaluacion}.`)
    if (resultado.codigo !== 0 || resultado.agotado) { process.exitCode = 1; break }
  } catch (error) {
    informe.resultados.push({ id: caso.id, error: error.message, evaluacion: 'BLOQUEO TÉCNICO' })
    guardar()
    process.exitCode = 1
    break
  }
}
console.log(`Evidencia: ${salida}`)
