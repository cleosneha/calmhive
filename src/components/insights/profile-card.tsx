"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiUser, FiAward } from "react-icons/fi";
import { useSession } from "@/hooks/useSession";

interface ProfileCardProps {
  userName?: string;
  userEmail?: string;
  badges?: string[];
  isLoading?: boolean;
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ProfileCard({
  userName,
  userEmail,
  badges = [],
  isLoading = false,
}: ProfileCardProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { data } = useSession();
  const user = data?.user;
  const avatar = user?.image;
  const initials = getInitials(userName || user?.name || user?.email || "");

  useEffect(() => {
    // Mark as hydrated after component mounts on client
    const timer = setTimeout(() => setIsHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 h-full">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Your Profile</CardTitle>
            <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 h-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <FiUser className="w-5 h-5" />
            Your Profile
          </CardTitle>

          {/* Avatar on the right side */}
          {isHydrated && avatar ? (
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={avatar}
                alt={`${userName || user?.name || "User"} avatar`}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--ch-sage-dark)] text-white flex items-center justify-center font-bold">
              {initials}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold text-slate-600 mb-1">Name</p>
          <p className="text-base font-medium text-slate-900">
            {userName || user?.name || "User"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {userEmail || user?.email}
          </p>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <FiAward className="w-4 h-4" />
              Achievements
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-[var(--ch-sage-light)]/20 text-[var(--ch-sage-dark)] border-[var(--ch-sage-dark)]/30 hover:bg-[var(--ch-sage-light)]/30"
                >
                  ✨ {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {badges.length === 0 && (
          <div className="text-center py-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">
              Complete milestones to unlock badges
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
