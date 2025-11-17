import { Icon } from '@iconify/react'

interface DynamicIconProps {
  iconId: string
  className?: string
  size?: number
}

export function DynamicIcon({ iconId, className = '', size = 24 }: DynamicIconProps) {
  // Validar que el iconId tenga el formato correcto (familia:nombre)
  if (!iconId || !iconId.includes(':')) {
    // Fallback: mostrar icono de paquete por defecto
    return (
      <Icon 
        icon="mdi:package-variant" 
        width={size} 
        height={size}
        className={className}
      />
    )
  }

  return (
    <Icon 
      icon={iconId} 
      width={size} 
      height={size}
      className={className}
    />
  )
}