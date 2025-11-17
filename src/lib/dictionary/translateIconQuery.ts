// src/lib/dictionary/translateIconQuery.ts

import { iconTranslations } from './iconTranslations'

/**
 * Función auxiliar para remover tildes y acentos de una cadena
 * 
 * @param str - Cadena a normalizar
 * @returns Cadena sin tildes ni acentos
 * 
 * @example
 * removeDiacritics('león') // 'leon'
 * removeDiacritics('café') // 'cafe'
 * removeDiacritics('teléfono') // 'telefono'
 */
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Mapa normalizado de traducciones (sin tildes)
 * Se crea una sola vez cuando se carga el módulo para mejor performance
 * 
 * Clave: palabra española SIN tildes (ej: "leon", "cafe")
 * Valor: traducción en inglés (ej: "lion", "coffee")
 */
const normalizedTranslations: Record<string, string> = {}

// Construir el mapa normalizado al cargar el módulo
for (const [spanish, english] of Object.entries(iconTranslations)) {
  const normalized = removeDiacritics(spanish.toLowerCase())
  normalizedTranslations[normalized] = english
}

/**
 * Traduce una consulta de búsqueda de español a inglés
 * Si no encuentra traducción, devuelve la palabra original
 * 
 * NUEVO: Funciona con o sin tildes automáticamente
 * 
 * @param query - Palabra a traducir
 * @returns Palabra traducida o palabra original
 * 
 * @example
 * translateIconQuery('perro') // 'dog'
 * translateIconQuery('león') // 'lion' (con tilde)
 * translateIconQuery('leon') // 'lion' (sin tilde)
 * translateIconQuery('pájaro') // 'bird' (con tilde)
 * translateIconQuery('pajaro') // 'bird' (sin tilde)
 * translateIconQuery('tiburón') // 'shark' (con tilde)
 * translateIconQuery('tiburon') // 'shark' (sin tilde)
 * translateIconQuery('LEÓN') // 'lion' (mayúsculas)
 * translateIconQuery('computer') // 'computer' (ya está en inglés)
 */
export function translateIconQuery(query: string): string {
  // Normalizar: convertir a minúsculas y eliminar espacios
  const normalizedQuery = query.toLowerCase().trim()
  
  // Si está vacío, devolver vacío
  if (!normalizedQuery) {
    return ''
  }
  
  // PASO 1: Intentar buscar con la palabra EXACTA (respetando tildes)
  let translation = iconTranslations[normalizedQuery]
  
  if (translation) {
    return translation
  }
  
  // PASO 2: Buscar SIN tildes en el mapa normalizado
  const withoutDiacritics = removeDiacritics(normalizedQuery)
  translation = normalizedTranslations[withoutDiacritics]
  
  // Si encuentra traducción, usarla; sino, usar la palabra original
  return translation || normalizedQuery
}

/**
 * Función auxiliar para verificar si una palabra tiene traducción
 * NUEVO: Verifica tanto con tildes como sin tildes
 * 
 * @param query - Palabra a verificar
 * @returns true si existe traducción, false si no
 * 
 * @example
 * hasTranslation('león') // true (con tilde)
 * hasTranslation('leon') // true (sin tilde)
 * hasTranslation('pájaro') // true (con tilde)
 * hasTranslation('pajaro') // true (sin tilde)
 * hasTranslation('xyz123') // false
 */
export function hasTranslation(query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim()
  
  // Verificar primero con la palabra exacta
  if (normalizedQuery in iconTranslations) {
    return true
  }
  
  // Si no encuentra, verificar sin tildes
  const withoutDiacritics = removeDiacritics(normalizedQuery)
  return withoutDiacritics in normalizedTranslations
}