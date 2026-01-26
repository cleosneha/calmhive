"use client";

import { useEffect, useState } from "react";
import JournalHome from "./journal-home";
import JournalHomeMobile from "./journal-home-mobile";

type Entry = {
  id: number;
  title: string;
  date: Date;
  excerpt?: string;
  mood?: string;
  pinned?: boolean;
  isPrivate?: boolean;
};

interface JournalHomeResponsiveProps {
  recentEntries: Entry[];
  pinnedEntries: Entry[];
  userImage?: string;
  message: string;
  quote: string;
}

export default function JournalHomeResponsive(
  props: JournalHomeResponsiveProps,
) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  if (isMobile) {
    return <JournalHomeMobile {...props} />;
  }

  return <JournalHome {...props} />;
}
