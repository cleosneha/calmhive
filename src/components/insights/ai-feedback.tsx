import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BsFillLightbulbFill } from "react-icons/bs";

/**
 * Split text by periods and filter out empty strings
 */
function splitIntoBulletPoints(text: string): string[] {
  return text
    .split(".")
    .map((point) => point.trim())
    .filter((point) => point.length > 0);
}

interface WeekData {
  totalTasks: number;
  completedTasks: number;
  consistencyScore: number;
}

interface AIFeedbackProps {
  suggestion?: string | null;
  weekData?: WeekData | null;
  isLoading?: boolean;
}

export function AIFeedback({
  suggestion,
  weekData,
  isLoading = false,
}: AIFeedbackProps) {
  if (isLoading) {
    return (
      <Card className="bg-[var(--ch-sage-light)] border-[var(--ch-sage-dark)]/10 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BsFillLightbulbFill className="w-5 h-5 text-[var(--ch-sage-dark)]" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-4/5" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--ch-sage-light)]/30 border-[var(--ch-sage-dark)]/10 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BsFillLightbulbFill className="w-5 h-5 text-[var(--ch-sage-dark)]" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestion ? (
          <ul className="space-y-2">
            {splitIntoBulletPoints(suggestion).map((point, index) => (
              <li
                key={index}
                className="flex gap-2 text-sm text-[var(--foreground)]"
              >
                <span className="text-[var(--ch-sage-dark)] font-semibold mt-0.5">
                  •
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            {weekData
              ? `You've completed ${weekData.completedTasks} out of ${weekData.totalTasks} tasks with a ${Math.round(weekData.consistencyScore)}% consistency score. Keep up the great work! AI suggestions will be generated at the end of the week.`
              : "Complete your tasks and journal entries to get personalized AI feedback on your progress and suggestions for improvement."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
