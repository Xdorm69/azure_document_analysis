import { z } from "zod";

export const PRIMARY_USE_CASES = [
  { value: "contracts", label: "Contracts" },
  { value: "financial_reports", label: "Financial reports" },
  { value: "compliance_legal", label: "Compliance / legal review" },
  { value: "other", label: "Something else" },
] as const;

export const TEAM_SIZES = [
  { value: "solo", label: "Just me" },
  { value: "2-10", label: "2–10 people" },
  { value: "11-50", label: "11–50 people" },
  { value: "51-200", label: "51–200 people" },
  { value: "200+", label: "200+ people" },
] as const;

export const REFERRAL_SOURCES = [
  { value: "search", label: "Search engine" },
  { value: "social", label: "Social media" },
  { value: "colleague", label: "Colleague or friend" },
  { value: "other", label: "Other" },
] as const;

const useCaseValues = PRIMARY_USE_CASES.map((option) => option.value) as [
  string,
  ...string[],
];
const teamSizeValues = TEAM_SIZES.map((option) => option.value) as [
  string,
  ...string[],
];
const referralSourceValues = REFERRAL_SOURCES.map((option) => option.value) as [
  string,
  ...string[],
];

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please tell us your name")
    .max(120, "Name is too long"),
  role: z
    .string()
    .trim()
    .max(120, "Role is too long")
    .optional()
    .or(z.literal("")),
  primaryUseCase: z.enum(useCaseValues, {
    message: "Please choose what you'll mainly use this for",
  }),
  teamSize: z.enum(teamSizeValues, {
    message: "Please choose your team size",
  }),
  referralSource: z
    .enum(referralSourceValues)
    .optional()
    .or(z.literal("")),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
