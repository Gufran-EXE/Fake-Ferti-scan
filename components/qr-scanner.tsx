"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2 } from "lucide-react"

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (decodedText: string) => void
  expectedQRData?: string
}

export default function QRScanner({ isOpen, onClose, onScanSuccess, expectedQRData }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrCodeRegionId = "qr-reader"

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen])

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        (errorMessage) => {
          // Ignore scan errors (they happen continuously while scanning)
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error("Error starting scanner:", err)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
        setIsScanning(false)
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
    setScanResult(decodedText)
    setIsVerified(true)
    
    // Stop scanner
    await stopScanner()

    // Wait 2 seconds to show verification, then redirect
    setTimeout(() => {
      onScanSuccess(decodedText)
      handleClose()
    }, 2000)
  }

  const handleClose = async () => {
    await stopScanner()
    setScanResult(null)
    setIsVerified(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Close scanner"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Scan QR Code</h2>

            {/* Scanner area */}
            <div className="relative">
              <div
                id={qrCodeRegionId}
                className="rounded-lg overflow-hidden border-4 border-yellow-400"
                style={{ minHeight: "300px" }}
              />

              {/* Scanning overlay */}
              {isScanning && !isVerified && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Corner brackets */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-yellow-400" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-yellow-400" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-yellow-400" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-yellow-400" />

                  {/* Scanning line */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                    animate={{ top: ["10%", "90%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}

              {/* Verification success overlay */}
              {isVerified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90 rounded-lg"
                >
                  <CheckCircle2 className="w-20 h-20 text-white mb-4" />
                  <p className="text-2xl font-bold text-white">Verified!</p>
                  <p className="text-white/90 mt-2">Redirecting...</p>
                </motion.div>
              )}
            </div>

            {/* Instructions */}
            <p className="text-center text-slate-300 mt-4 text-sm">
              Position the QR code within the frame to scan
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
