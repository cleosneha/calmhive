import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BsFillLightbulbFill } from "react-icons/bs";

interface AIFeedbackProps {
  feedback?: string;
  isLoading?: boolean;
}

export function AIFeedback({ feedback, isLoading = false }: AIFeedbackProps) {
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
        <p className="text-sm text-[var(--foreground)] leading-relaxed">
          {feedback ||
            "Complete your tasks and journal entries to get personalized AI feedback on your progress and suggestions for improvement."}
        </p>
      </CardContent>
    </Card>
  );
}
