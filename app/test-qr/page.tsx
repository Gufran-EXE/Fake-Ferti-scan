"use client"

import Image from "next/image"
import Link from "next/link"

export default function TestQRPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">
          Test QR Code
        </h1>
        
        <p className="text-center text-slate-600 dark:text-slate-300 mb-6">
          Use this QR code to test the scanner. Click "Scan QR" on the home page and point your camera at this code.
        </p>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <Image
              src="/randomqr-256.png"
              alt="Test QR Code"
              width={256}
              height={256}
              className="w-64 h-64"
            />
          </div>
        </div>

        <Link
          href="/"
          className="block w-full text-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
