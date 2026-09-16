"use client";

import { useLayoutEffect, useRef } from "react";
import {
  ScanSearchIcon,
  ShieldCheckIcon,
  UsersIcon,
  TargetIcon,
} from "lucide-react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

const VALUES = [
  {
    icon: TargetIcon,
    title: "Accuracy first",
    description:
      "Every extraction is built to be trustworthy enough to base a decision on — not just a rough summary.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Built for diligence",
    description:
      "Contracts, filings, and reports deserve a workflow designed around review, not generic chat.",
  },
  {
    icon: UsersIcon,
    title: "For real reviewers",
    description:
      "Designed with analysts, legal teams, and researchers in mind — people who read documents for a living.",
  },
];

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-about-badge]", { y: -16, opacity: 0, duration: 0.5 })
        .from(
          "[data-about-title]",
          { y: 30, opacity: 0, duration: 0.7 },
          "-=0.3"
        )
        .from(
          "[data-about-sub]",
          { y: 20, opacity: 0, duration: 0.6 },
          "-=0.4"
        );

      gsap.from("[data-value-card]", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-values-section]",
          start: "top 80%",
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-fade-in]").forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      ScrollTrigger.refresh();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>
      <section className="mx-auto max-w-3xl px-8 py-24 text-center">
        <span
          data-about-badge
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <ScanSearchIcon className="size-3.5" />
          About Dilligence.AI
        </span>

        <h1 data-about-title className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Document review, without the busywork
        </h1>

        <p data-about-sub className="mt-4 text-lg text-muted-foreground">
          Dilligence.AI was built to take the manual grind out of reading
          contracts, filings, and reports — combining Azure Document
          Intelligence with AI-generated summaries so teams can focus on
          decisions, not scanning pages.
        </p>
      </section>

      <section data-values-section className="border-t">
        <div className="mx-auto max-w-5xl px-8 py-24">
          <div data-fade-in className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What we care about
            </h2>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div
                key={value.title}
                data-value-card
                className="rounded-xl bg-card p-6 text-left shadow-xs ring-1 ring-foreground/10"
              >
                <value.icon className="size-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{value.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div data-fade-in className="mx-auto max-w-3xl px-8 py-24 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Where it's headed
          </h2>
          <p className="mt-4 text-muted-foreground">
            We're an actively evolving project — extraction accuracy, chat
            over documents, and workspace collaboration are all improving
            release over release. Have feedback or a feature request? We'd
            love to hear it.
          </p>
        </div>
      </section>
    </div>
  );
}
