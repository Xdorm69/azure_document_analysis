"use client";

import { useRef, useState, type FormEvent } from "react";
import { MailIcon, MapPinIcon, MessageSquareIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const CONTACT_POINTS = [
  {
    icon: MailIcon,
    title: "Email",
    description: "hello@dilligence.ai",
  },
  {
    icon: MessageSquareIcon,
    title: "Support",
    description: "Response within one business day",
  },
  {
    icon: MapPinIcon,
    title: "Based",
    description: "Remote-first team",
  },
];

export default function ContactPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  useGSAP(
    () => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-contact-title]", { y: 30, opacity: 0, duration: 0.7 })
        .from(
          "[data-contact-sub]",
          { y: 20, opacity: 0, duration: 0.6 },
          "-=0.4"
        );

      gsap.from("[data-contact-point]", {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-contact-points]",
          start: "top 85%",
        },
      });

      gsap.from("[data-contact-form]", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-contact-form]",
          start: "top 85%",
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope: rootRef }
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    // No backend endpoint wired up yet — this simulates a submit so the
    // UI/animation flow can be reviewed end to end.
    window.setTimeout(() => setStatus("sent"), 900);
  }

  return (
    <div ref={rootRef}>
      <section className="mx-auto max-w-2xl px-8 py-24 text-center">
        <h1
          data-contact-title
          className="text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Get in touch
        </h1>
        <p data-contact-sub className="mt-4 text-lg text-muted-foreground">
          Questions, feedback, or want a walkthrough of Dilligence.AI? Send us
          a message.
        </p>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-4xl gap-12 px-8 py-16 sm:grid-cols-[1fr_1.4fr]">
          <div data-contact-points className="flex flex-col gap-6">
            {CONTACT_POINTS.map((point) => (
              <div key={point.title} data-contact-point className="flex gap-3">
                <point.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{point.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form
            data-contact-form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input id="name" name="name" placeholder="Jane Doe" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="How can we help?"
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={status !== "idle"}
              className="self-start"
            >
              {status === "sent" ? "Message sent" : "Send message"}
              {status !== "sent" && <SendIcon className="size-4" />}
            </Button>

            {status === "sent" && (
              <p className="text-sm text-muted-foreground">
                Thanks for reaching out — we&apos;ll get back to you soon.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
