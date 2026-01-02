import type { OnboardingQuestion } from "@/types";

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    key: "readiness",
    text: "Hey {firstName}! Let's start understanding you for a better experience.\n\nYou can tap an option or type your own.\n\nAre you ready to start?",
    options: ["Yes, ready to start", "No, not ready yet"],
    required: true,
    followUps: {
      "Yes, ready to start": {
        text: "",
        nextKey: "age",
      },
      "No, not ready yet": {
        text: "No pressure at all! Take your time. Please tell me whenever you feel good to go. 🤍",
        nextKey: "readiness",
      },
    },
  },
  {
    key: "age",
    text: "Great! So let's start with the first question.\n\nWhat's your age range?",
    options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"],
    required: true,
    followUps: {
      "Under 18": {
        text: "Thank you for sharing! It's great that you're starting your wellness journey early.\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "18-24": {
        text: "Thanks! This is such a formative time in life. Let's make it a healthy one.\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "25-34": {
        text: "Got it! This is often a busy time balancing many things. Let's help you find your rhythm.\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "35-44": {
        text: "Thank you! With all the responsibilities at this stage, self-care becomes even more important.\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "45-54": {
        text: "Wonderful! It's never too late to prioritize your wellbeing.\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "55+": {
        text: "Thank you for sharing! Wellness at every age is important, and we're here to support you.\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
    },
  },
  {
    key: "goals",
    text: "What are your main goals for using CalmHive?",
    options: [
      "Reduce daily stress and relax more.",
      "Build better habits and stay productive.",
      "Improve sleep and energy levels.",
    ],
    required: true,
    followUps: {
      "Reduce daily stress and relax more.": {
        text: "That's really important. I totally understand the need for more calm in your daily routine.\n\nWhat aspect of stress would you like to focus on most?",
        nextKey: "stressAspect",
      },
      "Build better habits and stay productive.": {
        text: "I love that you're focused on growth! Building consistent habits can really make a difference.\n\nWhich area would you like to build better habits in?",
        nextKey: "habitArea",
      },
      "Improve sleep and energy levels.": {
        text: "Getting quality rest is so important for everything else. I'm glad you're prioritizing that.\n\nWhat's your biggest challenge with sleep or energy right now?",
        nextKey: "sleepChallenge",
      },
      default: {
        text: "Thank you for sharing that goal.\n\nTell me more about this goal.",
        nextKey: "goalSpecificInfo",
      },
    },
  },
  {
    key: "stressAspect",
    text: "What aspect of stress would you like to focus on most?",
    options: [
      "Work and career pressure",
      "Personal relationships",
      "Daily routines and time management",
    ],
    required: true,
    followUps: {
      default: {
        text: "Thank you for sharing. That's really helpful to know.\n\nHow much time do you typically have available each day for personal activities?",
        nextKey: "timeAvailability",
      },
    },
  },
  {
    key: "habitArea",
    text: "Which area would you like to build better habits in?",
    options: [
      "Exercise and physical health",
      "Work productivity and focus",
      "Mental health and mindfulness",
    ],
    required: true,
    followUps: {
      default: {
        text: "Great choice! That's a wonderful area to focus on.\n\nHow much time do you typically have available each day for personal activities?",
        nextKey: "timeAvailability",
      },
    },
  },
  {
    key: "sleepChallenge",
    text: "What's your biggest challenge with sleep or energy right now?",
    options: [
      "Difficulty falling asleep",
      "Waking up tired or low energy",
      "Inconsistent sleep schedule",
    ],
    required: true,
    followUps: {
      default: {
        text: "I understand. Let's work on improving that.\n\nHow much time do you typically have available each day for personal activities?",
        nextKey: "timeAvailability",
      },
    },
  },
  {
    key: "goalSpecificInfo",
    text: "Tell me more about this goal.",
    options: [],
    required: true,
    followUps: {
      default: {
        text: "Thank you for sharing that detail. It really helps me understand what matters most to you.\n\nHow much time do you typically have available each day for personal activities?",
        nextKey: "timeAvailability",
      },
    },
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
    followUps: {
      "Less than 30 minutes.": {
        text: "That's perfectly fine! Even short moments can make a real impact when used intentionally.\n\nWhat types of activities help you feel more balanced?",
        nextKey: "activities",
      },
      "30-60 minutes.": {
        text: "That's a great amount of time to work with! We can create some meaningful routines for you.\n\nWhat types of activities help you feel more balanced?",
        nextKey: "activities",
      },
      "More than 60 minutes.": {
        text: "Wonderful! Having more time gives us lots of flexibility to explore different activities.\n\nWhat types of activities help you feel more balanced?",
        nextKey: "activities",
      },
    },
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
    followUps: {
      "Physical activities like walking or stretching.": {
        text: "Movement is such a powerful way to reset! Your body will thank you.\n\nOn a typical day, when do you feel most energetic?",
        nextKey: "energeticTime",
      },
      "Mindful practices like breathing or reading.": {
        text: "Those quiet moments can be so grounding. It's great that you value that space.\n\nOn a typical day, when do you feel most energetic?",
        nextKey: "energeticTime",
      },
      "Creative hobbies like journaling or listening to music.": {
        text: "Creativity is such a beautiful outlet! Those activities can be really nourishing.\n\nOn a typical day, when do you feel most energetic?",
        nextKey: "energeticTime",
      },
    },
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
    followUps: {
      "Morning (before noon).": {
        text: "Great! Morning energy is perfect for setting a positive tone for the day.\n\nIs there anything else you'd like to share to personalize your experience? (Totally optional.)",
        nextKey: "anythingElse",
      },
      "Afternoon (noon to evening).": {
        text: "Nice! The afternoon can be a great time to refresh and recharge.\n\nIs there anything else you'd like to share to personalize your experience? (Totally optional.)",
        nextKey: "anythingElse",
      },
      "Evening (after work/school).": {
        text: "Perfect! Evening activities can help you unwind and transition into a restful night.\n\nIs there anything else you'd like to share to personalize your experience? (Totally optional.)",
        nextKey: "anythingElse",
      },
    },
  },
  {
    key: "anythingElse",
    text: "Is there anything else you'd like to share to personalize your experience? (Totally optional.)",
    options: ["Skip this question"],
    required: false,
  },
];
