import {
  FaRegSadTear,
  FaRegAngry,
  FaRegFrown,
  FaRegMeh,
  FaRegGrin,
  FaRegTired,
  FaRegMehBlank,
  FaRegSmileBeam,
} from "react-icons/fa";

import type { Mood } from "@/types/journal";

export function getMoodIcon(mood: Mood) {
  switch (mood) {
    case "HAPPY":
      return { icon: FaRegSmileBeam, color: "text-[var(--ch-sage-dark)]" };
    case "SAD":
      return { icon: FaRegSadTear, color: "text-[var(--ch-bluegrey)]" };
    case "ANGRY":
      return { icon: FaRegAngry, color: "text-red-500" };
    case "ANXIOUS":
      return { icon: FaRegFrown, color: "text-orange-500" };
    case "CALM":
      return { icon: FaRegMeh, color: "text-[var(--ch-sage-light)]" };
    case "EXCITED":
      return { icon: FaRegGrin, color: "text-yellow-500" };
    case "TIRED":
      return { icon: FaRegTired, color: "text-gray-500" };
    case "NEUTRAL":
      return { icon: FaRegMehBlank, color: "text-[var(--ch-muted)]" };
    default:
      return { icon: FaRegMehBlank, color: "text-[var(--ch-muted)]" };
  }
}
