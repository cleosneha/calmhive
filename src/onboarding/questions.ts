import type { OnboardingQuestion } from "@/types";

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    key: "goals",
    text: "What are your main goals for using CalmHive?",
    options: [
      "Reduce daily stress and relax more.",
      "Build better habits and stay productive.",
      "Improve sleep and energy levels.",
    ],
    required: true,
  },
  {
    key: "timeAvailability",
    text: "How much time do you typically have available each day for personal activities?",
    options: [
      "Less than 30 minutes.",
      "30-60 minutes.",
      "More than 60 minutes.",
    ],
    required: true,
  },
  {
    key: "activities",
    text: "What types of activities help you feel more balanced?",
    options: [
      "Physical activities like walking or stretching.",
      "Mindful practices like breathing or reading.",
      "Creative hobbies like journaling or listening to music.",
    ],
    required: true,
  },
  {
    key: "energeticTime",
    text: "On a typical day, when do you feel most energetic?",
    options: [
      "Morning (before noon).",
      "Afternoon (noon to evening).",
      "Evening (after work/school).",
    ],
    required: true,
  },
  {
    key: "anythingElse",
    text: "Is there anything else you'd like to share to personalize your experience? (Totally optional.)",
    options: ["Skip this question"],
    required: false,
  },
];
