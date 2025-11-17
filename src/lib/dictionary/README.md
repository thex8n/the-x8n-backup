INSTRUCCIONES PARA EXPANDIR EL DICCIONARIO DE ICONOS

=======================================================
ESTRUCTURA ACTUAL DEL PROYECTO
=======================================================

src/
└── lib/
    └── dictionary/
        ├── categories/
        │   ├── animals.ts           (100 palabras de animales)
        │   ├── food.ts              (150 palabras de comida/bebida)
        │   ├── technology.ts        (200 palabras de tecnología)
        │   ├── business.ts          (150 palabras de negocios)
        │   ├── home.ts              (100 palabras de hogar)
        │   ├── symbols.ts           (100 palabras de símbolos)
        │   ├── actions.ts           (100 palabras de acciones)
        │   └── nature.ts            (100 palabras de naturaleza)
        │
        ├── iconTranslations.ts      (Combina todas las categorías)
        └── translateIconQuery.ts    (Función de traducción CON SOPORTE DE TILDES)


=======================================================
TOTAL ACTUAL: 1000 PALABRAS
OBJETIVO PRODUCCIÓN: 3000-5000 PALABRAS
BÚSQUEDA INTELIGENTE: FUNCIONA CON/SIN TILDES AUTOMÁTICAMENTE
=======================================================


=======================================================
CÓMO EXPANDIR EL DICCIONARIO (2 OPCIONES)
=======================================================

OPCIÓN 1: CREAR NUEVA CATEGORÍA
--------------------------------
Usa esta opción cuando necesites palabras de un tema completamente nuevo.

Ejemplo: Agregar categoría "sports" (deportes)

Paso 1: Crear archivo nuevo
   src/lib/dictionary/categories/sports.ts

Paso 2: Contenido del archivo
   // src/lib/dictionary/categories/sports.ts
   // Categoría: Deportes (100 palabras)

   export const sports: Record<string, string> = {
     fútbol: "football",
     baloncesto: "basketball",
     tenis: "tennis",
     natación: "swimming",
     ... (más palabras)
   }

Paso 3: Importar en iconTranslations.ts
   - Abrir: src/lib/dictionary/iconTranslations.ts
   - Agregar import: import { sports } from './categories/sports'
   - Agregar al objeto: ...sports,

Paso 4: ¡LISTO! Nueva categoría agregada sin tocar las existentes.


OPCIÓN 2: EXPANDIR CATEGORÍA EXISTENTE
---------------------------------------
Usa esta opción cuando quieras agregar más palabras a un tema que ya existe.

Ejemplo: Agregar 50 palabras más a "animals"

Paso 1: Abrir archivo existente
   src/lib/dictionary/categories/animals.ts

Paso 2: Agregar nuevas palabras al final
   export const animals: Record<string, string> = {
     perro: "dog",
     gato: "cat",
     // ... palabras existentes ...
     
     // NUEVAS PALABRAS (agregar aquí)
     cocodrilo: "crocodile",
     jirafa: "giraffe",
     ... (50 palabras nuevas)
   }

Paso 3: ¡LISTO! Categoría expandida. NO tocar iconTranslations.ts


=======================================================
FORMATO DE CADA PALABRA
=======================================================

Formato correcto:
   palabra_español: "palabra_inglés",

Ejemplos correctos:
   perro: "dog",
   casa: "home",
   computadora: "computer",
   teléfono: "phone",
   león: "lion",
   pájaro: "bird",
   café: "coffee",

IMPORTANTE - REGLAS DE FORMATO:
================================

✅ SÍ HACER:
- Español en minúsculas
- Inglés en minúsculas
- MANTENER TILDES/ACENTOS en el español (león, café, pájaro)
- Con comillas dobles en el valor (inglés)
- Terminar con coma
- Usar Record<string, string> en TypeScript
- Agregar comentarios para organizar secciones

❌ NO HACER:
- NO quitar tildes del español (leon ❌, correcto: león ✅)
- NO usar mayúsculas (León: "Lion" ❌)
- NO usar comillas simples ('lion' ❌)
- NO olvidar la coma final
- NO agregar versiones sin tildes (el sistema lo hace automáticamente)


=======================================================
BÚSQUEDA INTELIGENTE CON TILDES (AUTOMÁTICA)
=======================================================

CARACTERÍSTICA ESPECIAL:
El sistema maneja tildes automáticamente. NO necesitas agregar versiones sin tildes.

✅ SOLO agregar una vez CON tildes:
   león: "lion",

❌ NO agregar versiones sin tildes:
   leon: "lion",  // ← NO NECESARIO, el sistema lo hace automáticamente

CÓMO FUNCIONA:
--------------
El sistema busca automáticamente con y sin tildes:
- Usuario escribe: "león" → Encuentra "lion"
- Usuario escribe: "leon" → Encuentra "lion"
- Usuario escribe: "LEÓN" → Encuentra "lion"
- Usuario escribe: "LeOn" → Encuentra "lion"

FUNCIONA PARA TODAS LAS PALABRAS CON TILDES:
   pájaro / pajaro → "bird"
   café / cafe → "coffee"
   teléfono / telefono → "phone"
   tiburón / tiburon → "shark"
   águila / aguila → "eagle"
   árbol / arbol → "tree"
   música / musica → "music"

IMPORTANTE:
-----------
SIEMPRE mantener las tildes en el español en los archivos del diccionario.
La función translateIconQuery.ts se encarga de normalizar automáticamente.


=======================================================
REGLAS IMPORTANTES PARA EVITAR ERRORES
=======================================================

✅ HACER:
1. MANTENER tildes/acentos en el español (león, café, pájaro)
2. Verificar NO duplicados antes de agregar palabras
3. Usar comentarios para organizar secciones temáticas
4. Agrupar palabras por tema/contexto relacionado
5. Priorizar palabras comunes sobre palabras técnicas/raras
6. Usar nombres descriptivos para nuevas categorías
7. Exportar con "export const" para mantener consistencia
8. Actualizar el comentario del total de palabras al final

❌ EVITAR:
1. NO quitar tildes del español (el sistema los maneja automáticamente)
2. NO repetir palabras entre categorías diferentes
3. NO modificar archivos existentes al crear nuevas categorías
4. NO usar nombres genéricos para categorías (ej: "misc", "other")
5. NO agregar traducciones incorrectas o ambiguas
6. NO olvidar importar nuevas categorías en iconTranslations.ts
7. NO agregar palabras duplicadas sin tildes (leon, pajaro, etc.)


=======================================================
CÓMO EVITAR DUPLICADOS
=======================================================

REGLA DE ORO:
Una palabra española = Un solo archivo

ANTES DE AGREGAR UNA PALABRA:
1. Buscar en todos los archivos si ya existe
2. Usar el comando grep en terminal:
   grep -r "palabra:" src/lib/dictionary/categories/

EJEMPLO:
   grep -r "león:" src/lib/dictionary/categories/
   
   Si encuentra algo, la palabra YA existe. NO agregarla de nuevo.

SI ENCUENTRAS UN DUPLICADO:
- Eliminar una de las dos ocurrencias
- Mantener solo una en la categoría más apropiada


=======================================================
CÓMO FUNCIONA EL SISTEMA TÉCNICAMENTE
=======================================================

SISTEMA DE NORMALIZACIÓN AUTOMÁTICA:

1. Al cargar la aplicación (UNA SOLA VEZ):
   - Lee todo el diccionario iconTranslations
   - Crea un segundo mapa sin tildes en memoria
   - Ejemplo: león → leon, café → cafe, pájaro → pajaro

2. Cuando el usuario busca:
   - Primero busca la palabra EXACTA (con tildes si las tiene)
   - Si no encuentra, quita tildes y busca en el mapa normalizado
   - Devuelve la traducción al inglés

VENTAJAS:
- Performance óptimo (mapa se crea solo una vez)
- Funciona automáticamente para TODAS las palabras
- No necesitas agregar duplicados sin tildes
- Future-proof: cualquier palabra nueva funciona automáticamente

ARCHIVO RESPONSABLE:
   src/lib/dictionary/translateIconQuery.ts
   (NO modificar este archivo a menos que sea necesario)


=======================================================
CATEGORÍAS SUGERIDAS PARA FUTURAS EXPANSIONES
=======================================================

ALTA PRIORIDAD (100-150 palabras cada una):
--------------------------------------------
- sports.ts (deportes): fútbol, natación, tenis, equipamiento
- medical.ts (medicina/salud): doctor, hospital, medicina, síntomas
- education.ts (educación): escuela, universidad, estudiante, examen
- transport.ts (transporte): auto, avión, tren, barco, bicicleta
- clothing.ts (ropa/moda): camisa, pantalón, zapatos, accesorios

PRIORIDAD MEDIA (50-100 palabras cada una):
--------------------------------------------
- music.ts (música): instrumentos, géneros, notas, concierto
- entertainment.ts (entretenimiento): cine, teatro, eventos
- tools.ts (herramientas): martillo, destornillador, sierra
- social.ts (redes sociales): perfil, seguidor, like, compartir
- weather.ts (clima): más términos meteorológicos


=======================================================
EJEMPLO COMPLETO DE NUEVA CATEGORÍA
=======================================================

Archivo: src/lib/dictionary/categories/sports.ts

// src/lib/dictionary/categories/sports.ts
// Categoría: Deportes (120 palabras)

export const sports: Record<string, string> = {
  // Deportes populares
  deporte: "sport",
  fútbol: "football",
  baloncesto: "basketball",
  tenis: "tennis",
  voleibol: "volleyball",
  béisbol: "baseball",
  rugby: "rugby",
  
  // Deportes de agua
  natación: "swimming",
  buceo: "diving",
  surf: "surfing",
  waterpolo: "water polo",
  vela: "sailing",
  
  // Deportes de invierno
  esquí: "skiing",
  snowboard: "snowboard",
  patinaje: "skating",
  hockey: "hockey",
  
  // Deportes individuales
  atletismo: "athletics",
  gimnasia: "gymnastics",
  ciclismo: "cycling",
  boxeo: "boxing",
  artes: "martial arts",
  yoga: "yoga",
  
  // Equipamiento deportivo
  pelota: "ball",
  balón: "ball",
  raqueta: "racket",
  bate: "bat",
  guantes: "gloves",
  casco: "helmet",
  red: "net",
  arco: "goal",
  cancha: "court",
  campo: "field",
  
  // Acciones deportivas
  correr: "run",
  saltar: "jump",
  lanzar: "throw",
  patear: "kick",
  nadar: "swim",
  entrenar: "train",
  
  // Personas y roles
  atleta: "athlete",
  jugador: "player",
  entrenador: "coach",
  árbitro: "referee",
  equipo: "team",
  campeón: "champion",
  
  // Eventos
  partido: "match",
  torneo: "tournament",
  campeonato: "championship",
  olimpiadas: "olympics",
  medalla: "medal",
  trofeo: "trophy",
  
  // Conceptos
  puntuación: "score",
  gol: "goal",
  punto: "point",
  victoria: "victory",
  derrota: "defeat",
}

// Total: 120 palabras


Luego en iconTranslations.ts agregar:

// src/lib/dictionary/iconTranslations.ts

import { animals } from './categories/animals'
import { food } from './categories/food'
import { technology } from './categories/technology'
import { business } from './categories/business'
import { home } from './categories/home'
import { symbols } from './categories/symbols'
import { actions } from './categories/actions'
import { nature } from './categories/nature'
import { sports } from './categories/sports'  // ← AGREGAR ESTA LÍNEA

/**
 * Diccionario completo de traducción español → inglés para búsqueda de iconos
 * Total: 1120 palabras
 * 
 * Para expandir:
 * 1. Crear nuevo archivo en /categories/ (ej: medical.ts)
 * 2. Importarlo aquí: import { medical } from './categories/medical'
 * 3. Agregarlo al objeto: ...medical,
 * 
 * O editar archivos existentes para agregar más palabras a una categoría
 */
export const iconTranslations: Record<string, string> = {
  ...animals,      // 100 palabras
  ...food,         // 150 palabras
  ...technology,   // 200 palabras
  ...business,     // 150 palabras
  ...home,         // 100 palabras
  ...symbols,      // 100 palabras
  ...actions,      // 100 palabras
  ...nature,       // 100 palabras
  ...sports,       // 120 palabras  ← AGREGAR ESTA LÍNEA
}

// Total: 1120 palabras


=======================================================
TROUBLESHOOTING - ERRORES COMUNES
=======================================================

ERROR: "An object literal cannot have multiple properties with the same name"
------------------------------------------------------------------------------
CAUSA: Palabra duplicada en el mismo archivo.

SOLUCIÓN:
1. Buscar duplicados en el archivo con error:
   grep -o "^  [^:]*" src/lib/dictionary/categories/ARCHIVO.ts | sort | uniq -d

2. Eliminar una de las dos ocurrencias de la palabra duplicada.

EJEMPLO:
   león: "lion",
   // ... otras palabras ...
   león: "lion",  // ← DUPLICADO, eliminar esta línea


ERROR: La búsqueda no encuentra palabras con tildes
----------------------------------------------------
CAUSA: Posiblemente no guardaste translateIconQuery.ts correctamente.

SOLUCIÓN:
1. Verificar que translateIconQuery.ts tenga la función removeDiacritics()
2. Verificar que exista el mapa normalizedTranslations
3. Reiniciar el servidor de desarrollo
4. Limpiar caché del navegador


ERROR: No aparecen iconos para una palabra
-------------------------------------------
POSIBLES CAUSAS:
1. La traducción al inglés es incorrecta
2. No existen iconos con ese nombre en la librería de iconos (Lucide)
3. Hay un typo en el inglés

SOLUCIÓN:
1. Verificar en https://lucide.dev si existe el icono con ese nombre
2. Revisar ortografía de la palabra en inglés
3. Probar sinónimos en inglés si el icono no existe


=======================================================
CHECKLIST ANTES DE HACER COMMIT
=======================================================

Antes de guardar cambios, verificar:

□ Las palabras tienen formato correcto (minúsculas, comillas, comas)
□ Las palabras en español MANTIENEN sus tildes/acentos
□ NO hay palabras duplicadas en el mismo archivo
□ NO hay palabras duplicadas entre diferentes archivos
□ Si creaste nueva categoría, la importaste en iconTranslations.ts
□ Si creaste nueva categoría, la agregaste al objeto en iconTranslations.ts
□ Actualizaste el comentario del total de palabras
□ Testeaste localmente que las búsquedas funcionan
□ El código compila sin errores en VS Code


=======================================================
NOTAS FINALES
=======================================================

ESTADO DEL PROYECTO:
- Diccionario actual: 1000 palabras
- Objetivo producción: 3000-5000 palabras
- Sistema de búsqueda: v2.0 con soporte automático de tildes

RECOMENDACIONES:
1. Expandir gradualmente según necesidad del usuario
2. Revisar analytics para saber qué palabras agregar
3. Priorizar categorías de alta demanda (deportes, salud, educación)
4. Mantener calidad sobre cantidad
5. Verificar traducciones correctas antes de agregar
6. Agrupar palabras relacionadas con comentarios claros

MANTENIMIENTO:
- Revisar duplicados periódicamente con grep
- Actualizar comentarios de total de palabras
- Testear búsquedas comunes después de agregar categorías
- Mantener consistencia de formato en todos los archivos
- NO modificar translateIconQuery.ts a menos que sea necesario

REGLA MÁS IMPORTANTE:
=====================
SIEMPRE MANTENER TILDES EN ESPAÑOL - EL SISTEMA LOS MANEJA AUTOMÁTICAMENTE
NO AGREGAR VERSIONES SIN TILDES (leon, cafe, pajaro, etc.)

=======================================================
Última actualización: Diciembre 2024
Versión del diccionario: 1.0 (1000 palabras)
Sistema de búsqueda: v2.0 (con soporte automático de tildes)
=======================================================