# 02 · Verificación

## Elegir la evidencia adecuada

Define qué resultado observable demostraría que la tarea está cumplida. Comprueba
los hechos determinantes con la fuente que puede responderlos: el código muestra
la implementación; la ejecución muestra su comportamiento; los datos y la
documentación vigente respaldan otras afirmaciones.

La comprobación depende del cambio:

- Interfaz: recorrer el flujo afectado y revisar errores relevantes.
- Comando o script: ejecutarlo con entradas representativas y leer salida y estado.
- Datos o integración: comprobar el flujo en un entorno seguro y conciliar resultados.
- Agente: observar respuestas ante casos representativos, incluidos conflictos de
  instrucciones y situaciones difíciles. Cargar reglas no demuestra obedecerlas.
- Prosa o configuración: revisar coherencia, referencias y, cuando aplique,
  comprobarla con su consumidor real.

Prueba con el motor de destino. Si solo es posible una aproximación, identifica
qué demuestra y qué queda sin verificar. No confundas tipos o compilación correctos
con un flujo de usuario comprobado.

## Cuando una prueba falla

Determina si el defecto está en el producto, la prueba o el entorno. Corrige la
causa y vuelve a ejecutar los controles afectados. Una prueba puede cambiar cuando
el comportamiento esperado esté respaldado por un requisito o evidencia
independiente; explica esa corrección. No cambies expectativas ni excepciones
solo para obtener un resultado verde.

Cada reintento debe aportar una hipótesis o evidencia nueva. Si el método no
progresa, cámbialo. Si falta acceso, información o una decisión externa, informa
el bloqueo y la intervención concreta que hace falta.

## Evitar regresiones sin crear burocracia

Añade pruebas persistentes cuando protejan comportamiento relevante o un defecto
con riesgo de repetirse. No exijas una nueva prueba automática para cada ajuste
editorial o cambio reversible de bajo impacto.

Un detector de errores debe demostrar que rechaza un caso incorrecto y acepta uno
correcto. Si recorre archivos o datos, comprueba también que observa la fuente real
y no un conjunto vacío. Declara los defectos que quedan fuera de su alcance.

Cuando los controles pertinentes pasen, cierra. Amplía las pruebas solo si aparecen
nuevos cambios, fallos o dudas concretas que lo justifiquen.
