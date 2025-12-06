"use client"

import Hero from "@/components/hero"
import FeatureSlider from "@/components/feature-slider"
import HowItWorks from "@/components/how-it-works"
import LiveStats from "@/components/live-stats"
import CTAStrip from "@/components/cta-strip"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Navbar />
      <Hero />
      <FeatureSlider />
      <HowItWorks />
      <LiveStats />
      <CTAStrip />
      <Footer />
    </main>
  )
}
