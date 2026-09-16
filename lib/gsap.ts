"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);

  // The most common reason ScrollTrigger "stops working" (or fires at the
  // wrong scroll position) in a Next.js app is that trigger start/end
  // values get calculated before web fonts finish swapping in, which
  // changes the height of everything below the hero. Refresh once
  // everything has actually finished loading/laying out.
  window.addEventListener("load", () => ScrollTrigger.refresh());

  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

export { gsap, ScrollTrigger, useGSAP };
