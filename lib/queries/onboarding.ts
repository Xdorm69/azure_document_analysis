"use client";

import { useMutation } from "@tanstack/react-query";

import { fetchJson } from "@/lib/api-client";
import { onboardingResponseSchema } from "@/lib/validations/api-responses";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";

export function useSubmitOnboardingMutation() {
  return useMutation({
    mutationFn: (input: OnboardingInput) => {
      const body = onboardingSchema.parse(input);
      return fetchJson("/api/onboarding", onboardingResponseSchema, {
        method: "POST",
        body,
      });
    },
  });
}
