"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required");
      return;
    }
    onSave({ title, content, mood, pinned, isPrivate });
  };

  const createdAt = entry?.createdAt || new Date();
  const updatedAt = mode === "edit" ? new Date() : undefined;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            placeholder="Heading"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none shadow-none p-0 focus-visible:ring-0"
          />
        </div>
        <div className="mb-4 text-sm text-gray-600">
          Created: {formatDate(createdAt)}
          {updatedAt && <span> | Updated: {formatDate(updatedAt)}</span>}
        </div>
        <Textarea
          placeholder="Write your entry..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-96 mb-4"
        />
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div
                  className="flex items-center space-x-2 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Mood:</span>
                  <Select
                    value={mood}
                    onValueChange={(value: Mood) => setMood(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HAPPY">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("HAPPY").icon, {
                            className: `${getMoodIcon("HAPPY").color} text-lg`,
                          })}
                          Happy
                        </div>
                      </SelectItem>
                      <SelectItem value="SAD">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("SAD").icon, {
                            className: `${getMoodIcon("SAD").color} text-lg`,
                          })}
                          Sad
                        </div>
                      </SelectItem>
                      <SelectItem value="ANGRY">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("ANGRY").icon, {
                            className: `${getMoodIcon("ANGRY").color} text-lg`,
                          })}
                          Angry
                        </div>
                      </SelectItem>
                      <SelectItem value="ANXIOUS">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("ANXIOUS").icon, {
                            className: `${getMoodIcon("ANXIOUS").color} text-lg`,
                          })}
                          Anxious
                        </div>
                      </SelectItem>
                      <SelectItem value="CALM">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("CALM").icon, {
                            className: `${getMoodIcon("CALM").color} text-lg`,
                          })}
                          Calm
                        </div>
                      </SelectItem>
                      <SelectItem value="EXCITED">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("EXCITED").icon, {
                            className: `${getMoodIcon("EXCITED").color} text-lg`,
                          })}
                          Excited
                        </div>
                      </SelectItem>
                      <SelectItem value="TIRED">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("TIRED").icon, {
                            className: `${getMoodIcon("TIRED").color} text-lg`,
                          })}
                          Tired
                        </div>
                      </SelectItem>
                      <SelectItem value="NEUTRAL">
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon("NEUTRAL").icon, {
                            className: `${getMoodIcon("NEUTRAL").color} text-lg`,
                          })}
                          Neutral
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div
                  className="flex items-center space-x-2 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Switch
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <label htmlFor="private">Private</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div
                  className="flex items-center space-x-2 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Switch
                    id="pinned"
                    checked={pinned}
                    onCheckedChange={setPinned}
                  />
                  <label htmlFor="pinned">Pin to top</label>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="submit" variant="default">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
