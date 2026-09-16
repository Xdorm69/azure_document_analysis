import Link from "next/link";
import { FileSearchIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-8 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Document analysis, built for diligence
      </h1>

      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Upload contracts, reports, and filings — get extracted text,
        searchable chunks, and AI-generated insights in one workspace.
      </p>

      <div className="mt-8">
        <Button size="lg" render={<Link href="/dashboard" />}>
          Go to dashboard
        </Button>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="text-left">
            <CardContent>
              <feature.icon className="size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{feature.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
