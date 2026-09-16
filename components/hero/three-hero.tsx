"use client";

import { useEffect, useRef } from "react";

import { createHeroScene } from "@/lib/three-hero-scene";
import { cn } from "@/lib/utils";

export function ThreeHero({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { dispose } = createHeroScene(canvas);
    return () => dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
    />
  );
}
