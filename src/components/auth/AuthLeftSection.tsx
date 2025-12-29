import { FaRegEdit, FaPaperPlane, FaChartBar } from "react-icons/fa";
import type { AuthLeftSectionProps } from "@/types";

const features = [
  {
    icon: <FaRegEdit size={20} className="text-white" />,
    title: "Plan Mindfully",
    description: "Create flexible, calm-focused plans",
  },
  {
    icon: <FaPaperPlane size={20} className="text-white" />,
    title: "Journal Daily",
    description: "Reflect on your journey peacefully",
  },
  {
    icon: <FaChartBar size={20} className="text-white" />,
    title: "Grow at Your Pace",
    description: "Progress without pressure or judgment",
  },
];

export default function AuthLeftSection({ type }: AuthLeftSectionProps) {
  const headings = {
    register: {
      title: "Start Your Journey",
      subtitle: "Find calm, plan mindfully",
    },
    login: {
      title: "Welcome Back",
      subtitle: "Continue your mindfulness journey",
    },
    verify: {
      title: "Verify Your Email",
      subtitle: "One step closer to calm",
    },
  };

  const heading = headings[type];

  return (
    <div className="w-full md:w-1/2 bg-gradient-to-br from-[var(--ch-sage-dark)] via-[var(--ch-sage-dark)] to-[var(--ch-bluegrey)] text-white flex flex-col justify-center px-6 md:px-10 py-8 md:py-0">
      <div className="max-w-sm">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 leading-tight">
            CalmHive
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            {heading.subtitle}
          </p>
        </div>

        {/* Main Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
          {heading.title}
        </h2>

        {/* Features List */}
        <div className="space-y-4">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-1">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-base text-white mb-0.5">
                  {feature.title}
                </h3>
                <p className="text-white/70 text-xs">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <p className="text-white/60 text-xs mt-8 leading-relaxed">
          Join thousands finding calm and clarity through mindful planning and
          reflection.
        </p>
      </div>
    </div>
  );
}
