"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import {
  FileSearchIcon,
  ShieldCheckIcon,
  ZapIcon,
  UploadCloudIcon,
  SearchCodeIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// The 3D hero touches window/WebGL, so it must never run during SSR —
// dynamic() with ssr:false keeps it out of the server render entirely.
const ThreeHero = dynamic(
  () => import("@/components/hero/three-hero").then((mod) => mod.ThreeHero),
  { ssr: false }
);

const FEATURES = [
  {
    icon: ZapIcon,
    title: "Fast extraction",
    description:
      "Upload a PDF or scanned image and get text, tables, and page structure pulled out automatically.",
  },
  {
    icon: FileSearchIcon,
    title: "Searchable chunks",
    description:
      "Every document is split into indexed chunks so you can find exactly what you need.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Diligence-ready",
    description:
      "Built for reviewing contracts and reports — summaries, risks, and key findings in one place.",
  },
];

const STEPS = [
  {
    icon: UploadCloudIcon,
    title: "Upload",
    description: "Drop in contracts, filings, or scanned reports — any format, any length.",
  },
  {
    icon: SearchCodeIcon,
    title: "Analyze",
    description: "Azure-powered document intelligence extracts text, tables, and structure.",
  },
  {
    icon: SparklesIcon,
    title: "Review",
    description: "Get AI-generated summaries, risks, and answers to your questions instantly.",
  },
];

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  // useGSAP (the official @gsap/react hook) instead of a hand-rolled
  // useLayoutEffect + gsap.context: it scopes selectors to rootRef and
  // reverts everything on unmount/dependency change on its own, including
  // React Strict Mode's mount → unmount → mount cycle in dev, which is the
  // main way a manual setup silently ends up with duplicate or dead
  // ScrollTrigger instances.
  useGSAP(
    () => {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .from("[data-hero-badge]", { y: -16, opacity: 0, duration: 0.6 })
        .from(
          "[data-hero-title]",
          { y: 40, opacity: 0, duration: 0.8 },
          "-=0.35"
        )
        .from(
          "[data-hero-sub]",
          { y: 24, opacity: 0, duration: 0.7 },
          "-=0.5"
        )
        .from(
          "[data-hero-cta]",
          { y: 16, opacity: 0, duration: 0.6 },
          "-=0.45"
        )
        .from(
          "[data-hero-glow]",
          { opacity: 0, scale: 0.85, duration: 1.2, ease: "power2.out" },
          "-=1"
        )
        .from(
          "[data-hero-3d]",
          { opacity: 0, scale: 0.8, duration: 1, ease: "power2.out" },
          "-=0.9"
        );

      // Gentle floating glow loop
      gsap.to("[data-hero-glow]", {
        y: 18,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Feature cards stagger in on scroll
      gsap.from("[data-feature-card]", {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-features-section]",
          start: "top 80%",
        },
      });

      // Steps section reveal
      gsap.from("[data-step-item]", {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-steps-section]",
          start: "top 75%",
        },
      });

      gsap.from("[data-steps-heading]", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: "[data-steps-section]",
          start: "top 80%",
        },
      });

      // CTA banner
      gsap.from("[data-cta-banner]", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-cta-banner]",
          start: "top 85%",
        },
      });

      // Section-level fade-ins for headings that scroll into view
      gsap.utils.toArray<HTMLElement>("[data-fade-in]").forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });

      // Web fonts and the 3D canvas can both change layout height after
      // this first pass runs, which is the classic cause of triggers
      // firing at the wrong scroll position. Re-measure once more on the
      // next frame to be safe, on top of the load/fonts.ready refresh in
      // lib/gsap.ts.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          data-hero-glow
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          data-hero-glow
          className="pointer-events-none absolute left-[65%] top-24 -z-10 h-[280px] w-[420px] -translate-x-1/2 rounded-full bg-chart-2/15 blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-4 px-8 py-24 sm:py-32 lg:grid-cols-[1.1fr_0.9fr]">
          <main className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span
              data-hero-badge
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <SparklesIcon className="size-3.5" />
              Powered by Azure Document Intelligence
            </span>

            <h1
              data-hero-title
              className="text-4xl font-semibold tracking-tight sm:text-6xl"
            >
              Dilligence.AI
            </h1>

            <p
              data-hero-sub
              className="mt-4 max-w-xl text-lg text-muted-foreground"
            >
              Upload contracts, reports, and filings — get extracted text,
              searchable chunks, and AI-generated insights in one workspace.
            </p>

            <div data-hero-cta className="mt-8 flex items-center gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
                Go to dashboard
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/about" />}>
                Learn more
              </Button>
            </div>
          </main>

          <div
            data-hero-3d
            className="mx-auto h-[280px] w-[280px] sm:h-[360px] sm:w-[360px] lg:h-[420px] lg:w-[420px]"
          >
            <ThreeHero />
          </div>
        </div>
      </section>

      {/* Features */}
      <section data-features-section className="border-t">
        <div className="mx-auto max-w-5xl px-8 py-24">
          <div data-fade-in className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to review documents faster
            </h2>
            <p className="mt-3 text-muted-foreground">
              Dilligence.AI turns unstructured paperwork into structured,
              searchable, reviewable data.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                data-feature-card
                className="rounded-xl bg-card p-6 text-left shadow-xs ring-1 ring-foreground/10 transition-transform hover:-translate-y-1"
              >
                <feature.icon className="size-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{feature.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section data-steps-section className="border-t bg-muted/20">
        <div className="mx-auto max-w-5xl px-8 py-24">
          <div data-steps-heading className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three steps between a raw document and a reviewed one.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} data-step-item className="relative pl-4">
                <span className="text-xs font-medium text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="mt-3 flex items-center gap-2">
                  <step.icon className="size-5 text-primary" />
                  <p className="text-sm font-medium">{step.title}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-8 py-24">
          <div
            data-cta-banner
            className="flex flex-col items-center gap-6 rounded-2xl bg-primary/5 px-8 py-16 text-center ring-1 ring-primary/10"
          >
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to get through your documents faster?
            </h2>
            <p className="max-w-md text-muted-foreground">
              Jump into the dashboard and upload your first document — no
              setup required.
            </p>
            <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
              Go to dashboard
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
