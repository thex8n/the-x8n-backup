// src/lib/dictionary/iconTranslations.ts

import { animals } from './categories/animals'
import { food } from './categories/food'
import { technology } from './categories/technology'
import { business } from './categories/business'
import { home } from './categories/home'
import { symbols } from './categories/symbols'
import { actions } from './categories/actions'
import { nature } from './categories/nature'
import { sports } from './categories/sports'
import { medical } from './categories/medical'
import { education } from './categories/education'
import { transport } from './categories/transport'
import { clothing } from './categories/clothing'
import { people } from './categories/people'  // ← NUEVA LÍNEA

/**
 * Diccionario completo de traducción español → inglés para búsqueda de iconos
 * Total: 1843 palabras
 * 
 * Para expandir:
 * 1. Crear nuevo archivo en /categories/ (ej: communication.ts)
 * 2. Importarlo aquí: import { communication } from './categories/communication'
 * 3. Agregarlo al objeto: ...communication,
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
  ...sports,       // 150 palabras
  ...medical,      // 150 palabras
  ...education,    // 149 palabras
  ...transport,    // 147 palabras
  ...clothing,     // 147 palabras
  ...people,       // 100 palabras ← NUEVA LÍNEA
}

// Total: 1843 palabras