"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { Mood } from "@/types/journal";
import { getMoodIcon } from "@/utils/mood-icons";
import { FiShare2, FiEye } from "react-icons/fi";
import { generateEntryPDF } from "@/actions/generate-pdf";
import { toast } from "sonner";

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

  const formatDateOnly = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const onShare = async () => {
    try {
      const base64 = await generateEntryPDF(entry);
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
        { type: "application/pdf" },
      );
      const file = new File([pdfBlob], `${entry.title}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share) {
        await navigator.share({
          title: entry.title,
          text: "Journal entry PDF",
          files: [file],
        });
      } else {
        toast.error("Sharing not supported on this device.");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      toast.error("Failed to share PDF. Please try again.");
    }
  };

  const onPreview = async () => {
    try {
      const base64 = await generateEntryPDF(entry);
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
        { type: "application/pdf" },
      );
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error previewing PDF:", error);
      toast.error("Failed to preview PDF. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto  sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">{entry.title}</h1>
        <div className="flex items-center gap-2">
          {entry.mood && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs sm:text-sm">
              {React.createElement(getMoodIcon(entry.mood).icon, {
                className: `${getMoodIcon(entry.mood).color} text-base sm:text-lg`,
              })}
              <span className="capitalize">{entry.mood.toLowerCase()}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Preview PDF"
            onClick={onPreview}
          >
            <FiEye className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Share entry"
            onClick={onShare}
          >
            <FiShare2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="mb-4 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
        <div className="hidden sm:block">
          Created: {formatDate(entry.createdAt)}
          {entry.updatedAt && (
            <span> | Updated: {formatDate(entry.updatedAt)}</span>
          )}
          {entry.isPrivate && <span> | Private</span>}
          {entry.pinned && <span> | Pinned</span>}
        </div>
        <div className="sm:hidden flex flex-wrap gap-2">
          <span>{formatDateOnly(entry.createdAt)}</span>
          {entry.updatedAt && <span>{formatDateOnly(entry.updatedAt)}</span>}
          {entry.isPrivate && (
            <span className="px-2 py-1 bg-gray-100 rounded text-[10px]">
              Private
            </span>
          )}
          {entry.pinned && (
            <span className="px-2 py-1 bg-gray-100 rounded text-[10px]">
              Pinned
            </span>
          )}
        </div>
      </div>
      <div className="prose prose-sm sm:prose-base max-w-none mb-6 prose-p:my-2 prose-p:min-h-[1.5rem] prose-li:my-1 prose-strong:font-bold prose-em:italic prose-u:underline prose-ul:list-disc prose-ul:ml-4 sm:prose-ul:ml-6 prose-ul:my-2 prose-li:ml-2 [&_p:empty]:min-h-[1.5rem] [&_p:empty]:block">
        <div dangerouslySetInnerHTML={{ __html: entry.content }} />
      </div>
      <Button onClick={onEdit} className="w-full sm:w-auto">
        Edit
      </Button>
    </div>
  );
}
