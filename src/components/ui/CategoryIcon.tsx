// ============================================================================
// components/ui/CategoryIcon.tsx
// Componente para renderizar iconos de categorías con Iconify
// ============================================================================

import { Icon } from '@iconify/react'

interface CategoryIconProps {
  iconId: string // ID de Iconify (ej: "mdi:package-variant")
  className?: string
  size?: number
  style?: React.CSSProperties
}

export function CategoryIcon({ iconId, className = '', size = 24, style }: CategoryIconProps) {
  // Validar que el iconId tenga el formato correcto (familia:nombre)
  if (!iconId || !iconId.includes(':')) {
    // Fallback: mostrar icono de paquete por defecto
    return (
      <Icon 
        icon="mdi:package-variant" 
        width={size} 
        height={size}
        className={className}
        style={style}
      />
    )
  }

  return (
    <Icon 
      icon={iconId} 
      width={size} 
      height={size}
      className={className}
      style={style}
    />
  )
}

// Componente con color personalizado (para CategoryBadge)
interface CategoryIconWithColorProps extends CategoryIconProps {
  color?: string
}

export function CategoryIconWithColor({ 
  iconId, 
  className = '', 
  size = 24, 
  color,
  style 
}: CategoryIconWithColorProps) {
  const combinedStyle = color 
    ? { ...style, color } 
    : style

  return <CategoryIcon iconId={iconId} className={className} size={size} style={combinedStyle} />
}