# Instrucciones para alternar entre Html5Qrcode y ZXing

## Versiones disponibles:

### 1. **Html5Qrcode (Actual/Original)**
   - Archivo: `src/components/inventory/BarcodeScannerModal.tsx`
   - Librería: `html5-qrcode`
   - Características:
     - FPS configurable (actualmente 10 FPS)
     - QR box personalizado (250x250)
     - Estilos CSS personalizados para ocultar elementos

### 2. **ZXing (Nueva/Alternativa)**
   - Archivo: `src/components/inventory/BarcodeScannerModalZXing.tsx`
   - Librería: `@zxing/library` + `@zxing/browser`
   - Características:
     - Video element directo (más control)
     - Detección automática de cámara trasera
     - Soporte multi-formato nativo

---

## Cómo cambiar entre versiones:

### Para usar ZXing (probar la nueva versión):

Busca el archivo donde se importa `BarcodeScannerModal`, probablemente:
- `src/app/(protected)/inventory/page.tsx`

**Cambio necesario:**
```typescript
// ANTES (Html5Qrcode):
import BarcodeScannerModal from '@/components/inventory/BarcodeScannerModal'

// DESPUÉS (ZXing):
import BarcodeScannerModal from '@/components/inventory/BarcodeScannerModalZXing'
```

### Para volver a Html5Qrcode (versión original):

```typescript
// VOLVER A:
import BarcodeScannerModal from '@/components/inventory/BarcodeScannerModal'
```

---

## Diferencias técnicas principales:

| Característica | Html5Qrcode | ZXing |
|----------------|-------------|-------|
| **Elemento de video** | Manejado internamente | Elemento `<video>` directo con `ref` |
| **FPS Control** | Configurable (fps: 10) | Determinado por la librería |
| **Selección de cámara** | `facingMode: 'environment'` | Búsqueda explícita por nombre de dispositivo |
| **Stop/Reset** | `stop()` + `clear()` | `reset()` |
| **Canvas overlay** | Oculto con CSS | No existe |
| **Tamaño video** | Usa qrbox para área de escaneo | `object-cover` en todo el contenedor |

---

## Recomendación para probar:

1. **Cambia el import** en el archivo que use el componente
2. **Guarda y prueba** en tu dispositivo móvil
3. **Compara**:
   - Velocidad de detección
   - Estabilidad del escaneo
   - Calidad de la imagen de la cámara
   - Rendimiento general

Si ZXing no te convence, simplemente revierte el import al archivo original.

---

## Notas importantes:

- Ambas librerías están instaladas en `package.json`
- Tu configuración actual (Html5Qrcode) está **100% intacta**
- No se ha modificado ningún archivo existente
- Puedes eliminar `BarcodeScannerModalZXing.tsx` si decides no usarlo
