import db from "@/lib/db";

/**
 * Check if a specific date is marked as a holiday for a user
 */
export async function checkIsHoliday(
  userId: string,
  date: Date,
): Promise<boolean> {
  try {
    const holiday = await db.holiday.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(date.toISOString().split("T")[0]),
        },
      },
    });
    return !!holiday;
  } catch (error) {
    console.error("Error checking holiday:", error);
    return false;
  }
}

/**
 * Get holidays for a specific date range
 */
export async function getHolidaysInRange(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<Date[]> {
  try {
    const holidays = await db.holiday.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
      },
    });
    return holidays.map((h) => h.date);
  } catch (error) {
    console.error("Error getting holidays in range:", error);
    return [];
  }
}
