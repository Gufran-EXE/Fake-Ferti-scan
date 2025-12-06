"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const steps = [
  {
    number: 1,
    title: "Scan",
    description: "Point your phone camera at the QR code on the fertilizer package.",
    icon: "📱",
  },
  {
    number: 2,
    title: "Verify",
    description: "Our system checks the database against government records instantly.",
    icon: "✓",
  },
  {
    number: 3,
    title: "Confirm",
    description: "Get immediate verification status with authenticity details.",
    icon: "🛡️",
  },
  {
    number: 4,
    title: "Report",
    description: "Flag suspected fakes to help protect the farming community.",
    icon: "🚨",
  },
]

export default function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section ref={ref} className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground text-balance">How It Works</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Simple, secure, and instant verification in 4 steps
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {steps.map((step, idx) => (
            <motion.div key={step.number} variants={itemVariants}>
              <div className="relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-6 h-1 bg-gradient-to-r from-emerald-400 to-emerald-200 dark:from-emerald-500 dark:to-emerald-600" />
                )}

                {/* Step card with enhanced styling */}
                <div className="bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-900/30 dark:to-slate-800/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800/40 relative z-10 h-full hover:shadow-lg transition-shadow">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 text-white"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <span className="text-2xl font-bold">{step.number}</span>
                  </motion.div>

                  <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>

                  {/* Icon animation */}
                  <div className="mt-6 text-4xl">
                    <motion.span
                      animate={{ y: [-5, 5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    >
                      {step.icon}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
