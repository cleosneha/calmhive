import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed script to update task statuses for testing insights generation
 * This creates realistic task completion data for the cron job test
 */
async function seedTaskStatus() {
  try {
    const userId = "zvHrU91QLzVGEHlLXAMUTi5EHvEbVaEG"; // Your user ID

    console.log("🌱 Seeding task statuses for insights generation...");

    // Define task completion patterns
    // Format: taskId, status, notes about completion
    const taskUpdates = [
      // Monday - Mix of done and partial
      { id: 1, status: "done", activity: "Intense HIIT Workout" },
      { id: 2, status: "done", activity: "Mindful Breathing Exercise" },

      // Tuesday - One done, one partial
      {
        id: 3,
        status: "partial",
        activity: "Painting Session (Stress Relief)",
      },

      // Wednesday - Both done
      { id: 4, status: "done", activity: "Intense HIIT Workout" },
      { id: 5, status: "partial", activity: "Gratitude Journaling" },

      // Thursday - One done, one pending
      {
        id: 6,
        status: "done",
        activity: "Painting Session (Color Exploration)",
      },

      // Friday - Mix of done and pending
      { id: 7, status: "done", activity: "Intense HIIT Workout" },
      {
        id: 8,
        status: "partial",
        activity: "Guided Meditation for Relaxation",
      },
    ];

    // Update each task
    for (const update of taskUpdates) {
      await prisma.task.update({
        where: { id: update.id },
        data: {
          status: update.status as "pending" | "done" | "partial",
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Updated ${update.activity} → ${update.status}`);
    }

    // Summary
    const tasks = await prisma.task.findMany({
      where: { plan: { userId } },
      select: { id: true, activity: true, status: true, day: true },
    });

    const summary = {
      total: tasks.length,
      done: tasks.filter((t) => t.status === "done").length,
      partial: tasks.filter((t) => t.status === "partial").length,
      pending: tasks.filter((t) => t.status === "pending").length,
    };

    console.log("\n📊 Task Status Summary:");
    console.log(`Total tasks: ${summary.total}`);
    console.log(`✅ Done: ${summary.done}`);
    console.log(`⚠️  Partial: ${summary.partial}`);
    console.log(`⏳ Pending: ${summary.pending}`);

    // Calculate completion rate for reference
    const completionRate =
      ((summary.done + summary.partial * 0.5) / summary.total) * 100;
    console.log(
      `\n📈 Estimated Completion Rate: ${completionRate.toFixed(1)}%`,
    );

    console.log("\n✨ Task seeding complete!");
    console.log(
      "💡 Now you can test the insights generation with realistic data.",
    );
  } catch (error) {
    console.error("❌ Error seeding tasks:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedTaskStatus();
