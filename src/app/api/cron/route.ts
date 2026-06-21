import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyInsights } from "@/actions/insights/insights";
import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyInsightsEmail } from "@/email/service";
import { aggregateYearData } from "@/utils/insights-aggregation-helper";
import { getCurrentMonthYear } from "@/utils/insights-date-helper";

/**
 * Vercel Cron Job - Weekly Insights Generation
 * Runs every Sunday at 23:59 UTC
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron",
 *     "schedule": "59 23 * * 0"
 *   }]
 * }
 */

export async function GET(request: NextRequest) {
  await connection(); // Mark as dynamic

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      // console.error("[CRON] CRON_SECRET not configured in environment");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    // Verify the request is from Vercel Cron with proper secret
    if (authHeader !== `Bearer ${cronSecret}`) {
      // console.error("[CRON] Unauthorized cron request attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // console.log("[CRON] Weekly insights generation started");

    // Generate insights for all users with plans
    const result = await generateWeeklyInsights();

    if (!result.success) {
      // console.error("[CRON] Insights generation failed:", result.message);
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 },
      );
    }

    // console.log("[CRON] Insights generated successfully:", result.data);

    // Reset all task statuses to pending for the new week
    if (result.data && result.data.created > 0) {
      await resetTaskStatusesForNewWeek();
      // console.log("[CRON] Task statuses reset to pending for new week");
    }

    // Send notification emails to users with insights (always send weekly notification)
    await sendWeeklyInsightsEmails();

    // Aggregate monthly and yearly data for all users
    await aggregateMonthlyDataForAllUsers();

    return NextResponse.json({
      success: true,
      message:
        "Weekly insights generated, tasks reset, monthly data aggregated, and notifications sent",
      data: result.data,
    });
  } catch (error) {
    console.error("[CRON] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Reset all task statuses to pending for the new week
 */
async function resetTaskStatusesForNewWeek(): Promise<void> {
  try {
    // Get all plans with tasks
    const plans = await prisma.plan.findMany({
      select: {
        id: true,
        userId: true,
      },
    });

    // console.log(`[CRON] Resetting task statuses for ${plans.length} plans`);

    let totalTasksReset = 0;

    // Reset all tasks to pending for each plan
    for (const plan of plans) {
      const result = await prisma.task.updateMany({
        where: {
          planId: plan.id,
        },
        data: {
          status: "pending",
          updatedAt: new Date(),
        },
      });

      totalTasksReset += result.count;
    }

    // console.log(`[CRON] Reset ${totalTasksReset} tasks to pending status`);
  } catch (error) {
    console.error("[CRON] Error resetting task statuses:", error);
  }
}

/**
 * Aggregate monthly data for all users with plans
 */
async function aggregateMonthlyDataForAllUsers(): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
      where: {
        plan: {
          isNot: null,
        },
      },
    });

    // console.log(`[CRON] Aggregating monthly data for ${users.length} users`);

    const { year } = getCurrentMonthYear();

    for (const user of users) {
      try {
        // Aggregate data for current year (includes current month)
        await aggregateYearData(user.id, year);
        // console.log( `[CRON] Monthly data aggregated for user ${user.id} for year ${year}`);
      } catch (error) {
        console.error( `[CRON] Error aggregating data for user ${user.id}:`, error);
      }
    }

    // console.log("[CRON] Monthly data aggregation complete");
  } catch (error) {
    console.error("[CRON] Error in monthly data aggregation:", error);
  }
}

async function sendWeeklyInsightsEmails(): Promise<void> {
  try {
    // Get all users with email and name, excluding those who opted out
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
      where: {
        plan: {
          isNot: null,
        },
        stopEmail: false, // Only send to users who haven't opted out
      },
    });

    // console.log( `[CRON] Sending weekly insights emails to ${users.length} users`);

    let successCount = 0;
    let failureCount = 0;

    // Send emails sequentially to avoid overwhelming the email service
    for (const user of users) {
      const result = await sendWeeklyInsightsEmail(
        user.email,
        user.name || "User",
        user.id,
      );

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        // console.error( `[CRON] Failed to send email to ${user.email}: ${result.error}`);
      }

      // Add small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // console.log( `[CRON] Email sending complete: ${successCount} sent, ${failureCount} failed`);
  } catch (error) {
    console.error("[CRON] Error sending weekly insights emails:", error);
  }
}
