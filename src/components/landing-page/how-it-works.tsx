"use client";

import { motion } from "framer-motion";
import { GiNotebook } from "react-icons/gi";
import { MdOutlineCalendarToday } from "react-icons/md";
import { AiOutlineBulb } from "react-icons/ai";
import { SiGnuprivacyguard } from "react-icons/si";
import { BiBarChartAlt2 } from "react-icons/bi";
import { BsCheck2Circle } from "react-icons/bs";

const steps = [
  {
    id: 1,
    Icon: GiNotebook,
    title: "Journal with AI Prompts",
    text: "Quick, calming prompts to capture your day and clear your mind. AI summarizes and highlights what matters.",
  },
  {
    id: 2,
    Icon: MdOutlineCalendarToday,
    title: "Plan with Balance",
    text: "Smart planning that respects work, rest, and your holidays — so you stay productive without burning out.",
  },
  {
    id: 3,
    Icon: AiOutlineBulb,
    title: "Get Personalized Insights",
    text: "Receive gentle, actionable insights and monthly summaries tailored to your patterns and goals.",
  },
  {
    id: 4,
    Icon: SiGnuprivacyguard,
    title: "Privacy First",
    text: "Your reflections are private and secure — we design insights with privacy and safety in mind.",
  },
  {
    id: 5,
    Icon: BiBarChartAlt2,
    title: "Report Generation",
    text: "Automatically generate weekly and monthly reports summarizing progress and insights — exportable as PDF for sharing or personal review.",
  },
  {
    id: 6,
    Icon: BsCheck2Circle,
    title: "Habit-Friendly Tasks",
    text: "Small, consistent tasks and gentle streaks to help you build habits without pressure.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="my-8 py-10 md:py-14 bg-white/80 backdrop-blur-sm rounded-2xl"
    >
      <div className="max-w-[90vw] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-3xl font-semibold text-[var(--ch-sage-dark)]">
            Your Calm Routine
          </h3>
          <p className="mt-4 text-base text-muted-foreground">
            A simple, mindful routine: journal a little, plan thoughtfully, and
            get calm, useful insights.
          </p>
        </div>

        <div className="mt-8 md:mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
            {steps.map((step, i) => {
              const Icon = step.Icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ y: 18, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative overflow-hidden flex flex-col gap-8 rounded-2xl border border-[var(--ch-sage-light)]/30 bg-white/60 p-6 md:p-10 lg:p-12 shadow-[22px_26px_36px_-12px_rgba(2,_31,_0,_0.08)] backdrop-blur-sm min-h-70"
                >
                  {/* Subtle, centered gradient circle (background of card) */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full blur-3xl opacity-50 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(47,160,127,0.32) 0%, rgba(47,160,127,0.12) 38%, rgba(255,255,255,0) 72%)",
                    }}
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.015, 1] }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <div className="relative z-10 flex  items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--ch-sage-light)]/10">
                      <Icon className="text-[var(--ch-sage-dark)] w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-black">
                      {step.title}
                    </h4>
                  </div>

                  <p className="relative z-10 text-sm text-muted-foreground ">
                    {step.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
