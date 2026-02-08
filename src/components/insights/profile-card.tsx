"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUser } from "react-icons/fi";
import { useSession } from "@/hooks/useSession";

interface ProfileCardProps {
  userName?: string;
  userEmail?: string;
  currentStreak?: number;
  maxStreak?: number;
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
  currentStreak = 0,
  maxStreak = 0,
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

      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="border-b border-slate-200 pb-3">
          <p className="text-sm font-semibold text-slate-600 mb-1">Name</p>
          <p className="text-base font-medium text-slate-900">
            {userName || user?.name || "User"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {userEmail || user?.email}
          </p>
        </div>

        {/* Streak Section */}
        <div className="space-y-2">
          {/* Streak Display - Different layouts for mobile and desktop */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-5 py-3 bg-gradient-to-br from-[var(--ch-sage-light)]/20 to-[var(--ch-sage-light)]/10 rounded-lg border border-[var(--ch-sage-dark)]/20">
            {/* Fire Icon - Top on mobile, Left on desktop */}
            <div className="lg:hidden">
              <Image
                src="/assets/streak.png"
                alt="Streak fire"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="hidden lg:block">
              <Image
                src="/assets/streak.png"
                alt="Streak fire"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>

            {/* Horizontal separator on mobile */}
            <div className="w-full h-px bg-slate-300 lg:hidden" />

            {/* Streak Stats */}
            <div className="flex flex-row lg:flex-row items-center gap-5 lg:gap-6">
              {/* Current Streak */}
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-[var(--ch-sage-dark)]">
                  {currentStreak}
                </p>
                <p className="text-xs lg:text-sm text-slate-600 mt-0.5 font-medium">
                  Current Streak
                </p>
              </div>

              {/* Vertical Separator on desktop */}
              <div className="hidden lg:block w-px h-14 bg-slate-300" />

              {/* Max Streak */}
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-[var(--ch-orange-medium)]">
                  {maxStreak}
                </p>
                <p className="text-xs lg:text-sm text-slate-600 mt-0.5 font-medium">
                  Best Streak
                </p>
              </div>
            </div>
          </div>

          {currentStreak === 0 && maxStreak === 0 && (
            <div className="text-center py-2">
              <p className="text-sm text-slate-500">
                Complete tasks to start your streak! 🔥
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
