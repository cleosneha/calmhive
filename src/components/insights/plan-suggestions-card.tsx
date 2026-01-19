"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { applyPlanSuggestions } from "@/actions/insights/apply-plan-suggestions";
import { toast } from "sonner";

/**
 * Split text by periods and filter out empty strings
 */
function splitIntoBulletPoints(text: string): string[] {
  return text
    .split(".")
    .map((point) => point.trim())
    .filter((point) => point.length > 0);
}

interface PlanSuggestionsCardProps {
  planSuggestions: string | null;
}

export function PlanSuggestionsCard({
  planSuggestions,
}: PlanSuggestionsCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    if (!planSuggestions) return;

    setIsApplying(true);
    try {
      const result = await applyPlanSuggestions(planSuggestions);

      if (result.status === "success") {
        toast.success(
          result.message ||
            "Your plan has been updated based on AI suggestions",
        );

        // Redirect to plan page to see the new plan
        router.push("/user/plan");
      } else {
        toast.error(result.error || "Failed to apply plan suggestions");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsApplying(false);
    }
  };

  const handleReject = () => {
    setIsRejected(true);
    toast.success(
      "Suggestions dismissed. Check back next week for new recommendations!",
    );
  };
  if (!planSuggestions || isRejected) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="w-5 h-5 text-[var(--ch-sage-dark)]" />
            New Plan Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">
              {isRejected
                ? "Suggestions dismissed. Check back next week for new recommendations!"
                : "Complete a week to receive personalized plan suggestions"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[var(--ch-sage-light)] to-white border-[var(--ch-sage-dark)]/20 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Sparkles className="w-5 h-5 text-[var(--ch-sage-dark)]" />
          New Plan Suggestions
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Based on your performance and goals
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggestions Content */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <ul className="space-y-3">
            {splitIntoBulletPoints(planSuggestions).map((point, index) => (
              <li key={index} className="flex gap-2 text-sm text-slate-700">
                <span className="text-[var(--ch-sage-dark)] font-semibold mt-0.5">
                  •
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1 bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/90 text-white disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isApplying}
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Changes
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-slate-500 text-center">
          Review these suggestions and choose to apply them to your next
          week&apos;s plan or keep your current schedule.
        </p>
      </CardContent>
    </Card>
  );
}
