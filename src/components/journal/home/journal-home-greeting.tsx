"use client";

import { useState } from "react";
import { getTimeGreeting, getRandomQuote } from "@/utils/greeting";
import JournalHomeResponsive from "./journal-home-responsive";

type Entry = {
  id: number;
  title: string;
  date: Date;
  excerpt?: string;
  mood?: string;
  pinned?: boolean;
  isPrivate?: boolean;
};

interface JournalHomeGreetingProps {
  recentEntries: Entry[];
  pinnedEntries: Entry[];
  userImage?: string;
  userName?: string;
  quote: string;
}

export default function JournalHomeGreeting({
  recentEntries,
  pinnedEntries,
  userImage,
  userName,
  quote,
}: JournalHomeGreetingProps) {
  const [greeting] = useState(() => {
    // Get current hour in user's local timezone
    const hour = new Date().getHours();
    const timeGreeting = getTimeGreeting(hour);
    const firstName = userName?.split(" ")?.[0]?.trim();
    const message = firstName
      ? `Hey ${firstName}, ${timeGreeting}`
      : timeGreeting;

    return { message, quote };
  });

  return (
    <JournalHomeResponsive
      recentEntries={recentEntries}
      pinnedEntries={pinnedEntries}
      userImage={userImage}
      message={greeting.message}
      quote={greeting.quote}
    />
  );
}
