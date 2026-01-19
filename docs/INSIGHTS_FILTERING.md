# Insights Filtering System - Implementation Summary

## Overview

Added comprehensive filtering system to insights graphs (Time Spent, Completion Rate, Holidays) with support for:

- **Current Month**: Shows weekly data (e.g., 1-7 Mar, 7-14 Mar)
- **Current Year**: Shows monthly data (Jan-Dec) including current month
- **Previous Years**: Shows monthly historical data (Jan-Dec)

## Database Schema

### New Model: `MonthlyInsight`

```prisma
model MonthlyInsight {
  id               Int      @id @default(autoincrement())
  userId           String
  year             Int
  month            Int // 1-12
  totalTasks       Int      @default(0)
  completedTasks   Int      @default(0)
  partialTasks     Int      @default(0)
  averageTimeSpent Float    @default(0)
  completionRate   Float    @default(0)
  holidaysTaken    Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, year, month])
  @@index([userId, year])
  @@map("monthly_insight")
}
```

**Migration**: `20260119081821_add_monthly_insights`

## Core Files Created

### 1. Date Helper (`src/utils/insights-date-helper.ts`)

Handles all date calculations and formatting:

- `getMonthRange()` - Get start/end of a month
- `getYearRange()` - Get start/end of a year
- `getWeeksInMonth()` - Split month into weeks with labels
- `getMonthsInYear()` - Get all month labels (Jan-Dec)
- `getCurrentMonthYear()` - Get current month and year
- `getAvailableYears()` - Get last 5 years for dropdown
- `formatWeekLabel()` - Format week display (1-7 Mar)
- `isDateInWeek()` - Check if date falls in week range

### 2. Aggregation Helper (`src/utils/insights-aggregation-helper.ts`)

Handles data aggregation logic:

- `aggregateMonthlyData()` - Aggregate weekly insights into monthly data
- `upsertMonthlyInsight()` - Store/update monthly insights
- `aggregateYearData()` - Process entire year including current month

### 3. Filtered Data Fetchers (`src/fetchers/insights-filtered.ts`)

Retrieves filtered data based on time periods:

- `getFilteredTimeSpentData()` - Fetch time spent by filter
- `getFilteredCompletionData()` - Fetch completion rate by filter
- `getFilteredHolidaysData()` - Fetch holidays by filter

Internal functions for each metric:

- Current month (weekly)
- Current year (monthly)
- Previous year (monthly)

### 4. Filter UI Component (`src/components/insights/insights-filter.tsx`)

Reusable filter dropdown component:

- Period selector: Current Month / Current Year
- Year selector: Shows when "Current Year" selected
- Available years: Current + last 4 years
- Responsive design with proper styling

## Updated Files

### 1. Cron Job (`src/app/api/cron/route.ts`)

Added monthly aggregation after weekly insights:

```typescript
// Aggregate monthly and yearly data for all users
await aggregateMonthlyDataForAllUsers();
```

New function `aggregateMonthlyDataForAllUsers()`:

- Runs for all users with plans
- Aggregates data for current year (includes current month)
- Stores in `MonthlyInsight` table

### 2. Graph Components

Updated all three graph components with:

- Filter UI in header (top-right)
- Dynamic data fetching based on filters
- State management for period/year filters
- Proper loading states
- Responsive header layout

**Modified Files:**

- `src/components/insights/time-spent-graph.tsx`
- `src/components/insights/completion-trend-graph.tsx`
- `src/components/insights/holidays-graph.tsx`

**New Props:**

- `userId: string` - Required for fetching filtered data
- `initialData?` - Optional initial data
- Removed old `data` prop (now managed internally)

## Data Flow

### 1. Weekly Insights (Existing)

```
User marks tasks → Cron runs Sunday →
Generate weekly insights → Store in `Insight` table
```

### 2. Monthly Aggregation (New)

```
Cron runs Sunday → Aggregate weekly data →
Calculate monthly metrics → Store in `MonthlyInsight` table
```

### 3. Filtering (New)

```
User selects filter → Component fetches data →
Retrieve from Insight (weekly) or MonthlyInsight (monthly) →
Display in graph
```

## Filter Logic

### Current Month

- **X-Axis**: Weeks (e.g., "1-7 Mar", "7-14 Mar")
- **Data Source**: `Insight` table (weekly insights)
- **Range**: Current calendar month

### Current Year

- **X-Axis**: Months (Jan-Dec)
- **Data Source**: `MonthlyInsight` table
- **Range**: January to current month

### Previous Year

- **X-Axis**: Months (Jan-Dec)
- **Data Source**: `MonthlyInsight` table
- **Range**: Full year (Jan-Dec)

## UI Features

### Responsive Design

- Filter dropdowns stack on mobile
- Header wraps properly on small screens
- Consistent spacing and alignment

### Modern Styling

- Sage green theme integration
- Hover states on select items
- Smooth transitions
- Clean dropdown design

### Loading States

- Skeleton loaders for filter dropdown
- Graph skeleton while fetching
- Prevents layout shift

## Usage Example

```tsx
// In page/client component
<TimeSpentGraph
  userId={session.user.id}
  initialData={currentMonthData}
/>

<CompletionTrendGraph
  userId={session.user.id}
  initialData={currentMonthData}
/>

<HolidaysGraph
  userId={session.user.id}
  initialData={currentMonthData}
  totalHolidaysThisWeek={holidayCount}
/>
```

## Benefits

1. **Historical Analysis**: Users can review past performance
2. **Flexible Views**: Switch between weekly/monthly granularity
3. **Performance**: Aggregated monthly data reduces query load
4. **Scalability**: Efficient storage of historical metrics
5. **User Experience**: Intuitive filtering with modern UI

## Next Steps (Optional Enhancements)

1. Add date range picker for custom periods
2. Export graph data to CSV
3. Add comparison mode (compare two periods)
4. Add yearly summary cards
5. Cache filtered data for faster loading

---

**Implementation Date**: January 19, 2026  
**Migration**: `20260119081821_add_monthly_insights`
