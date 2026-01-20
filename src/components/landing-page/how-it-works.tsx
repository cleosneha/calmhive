"use client";

import { motion } from "framer-motion";
import { GiNotebook } from "react-icons/gi";
import { MdOutlineCalendarToday } from "react-icons/md";
import { AiOutlineBulb } from "react-icons/ai";
import { SiGnuprivacyguard } from "react-icons/si";

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
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="max-w-6xl mx-auto my-14 px-6 bg-white/80 backdrop-blur-sm rounded-2xl"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-2xl font-semibold text-[var(--ch-sage-dark)]">
          Your Calm Routine
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          A simple, mindful routine: journal a little, plan thoughtfully, and
          get calm, useful insights.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              className="relative overflow-hidden flex flex-col gap-3 rounded-xl border border-[var(--ch-sage-light)]/40 bg-white/60 p-5 shadow-[10px_12px_18px_-5px_rgba(2,_31,_0,_0.1)] backdrop-blur-sm"
            >
              {/* Subtle, centered gradient circle (background of card) */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full blur-2xl opacity-60 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(47,160,127,0.35) 0%, rgba(47,160,127,0.18) 35%, rgba(255,255,255,0) 65%)",
                }}
                animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.02, 1] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--ch-sage-light)]/10">
                  <Icon className="text-[var(--ch-sage-dark)] w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-black">
                  {step.title}
                </h4>
              </div>

              <p className="relative z-10 text-sm text-muted-foreground mt-1">
                {step.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
