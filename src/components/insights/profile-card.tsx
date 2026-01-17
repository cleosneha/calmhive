import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiUser, FiAward } from "react-icons/fi";

interface ProfileCardProps {
  userName?: string;
  userEmail?: string;
  badges?: string[];
  isLoading?: boolean;
}

export function ProfileCard({
  userName,
  userEmail,
  badges = [],
  isLoading = false,
}: ProfileCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 h-full">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <FiUser className="w-5 h-5" />
          Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold text-slate-600 mb-1">Name</p>
          <p className="text-base font-medium text-slate-900">
            {userName || "User"}
          </p>
          <p className="text-xs text-slate-500 mt-1">{userEmail}</p>
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
