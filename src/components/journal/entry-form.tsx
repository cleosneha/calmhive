"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "./rich-text-editor";
import type { Mood } from "@/types/journal";
import { getMoodIcon } from "@/utils/mood-icons";
import { toast } from "sonner";

interface Entry {
  id: number;
  title: string;
  content: string;
  mood?: Mood;
  pinned: boolean;
  isPrivate: boolean;
  createdAt: Date;
}

interface EntryFormProps {
  entry?: Entry;
  mode: "new" | "edit";
  onSave: (data: {
    title: string;
    content: string;
    mood?: Mood;
    pinned: boolean;
    isPrivate: boolean;
  }) => void;
}

export default function EntryForm({ entry, mode, onSave }: EntryFormProps) {
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [mood, setMood] = useState<Mood>(entry?.mood || "NEUTRAL");
  const [isPrivate, setIsPrivate] = useState(entry?.isPrivate || false);
  const [pinned, setPinned] = useState(entry?.pinned || false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    onSave({ title, content, mood, pinned, isPrivate });
  };

  const createdAt = entry?.createdAt || new Date();
  const updatedAt = mode === "edit" ? new Date() : undefined;

  return (
    <div className="max-w-7xl mx-auto sm:p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            placeholder="Heading"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl sm:text-2xl font-bold border-none shadow-none p-0 focus-visible:ring-0"
          />
        </div>
        <div className="mb-4 text-xs sm:text-sm text-gray-600">
          <div className="hidden sm:block">
            Created: {formatDate(createdAt)}
            {updatedAt && <span> | Updated: {formatDate(updatedAt)}</span>}
          </div>
          <div className="sm:hidden text-[10px]">
            <div>Created: {formatDateOnly(createdAt)}</div>
            {updatedAt && <div>Updated: {formatDateOnly(updatedAt)}</div>}
          </div>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0 text-xs">
          <div className="flex items-center space-x-2">
            <span className="whitespace-nowrap">Mood:</span>
            <Select
              value={mood}
              onValueChange={(value: Mood) => setMood(value)}
            >
              <SelectTrigger className="w-24 sm:w-32" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HAPPY">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("HAPPY").icon, {
                      className: `${getMoodIcon("HAPPY").color} text-xs`,
                    })}
                    Happy
                  </div>
                </SelectItem>
                <SelectItem value="SAD">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("SAD").icon, {
                      className: `${getMoodIcon("SAD").color} text-xs`,
                    })}
                    Sad
                  </div>
                </SelectItem>
                <SelectItem value="ANGRY">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("ANGRY").icon, {
                      className: `${getMoodIcon("ANGRY").color} text-xs`,
                    })}
                    Angry
                  </div>
                </SelectItem>
                <SelectItem value="ANXIOUS">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("ANXIOUS").icon, {
                      className: `${getMoodIcon("ANXIOUS").color} text-xs`,
                    })}
                    Anxious
                  </div>
                </SelectItem>
                <SelectItem value="CALM">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("CALM").icon, {
                      className: `${getMoodIcon("CALM").color} text-xs`,
                    })}
                    Calm
                  </div>
                </SelectItem>
                <SelectItem value="EXCITED">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("EXCITED").icon, {
                      className: `${getMoodIcon("EXCITED").color} text-xs`,
                    })}
                    Excited
                  </div>
                </SelectItem>
                <SelectItem value="TIRED">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("TIRED").icon, {
                      className: `${getMoodIcon("TIRED").color} text-xs`,
                    })}
                    Tired
                  </div>
                </SelectItem>
                <SelectItem value="NEUTRAL">
                  <div className="flex items-center gap-2">
                    {React.createElement(getMoodIcon("NEUTRAL").icon, {
                      className: `${getMoodIcon("NEUTRAL").color} text-xs`,
                    })}
                    Neutral
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => {
                if (checked && pinned) {
                  toast.error("Cannot make pinned entries private");
                  return;
                }
                setIsPrivate(checked);
              }}
              disabled={pinned}
            />
            <label htmlFor="private">Private</label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="pinned"
              checked={pinned}
              onCheckedChange={(checked) => {
                if (checked && isPrivate) {
                  toast.error("Cannot pin private entries");
                  return;
                }
                setPinned(checked);
              }}
              disabled={isPrivate}
            />
            <label htmlFor="pinned">Pin to top</label>
          </div>
        </div>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your entry..."
        />
        <div className="flex items-center justify-end mt-6">
          <Button type="submit" variant="default" className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
