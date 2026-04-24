"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Footer, FinalCTA } from "@/components/landing/Footer";

export default function LandingPage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50 selection:bg-primary/30 selection:text-white">
      <Hero />
      <HowItWorks />
      <DemoPreview />
      <FeaturesGrid />
      <FinalCTA />
      <Footer />
    </div>
  );
}
