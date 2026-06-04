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
    <div className="flex flex-col min-h-screen bg-background text-foreground select-none">
      <Hero />
      <HowItWorks />
      <DemoPreview />
      <FeaturesGrid />
      <FinalCTA />
      <Footer />
    </div>
  );
}
