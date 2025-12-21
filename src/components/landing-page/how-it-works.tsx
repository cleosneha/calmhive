import {
  FaUserPlus,
  FaRegEdit,
  FaRegLightbulb,
  FaPaperPlane,
  FaChartBar,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaUserPlus size={28} className="text-white" />,
    title: "Start onboarding",
    description: "Answer a few gentle questions.",
  },
  {
    icon: <FaRegEdit size={28} className="text-white" />,
    title: "Personalize your plan",
    description: "Get a flexible weekly plan.",
  },
  {
    icon: <FaPaperPlane size={28} className="text-white" />,
    title: "Daily check-ins",
    description: "Mark tasks and journal easily.",
  },
  {
    icon: <FaRegLightbulb size={28} className="text-white" />,
    title: "Weekly insights",
    description: "Receive gentle, supportive insights.",
  },
  {
    icon: <FaChartBar size={28} className="text-white" />,
    title: "Grow at your pace",
    description: "Reflect and progress calmly.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white py-16 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-[var(--ch-sage-dark)] mb-2">
          How CalmHive Works
        </h2>
        <p className="text-base text-[var(--ch-sage)] mb-8">
          Simple, supportive steps to help you plan, reflect, and grow—at your
          own pace.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--ch-sage-dark)] shadow-lg mb-3 border-2 border-[var(--ch-sage-dark)]">
                {step.icon}
              </div>
              <h3 className="text-base font-semibold text-[var(--ch-sage-dark)] mb-1">
                {step.title}
              </h3>
              <p className="text-[var(--ch-sage)] text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
