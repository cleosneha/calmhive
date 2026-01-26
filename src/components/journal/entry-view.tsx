"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Mood } from "@/types/journal";
import { getMoodIcon } from "@/utils/mood-icons";

interface Entry {
  id: number;
  title: string;
  content: string;
  mood?: Mood;
  pinned: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface EntryViewProps {
  entry: Entry;
  onEdit: () => void;
}

export default function EntryView({ entry, onEdit }: EntryViewProps) {
  console.log("EntryView rendering entry:", entry);
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{entry.title}</h1>
        {entry.mood && (
          <div className="text-2xl">
            {React.createElement(getMoodIcon(entry.mood).icon, {
              className: getMoodIcon(entry.mood).color,
            })}
          </div>
        )}
      </div>
      <div className="mb-4 text-sm text-gray-600">
        Created: {formatDate(entry.createdAt)}
        {entry.updatedAt && (
          <span> | Updated: {formatDate(entry.updatedAt)}</span>
        )}
        {entry.isPrivate && <span> | Private</span>}
        {entry.pinned && <span> | Pinned</span>}
      </div>
      <div className="prose max-w-none mb-6">{entry.content}</div>
      <Button onClick={onEdit}>Edit</Button>
    </div>
  );
}
