"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, Camera, Upload, ImageIcon } from "lucide-react"

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (decodedText: string) => void
}

type Mode = "camera" | "upload"

export default function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const [mode, setMode] = useState<Mode>("camera")
  const [isVerified, setIsVerified] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isScanningRef = useRef(false)   // single source of truth for camera state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrRegionId = "qr-camera-region"

  // ── stop camera (safe to call anytime) ──────────────────────
  const stopCamera = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {}
      try {
        scannerRef.current.clear()
      } catch {}
    }
    scannerRef.current = null
    isScanningRef.current = false
    setCameraReady(false)
  }, [])

  // ── start camera ─────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    // Guard: don't start if already running
    if (isScanningRef.current) return

    // Wait for DOM element to exist
    await new Promise(r => setTimeout(r, 150))
    const el = document.getElementById(qrRegionId)
    if (!el) return

    try {
      const scanner = new Html5Qrcode(qrRegionId)
      scannerRef.current = scanner
      isScanningRef.current = true

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => handleScanSuccess(decoded),
        () => {}   // ignore per-frame errors
      )
      setCameraReady(true)
    } catch (err) {
      console.error("Camera start error:", err)
      isScanningRef.current = false
    }
  }, []) // eslint-disable-line

  // ── handle a successful scan ─────────────────────────────────
  const handleScanSuccess = useCallback(async (decoded: string) => {
    if (isVerified) return   // prevent double-fire
    setIsVerified(true)
    await stopCamera()
    setTimeout(() => {
      onScanSuccess(decoded)
      handleClose()
    }, 1500)
  }, [isVerified, stopCamera, onScanSuccess]) // eslint-disable-line

  // ── modal open/close lifecycle ───────────────────────────────
  useEffect(() => {
    if (isOpen && mode === "camera") {
      startCamera()
    }
    return () => {
      // Always stop camera when modal unmounts or closes
      stopCamera()
    }
  }, [isOpen]) // only react to modal open/close, NOT mode

  // ── mode switch ──────────────────────────────────────────────
  const switchMode = useCallback(async (next: Mode) => {
    if (next === mode) return
    if (next === "upload") {
      await stopCamera()
    } else {
      // switching back to camera — stop any lingering instance first
      await stopCamera()
    }
    setUploadError(null)
    setMode(next)
    // If switching to camera, start it after state update
    if (next === "camera") {
      // defer so React re-renders the camera div first
      setTimeout(() => startCamera(), 50)
    }
  }, [mode, stopCamera, startCamera])

  // ── close modal ──────────────────────────────────────────────
  const handleClose = useCallback(async () => {
    await stopCamera()
    setIsVerified(false)
    setUploadError(null)
    setUploadLoading(false)
    setMode("camera")
    onClose()
  }, [stopCamera, onClose])

  // ── upload / file handling ───────────────────────────────────
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPG, PNG, etc.)")
      return
    }
    setUploadLoading(true)
    setUploadError(null)

    const tempId = "qr-file-temp"
    let tempEl = document.getElementById(tempId)
    if (!tempEl) {
      tempEl = document.createElement("div")
      tempEl.id = tempId
      tempEl.style.display = "none"
      document.body.appendChild(tempEl)
    }

    try {
      const scanner = new Html5Qrcode(tempId)
      const result = await scanner.scanFile(file, false)
      try { scanner.clear() } catch {}
      document.getElementById(tempId)?.remove()

      setIsVerified(true)
      setTimeout(() => {
        onScanSuccess(result)
        handleClose()
      }, 1500)
    } catch {
      try { document.getElementById(tempId)?.remove() } catch {}
      setUploadError("No QR code found in this image. Try a clearer, well-lit photo.")
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-slate-900 rounded-2xl p-5 max-w-lg w-full shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Close scanner"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 text-center pr-8">Verify QR Code</h2>

            {/* Mode tabs */}
            <div className="flex gap-2 mb-4 bg-slate-800 p-1 rounded-xl">
              {(["camera", "upload"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-yellow-500 text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "camera" ? <Camera className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {m === "camera" ? "Camera Scan" : "Upload Image"}
                </button>
              ))}
            </div>

            {/* ── CAMERA ── */}
            {mode === "camera" && (
              <div className="relative">
                {/* The div Html5Qrcode mounts into — always rendered when in camera mode */}
                <div
                  id={qrRegionId}
                  className="rounded-xl overflow-hidden border-2 border-yellow-400/50 bg-slate-800"
                  style={{ minHeight: "280px" }}
                />

                {/* Scanning corners + sweep line */}
                {cameraReady && !isVerified && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="absolute top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-yellow-400 rounded-tl" />
                    <div className="absolute top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-yellow-400 rounded-tr" />
                    <div className="absolute bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-yellow-400 rounded-bl" />
                    <div className="absolute bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-yellow-400 rounded-br" />
                    <motion.div
                      className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                      animate={{ top: ["10%", "90%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}

                {/* Success overlay */}
                {isVerified && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/90 rounded-xl"
                  >
                    <CheckCircle2 className="w-16 h-16 text-white mb-3" />
                    <p className="text-xl font-bold text-white">QR Detected!</p>
                    <p className="text-white/80 text-sm mt-1">Verifying...</p>
                  </motion.div>
                )}

                <p className="text-center text-slate-400 mt-3 text-sm">
                  Point your camera at the QR code on the fertilizer bag
                </p>
              </div>
            )}

            {/* ── UPLOAD ── */}
            {mode === "upload" && (
              <div className="space-y-3">
                {!isVerified ? (
                  <>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFileUpload(f) }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragOver
                          ? "border-yellow-400 bg-yellow-500/10"
                          : "border-slate-600 hover:border-yellow-500/50 hover:bg-slate-800/50"
                      }`}
                    >
                      {uploadLoading ? (
                        <div className="flex flex-col items-center gap-3">
                          <span className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-slate-300 text-sm font-medium">Reading QR code...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
                            <ImageIcon className="w-7 h-7 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">
                              {dragOver ? "Drop image here" : "Click to upload or drag & drop"}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">JPG, PNG, WEBP supported</p>
                          </div>
                          <span className="px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold rounded-full">
                            Browse Image
                          </span>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                    />

                    {uploadError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                      >
                        <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{uploadError}</p>
                      </motion.div>
                    )}

                    <p className="text-center text-slate-500 text-xs">
                      Upload a photo of the QR code sticker on the fertilizer bag
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 gap-3"
                  >
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-xl font-bold text-white">QR Detected!</p>
                    <p className="text-slate-400 text-sm">Verifying product...</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
