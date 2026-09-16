"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitOnboardingMutation } from "@/lib/queries/onboarding";
import {
  PRIMARY_USE_CASES,
  REFERRAL_SOURCES,
  TEAM_SIZES,
  onboardingSchema,
} from "@/lib/validations/onboarding";

type FormState = {
  name: string;
  role: string;
  primaryUseCase: string;
  teamSize: string;
  referralSource: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  role: "",
  primaryUseCase: "",
  teamSize: "",
  referralSource: "",
};

export function OnboardingForm({ defaultName = "" }: { defaultName?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    ...INITIAL_STATE,
    name: defaultName,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const mutation = useSubmitOnboardingMutation();

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = onboardingSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    mutation.mutate(result.data, {
      onSuccess: () => {
        router.push("/dashboard");
        router.refresh();
      },
    });
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Your name
            </label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ada Lovelace"
              autoFocus
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium">
              Your role{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="role"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              placeholder="e.g. Analyst, Counsel, Founder"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="primaryUseCase" className="text-sm font-medium">
              What will you mainly use this for?
            </label>
            <select
              id="primaryUseCase"
              value={form.primaryUseCase}
              onChange={(event) =>
                updateField("primaryUseCase", event.target.value)
              }
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="" disabled>
                Choose one
              </option>
              {PRIMARY_USE_CASES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.primaryUseCase && (
              <p className="text-sm text-destructive">
                {fieldErrors.primaryUseCase}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="teamSize" className="text-sm font-medium">
              Team size
            </label>
            <select
              id="teamSize"
              value={form.teamSize}
              onChange={(event) => updateField("teamSize", event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="" disabled>
                Choose one
              </option>
              {TEAM_SIZES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.teamSize && (
              <p className="text-sm text-destructive">{fieldErrors.teamSize}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="referralSource" className="text-sm font-medium">
              How did you hear about us?{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <select
              id="referralSource"
              value={form.referralSource}
              onChange={(event) =>
                updateField("referralSource", event.target.value)
              }
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">Prefer not to say</option>
              {REFERRAL_SOURCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Something went wrong. Please try again."}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending && (
              <LoaderCircleIcon className="animate-spin" />
            )}
            {mutation.isPending ? "Saving..." : "Continue to dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
