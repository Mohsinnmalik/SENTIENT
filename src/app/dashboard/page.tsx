"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Package, ExternalLink, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Quantum X1 Phone",
    type: "Mobile Phone",
    status: "Active",
    lastModified: "2 hours ago",
    interactions: 24,
  },
  {
    id: "2",
    name: "Nebula Watch Pro",
    type: "Smart Watch",
    status: "Draft",
    lastModified: "1 day ago",
    interactions: 12,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-bold tracking-tight">Your Products</h1>
          <p className="text-lg text-muted-foreground">
            Manage your product setups and AI-powered review sessions.
          </p>
        </div>
        <Link href="/setup">
          <Button size="lg" className="h-12 px-6 gap-2 text-base font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]">
            <Plus className="h-5 w-5" />
            Create New Product
          </Button>
        </Link>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {MOCK_PRODUCTS.map((product) => (
          <motion.div key={product.id} variants={item}>
            <Card className="group relative overflow-hidden border-none bg-background/40 backdrop-blur-sm shadow-xl ring-1 ring-border/50 transition-all hover:bg-background/60 hover:ring-primary/20">
              <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  {product.status}
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Package className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {product.type}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {product.lastModified}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="h-4 w-4" />
                    {product.interactions} sessions
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/toolkit/latest" className="w-full">
                  <Button variant="ghost" className="w-full justify-between h-11 px-4 hover:bg-primary/5 hover:text-primary group/btn">
                    View Toolkit
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {/* Empty state visual placeholder */}
        <motion.div variants={item}>
          <div className="flex flex-col items-center justify-center h-[280px] rounded-3xl border-2 border-dashed border-border/50 bg-background/20 p-8 text-center transition-colors hover:border-primary/20 hover:bg-background/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Plus className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Build more</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Complete your collection of product interaction setups.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
