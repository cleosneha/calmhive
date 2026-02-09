"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import type { GoalSpecificInfo } from "@/types/onboarding";
import { formatHoursHuman } from "@/utils/formatting";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { checkPlanExistence, generatePlan } from "@/actions/plan/plan";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import PlanGenerationLoading from "@/components/plan/plan-generation-loading";

interface Props {
  responses: {
    dateOfBirth: string;
    goals: string;
    goalSpecificInfo: GoalSpecificInfo | null;
    timeAvailability: string;
    activities: string;
    energeticTime: string;
    daysOff: string[];
    additionalNotes: string;
  };
}

export default function OnboardingCompleteClient({ responses }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle back button - redirect to home instead of going back through onboarding
  useEffect(() => {
    const handlePopState = () => {
      router.replace("/");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  const openDialog = (question: string, answer: string) => {
    setSelected({ question, answer });
    setDialogOpen(true);
  };

  const handleContinueJourney = async () => {
    try {
      // Check if plan exists
      const checkResult = await checkPlanExistence();

      if (checkResult.status === "error") {
        toast.error("Failed to check plan existence");
        return;
      }

      // If plan exists, redirect with default loading screen
      if (checkResult.data.exists) {
        router.push("/user/plan");
        return;
      }

      // If plan doesn't exist, show custom plan generation loading screen
      setIsGenerating(true);

      // Generate the plan
      const generateResult = await generatePlan();

      if (generateResult.status === "error") {
        toast.error(generateResult.error || "Failed to generate plan");
        setIsGenerating(false);
        return;
      }

      // Success! Redirect to plan page
      toast.success("Your personalized plan is ready!");
      router.push("/user/plan");
    } catch (error) {
      console.error("Error in handleContinueJourney:", error);
      toast.error("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  // Show plan generation loading screen
  if (isGenerating) {
    return <PlanGenerationLoading />;
  }

  return (
    <div className="min-h-screen  p-4 md:p-8 flex items-center justify-center">
      <div className=" backdrop-blur-sm  ">
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-4xl font-bold text-[var(--ch-sage-dark)] mb-1">
            This is you till now
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ONBOARDING_QUESTIONS.map((question) => {
            // Special handling for goalSpecificInfo
            if (question.key === "goalSpecificInfo") {
              const goalInfo = responses.goalSpecificInfo;
              if (!goalInfo) return null;
              const fullAnswer = goalInfo.answer;
              return (
                <Card
                  key={question.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open details for: ${goalInfo.question}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      openDialog(goalInfo.question, goalInfo.answer);
                    }
                  }}
                  onClick={() => openDialog(goalInfo.question, goalInfo.answer)}
                  className="group relative cursor-pointer hover:shadow-lg transition-transform bg-[var(--ch-sage-light)]/30 gap-2 overflow-hidden"
                >
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
                    <span className="text-white font-medium text-sm md:text-base">
                      View More
                    </span>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-[var(--ch-sage-dark)] leading-relaxed mb-1">
                      {goalInfo.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-1">
                    <p
                      className="text-[var(--foreground)]/80"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {fullAnswer}
                    </p>
                  </CardContent>
                </Card>
              );
            }

            const key = question.key as keyof typeof responses;
            const answerAny = responses[key];
            if (!answerAny) return null;

            // Normalize answer to string
            let answer = Array.isArray(answerAny)
              ? answerAny.join(", ")
              : String(answerAny);

            // Special formatting: if the question is timeAvailability, parse minutes and show human string
            if (key === "timeAvailability") {
              const mins = Number(answer);
              if (!Number.isNaN(mins)) {
                // formatHoursHuman expects hours (float), so convert minutes -> hours
                answer = formatHoursHuman(mins / 60);
              }
            }

            const fullAnswer = answer;
            // Use shortened question text for dateOfBirth on completion page
            const displayQuestion =
              key === "dateOfBirth"
                ? "What is your date of birth?"
                : question.text;

            return (
              <Card
                key={question.key}
                role="button"
                tabIndex={0}
                aria-label={`Open details for: ${displayQuestion}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openDialog(displayQuestion, answer);
                  }
                }}
                onClick={() => openDialog(displayQuestion, answer)}
                className="group relative cursor-pointer hover:shadow-lg transition-transform bg-[var(--ch-sage-light)]/30 gap-2 overflow-hidden"
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
                  <span className="text-white font-medium text-sm md:text-base">
                    View More
                  </span>
                </div>

                <CardHeader>
                  <CardTitle className="text-[var(--ch-sage-dark)] leading-relaxed mb-1">
                    {displayQuestion}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pt-1">
                  <p
                    className="text-[var(--foreground)]/80"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {fullAnswer}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between gap-4">
            {/* Left: CalmHive logo */}
            <div className="flex-shrink-0 flex items-center">
              <Image
                src="/calmhive.png"
                alt="CalmHive Logo"
                width={64}
                height={64}
                className="rounded-md"
                priority
              />
            </div>

            {/* Right: Text + CTA in a vertical column aligned right */}
            <div className="flex-1 flex items-center justify-end">
              <div className="flex flex-col items-end gap-3">
                <p className="text-lg text-[var(--ch-sage-dark)] font-medium text-right">
                  Ready to transform
                </p>
                <Button
                  onClick={handleContinueJourney}
                  disabled={isGenerating}
                  className="bg-[var(--ch-sage-dark)] text-white px-6 py-2 rounded-xl hover:bg-[var(--ch-sage-dark)]/90 transition text-base disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    "Continue your journey"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Read More dialog */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{selected?.question}</AlertDialogTitle>
              <AlertDialogDescription>
                {selected?.answer}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
