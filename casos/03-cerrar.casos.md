# Casos · 03-cerrar

<!-- evidencia fechada. NO se cablea -->

### Por qué esta regla existe, con el número que la costó

El 2026-08-26, el ledger de deuda de NexusObras tenía **30 ítems congelados**. De esos,
**16 llevaban días con su comando de verificación ESCRITO y jamás ejecutado.**

Cuando por fin se corrieron seis de ellos, en una tarde:

```
SEG-13   ya estaba CERRADO           (y su cifra estaba mal por 4,6x)
SEG-10   no reproducia               (6 ataques reales, todos rechazados)
SEG-15   real, pero mal encuadrado   (2 de 33 archivos era 32 de 34 handlers)
SEG-02   real y PEOR de lo escrito   (entraban .exe, .html y 30 MB)
SEG-25   real y medido               (21 de 26 RPC daban plata a un rol sin permiso)
SEG-28   real                        (y traia 3 trampas que lo cerraban en falso)
```

Uno ya estaba resuelto y seguía marcando rojo. Dos estaban mal descritos. Tres eran
ciertos y **nadie lo sabía**, porque la prueba estaba escrita y nunca se corrió.

**Un ítem congelado sin su prueba corrida no es deuda conocida: es un rumor con
formato de deuda.** Y una lista de rumores enseña a no leer la lista — que es
exactamente cómo un hallazgo real se cuela.


### El corolario que ya costó dos veces el mismo día

Un doc de ESTADO que describe algo borrado como si viviera **no es un doc viejo: es
una trampa activa.** El 2026-08-26 el rol `Cliente` —eliminado tres días antes— volvió
en dos análisis distintos, porque `SCHEMA.md` decía «verificado vivo: hoy hay DIEZ
roles» y la matriz de permisos lo listaba entre los vigentes. Los dos análisis hicieron
lo correcto: consultaron el estado actual. El estado actual mentía.

**Por eso el punto 4 de «solucionado» no es burocracia.** Un arreglo que no actualiza
el doc donde se consulta el estado deja viva la causa de que el problema vuelva a
reportarse — y el que lo reporte dentro de seis meses tendrá razón según lo que leyó.


## El caso que produjo §10-ter


Medido el 2026-08-26 en NexusObras: el ítem `SEG-25` estaba registrado en **9 archivos
distintos**; el promedio de los demás era **6**. Arreglar el problema en uno deja ocho
diciendo que sigue roto — y la siguiente sesión lee cualquiera de esos ocho y lo reporta
otra vez. Mauricio lo describió con precisión: *«me dices que está mal, lo leo y ya está
solucionado; tres días después vuelves y me dices que está mal»*.

