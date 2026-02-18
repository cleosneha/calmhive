import {
  FiCheckCircle,
  FiCalendar,
  FiBook,
  FiBarChart2,
  FiRefreshCw,
} from "react-icons/fi";
import { GuideSection } from "@/types/guide";

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: FiCheckCircle,
    color: "var(--ch-sage-dark)",
    description:
      "Set up your CalmHive account and complete the initial personalization",
    items: [
      {
        title: "Create Your Account",
        description: "Sign up securely to access your personal CalmHive space",
        steps: [
          "Enter your email and create a password",
          "Verify your email to activate your account",
          "Log in to access your personal dashboard",
        ],
      },
      {
        title: "Complete AI Onboarding",
        description: "Help CalmHive understand your lifestyle and preferences",
        steps: [
          "Answer a few short guided questions in chat",
          "You can use provided response options or write your own",
          "Complete all questions to generate your personalized plan",
        ],
      },
      {
        title: "Verify Your Information",
        description: "Confirm your details before plan generation",
        steps: [
          "Review your onboarding responses",
          "Ensure your answers reflect your current capacity and needs",
          "Confirm details to proceed to your plan",
        ],
      },
    ],
  },
  {
    id: "plan-generation",
    title: "Plan Generation",
    icon: FiCalendar,
    color: "var(--ch-sage-dark)",
    description: "Create a personalized and flexible weekly plan powered by AI",
    items: [
      {
        title: "AI Plan Creation",
        description: "Automatically generate your personalized weekly plan",
        steps: [
          "AI uses your onboarding responses and signals",
          "Considers your energy and available capacity",
          "Builds a lightweight and flexible weekly structure",
        ],
      },
      {
        title: "Review Your Plan",
        description: "Understand your suggested weekly flow",
        steps: [
          "View daily tasks and relevant notes",
          "Check suggested intensity levels",
          "Explore the overall weekly structure",
        ],
      },
      {
        title: "Edit & Finalize Plan",
        description: "Refine your plan with full control",
        steps: [
          "Request changes using the AI assistant",
          "Approve suggested updates before applying",
          "Finalize the plan for a stable week",
        ],
      },
    ],
  },
  {
    id: "daily-tracking",
    title: "Daily Tracking & Journaling",
    icon: FiBook,
    color: "var(--ch-sage-dark)",
    description: "Track progress and reflect with minimal effort",
    items: [
      {
        title: "Update Daily Tasks",
        description: "Log your progress in a simple and flexible way",
        steps: [
          "Mark tasks as Done, Pending, or Partial",
          "Add short optional notes to tasks",
          "Maintain streak counters for motivation without pressure",
        ],
      },
      {
        title: "Guided Journaling",
        description: "Reflect through soft and supportive prompts",
        steps: [
          "Answer a few calming reflection questions",
          "Use text or voice input for responses",
          "Keep entries short and pressure-free",
        ],
      },
      {
        title: "Save & Manage Entries",
        description: "Keep full control over your reflections",
        steps: [
          "AI generates a draft from your inputs",
          "Edit and personalize the journal content",
          "Save your final entry securely",
        ],
      },
    ],
  },
  {
    id: "weekly-insights",
    title: "Weekly Insights",
    icon: FiBarChart2,
    color: "var(--ch-sage-dark)",
    description: "Receive gentle reflections based on your activity patterns",
    items: [
      {
        title: "Activity Signal Analysis",
        description: "Convert actions and journaling into meaningful signals",
        steps: [
          "Analyze task completion patterns",
          "Identify recurring themes over time",
          "Store only aggregated and private insights",
        ],
      },
      {
        title: "Insight Generation",
        description: "Create a calm and supportive weekly narrative",
        steps: [
          "Generate a reflective weekly summary",
          "Highlight 2–3 gentle behavioral patterns",
          "Provide optional reflection prompts",
        ],
      },
      {
        title: "View Your Insights",
        description: "Access your reflections anytime inside the app",
        steps: [
          "Open the dedicated Insights page",
          "Read your weekly narrative summary",
          "Receive a supportive email overview",
        ],
      },
    ],
  },
  {
    id: "continuous-experience",
    title: "Continuous Experience",
    icon: FiRefreshCw,
    color: "var(--ch-sage-dark)",
    description: "CalmHive quietly supports your ongoing weekly cycle",
    items: [
      {
        title: "Plan → Act → Reflect Cycle",
        description: "Follow a seamless and adaptive weekly loop",
        steps: [
          "Start with a personalized weekly plan",
          "Complete small tasks at your own pace",
          "Reflect through journaling and insights",
        ],
      },
      {
        title: "Adaptive Personalization",
        description: "The system evolves with your behavior over time",
        steps: [
          "Learns from your task updates and reflections",
          "Adjusts future plans gently",
          "Maintains a flexible and non-rigid experience",
        ],
      },
      {
        title: "Low Effort Experience",
        description: "Designed to reduce cognitive load and pressure",
        steps: [
          "No strict schedules or deadlines",
          "Minimal manual input required",
          "AI handles most background adjustments",
        ],
      },
    ],
  },
];
