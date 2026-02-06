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
        nextKey: "dateOfBirth",
      },
      "No, not ready yet": {
        text: "No pressure at all! Take your time. Please tell me whenever you feel good to go. 🤍",
        nextKey: "readiness",
      },
    },
  },
  {
    key: "dateOfBirth",
    text: "Great! So let's start with the first question.\n\nWhat's your date of birth? Please enter in DD/MM/YYYY format (e.g., 15/03/1990).",
    options: [], // No options, user should type a date
    required: true,
    /**
     * The followUps for dateOfBirth are dynamic based on age calculated from DOB.
     * The handler will calculate age from DOB and use the age range to select the appropriate follow-up.
     */
    followUps: {
      "Under 18": {
        text: "That's a wonderful age to start building healthy habits early!\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "18-24": {
        text: "Your early adulthood is a time of growth and new experiences. It's great you're focusing on your well-being!\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "25-34": {
        text: "That's a great age, but balancing everything can be a challenge. Let's make sure you find time for yourself!\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "35-44": {
        text: "This is a busy stage of life for many. Prioritizing your well-being is so important!\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "45-54": {
        text: "Taking care of yourself at this age can make a huge difference in your quality of life.\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      "55+": {
        text: "It's inspiring to see you investing in your well-being. Every age is the right age to feel your best!\n\nWhat are your main goals for using CalmHive?",
        nextKey: "goals",
      },
      default: {
        text: "Thank you for sharing! Let's help you find what works best for you.\n\nWhat are your main goals for using CalmHive?",
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
        text: "That's really important. I totally understand the need for more calm in your daily routine.",
        nextKey: "stressAspect",
      },
      "Build better habits and stay productive.": {
        text: "I love that you're focused on growth! Building consistent habits can really make a difference.",
        nextKey: "habitArea",
      },
      "Improve sleep and energy levels.": {
        text: "Getting quality rest is so important for everything else. I'm glad you're prioritizing that.",
        nextKey: "sleepChallenge",
      },
      default: {
        text: "Thank you for sharing that goal.",
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
      "Work and career pressure": {
        text: "Work stress is so common, and addressing it can make a huge difference in your overall well-being. Let's create strategies to help you manage that pressure better.",
        nextKey: "timeAvailability",
      },
      "Personal relationships": {
        text: "Relationships are so important, and taking care of the stress they might create is valuable self-care. We'll help you navigate this more smoothly.",
        nextKey: "timeAvailability",
      },
      "Daily routines and time management": {
        text: "Getting your daily routines and time in order can be truly transformative. Better time management often leads to less stress overall.",
        nextKey: "timeAvailability",
      },
      default: {
        text: "Thank you for sharing. That's really helpful to know.",
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
      "Exercise and physical health": {
        text: "That's fantastic! Building exercise into your routine is one of the most impactful things you can do for your health. Even small, consistent movements can transform how you feel.",
        nextKey: "timeAvailability",
      },
      "Work productivity and focus": {
        text: "Great focus! Building better work habits can help you achieve more while feeling less overwhelmed. We'll help you create sustainable routines that boost your productivity.",
        nextKey: "timeAvailability",
      },
      "Mental health and mindfulness": {
        text: "Wonderful choice! Investing in your mental health through mindfulness is one of the greatest gifts you can give yourself. These habits create lasting positive changes.",
        nextKey: "timeAvailability",
      },
      default: {
        text: "Great choice! That's a wonderful area to focus on.",
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
      "Difficulty falling asleep": {
        text: "Falling asleep can be frustrating when your mind won't settle down. CalmHive has wonderful tools to help you wind down and drift off more easily.",
        nextKey: "timeAvailability",
      },
      "Waking up tired or low energy": {
        text: "Waking up refreshed makes such a difference for your entire day. Let's work on improving your sleep quality and morning energy.",
        nextKey: "timeAvailability",
      },
      "Inconsistent sleep schedule": {
        text: "An inconsistent sleep schedule can really throw off your body and mind. Creating a more regular routine can transform how you feel.",
        nextKey: "timeAvailability",
      },
      default: {
        text: "I understand. Let's work on improving that.",
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
        text: "Thank you for sharing that detail. It really helps me understand what matters most to you.",
        nextKey: "timeAvailability",
      },
    },
  },
  {
    key: "timeAvailability",
    text: "How much time do you typically have available each day for personal activities?",
    options: ["30 minutes.", "45 minutes.", "90 minutes."],
    required: true,
    followUps: {
      "30 minutes.": {
        text: "That's perfectly fine! Even short moments can make a real impact when used intentionally.",
        nextKey: "activities",
      },
      "45 minutes.": {
        text: "That's a great amount of time to work with! We can create some meaningful routines for you.",
        nextKey: "activities",
      },
      "90 minutes.": {
        text: "Wonderful! Having more time gives us lots of flexibility to explore different activities.",
        nextKey: "activities",
      },
      default: {
        text: "Thanks for sharing—any amount of time can be helpful when used consistently.",
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
        text: "Movement is such a powerful way to reset! Your body will thank you.",
        nextKey: "energeticTime",
      },
      "Mindful practices like breathing or reading.": {
        text: "Those quiet moments can be so grounding. It's great that you value that space.",
        nextKey: "energeticTime",
      },
      "Creative hobbies like journaling or listening to music.": {
        text: "Creativity is such a beautiful outlet! Those activities can be really nourishing.",
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
        text: "Great! Morning energy is perfect for setting a positive tone for the day.",
        nextKey: "daysOff",
      },
      "Afternoon (noon to evening).": {
        text: "Nice! The afternoon can be a great time to refresh and recharge.",
        nextKey: "daysOff",
      },
      "Evening (after work/school).": {
        text: "Perfect! Evening activities can help you unwind and transition into a restful night.",
        nextKey: "daysOff",
      },
    },
  },
  {
    key: "daysOff",
    text: "Is there any day you want a day off of?",
    options: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
      "None",
    ],
    required: true,
    multiSelect: true,
    followUps: {
      default: {
        text: "Perfect! We'll make sure to respect your rest days while planning activities.",
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
