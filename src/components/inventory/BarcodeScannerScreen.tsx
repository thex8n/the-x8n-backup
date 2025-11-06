'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, AlertCircle, Flashlight, FlashlightOff } from 'lucide-react'

interface BarcodeScannerModalProps {
  onClose: () => void
  onScanSuccess: (code: string) => void
}

export default function BarcodeScannerModal({ onClose, onScanSuccess }: BarcodeScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerIdRef = useRef('barcode-scanner')

  useEffect(() => {
    startScanner()

    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerIdRef.current)
      html5QrCodeRef.current = html5QrCode

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        () => {}
      )

      setIsScanning(true)
      setError(null)
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
      setIsScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
    setScannedCode(decodedText)
    
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }

    await stopScanner()
    setIsScanning(false)

    setTimeout(() => {
      onScanSuccess(decodedText)
      onClose()
    }, 1000)
  }

  const toggleTorch = async () => {
    if (html5QrCodeRef.current) {
      try {
        const capabilities = html5QrCodeRef.current.getRunningTrackCameraCapabilities()
        if (capabilities && 'torch' in capabilities) {
          await html5QrCodeRef.current.applyVideoConstraints({
            advanced: [{ torch: !torchEnabled } as MediaTrackConstraintSet]
          })
          setTorchEnabled(!torchEnabled)
        }
      } catch (err) {
        console.error('Torch not supported:', err)
      }
    }
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 60 }}>
      <div className="absolute top-0 left-0 right-0 p-4" style={{ 
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        paddingTop: 'max(1rem, env(safe-area-inset-top))'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-white font-semibold text-lg">Escanear Código</h2>
              <p className="text-white opacity-70 text-xs">Apunta al código de barras</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <div id={scannerIdRef.current} className="w-full h-full" />

        {isScanning && !scannedCode && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-50" />
              
              <div className="relative w-64 h-64" style={{ zIndex: 10 }}>
                <div className="absolute inset-0 border-2 border-white rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                  
                  <div 
                    className="absolute top-0 left-0 right-0 h-1" 
                    style={{
                      background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
                      animation: 'scan 2s ease-in-out infinite'
                    }}
                  />
                </div>
                
                <div className="absolute left-0 right-0 text-center" style={{ bottom: '-4rem' }}>
                  <p className="text-white text-sm font-medium px-4">
                    Mantén el código dentro del marco
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {scannedCode && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center" style={{ zIndex: 20 }}>
            <div className="bg-white rounded-2xl p-8 mx-4 text-center" style={{
              animation: 'scale-in 0.3s ease-out'
            }}>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Código Escaneado!</h3>
              <p className="text-gray-600 mb-4">Código detectado:</p>
              <div className="bg-gray-100 rounded-lg px-4 py-3 mb-4">
                <p className="font-mono text-lg font-semibold text-gray-900">{scannedCode}</p>
              </div>
              <p className="text-sm text-gray-500">Redirigiendo...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4" style={{ zIndex: 20 }}>
            <div className="bg-white rounded-2xl p-6 max-w-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Error de Cámara</h3>
              <p className="text-gray-600 text-center mb-6">{error}</p>
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {isScanning && !scannedCode && !error && (
        <div 
          className="absolute bottom-0 left-0 right-0 p-6" 
          style={{ 
            zIndex: 10,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))'
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTorch}
              className="p-4 rounded-full bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-colors"
              aria-label={torchEnabled ? "Apagar linterna" : "Encender linterna"}
            >
              {torchEnabled ? (
                <Flashlight className="w-6 h-6 text-yellow-300" />
              ) : (
                <FlashlightOff className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-white opacity-70 text-sm">Escáner activo</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}