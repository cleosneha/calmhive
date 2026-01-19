# Weekly Insights Cron Job

Automated weekly insights generation system that runs every Sunday at 23:59 UTC to calculate and store user performance metrics.

## 🎯 Overview

The cron job analyzes user task completion data from the past week and generates:

- **Performance Metrics**: Task completion rates, consistency scores, trending data
- **AI-Generated Suggestions**: Personalized feedback using LLM analysis
- **Historical Tracking**: Week-over-week comparison and progress trends

## 📁 Architecture

```
src/
├── app/api/cron/route.ts          # Vercel cron endpoint
├── actions/insights.ts            # Core calculation logic
└── ai/agents/insights/
    ├── generate-suggestions.ts    # LLM-powered feedback
    ├── index.ts                   # Agent exports
    └── utils/
        └── date-utils.ts          # Week calculation utilities
```

## ⚙️ Setup

### 1. Environment Variables

Add to your `.env`:

```bash
# Generate with: openssl rand -base64 32
CRON_SECRET=your_secure_random_string_here
```

In production (Vercel dashboard), add the same `CRON_SECRET` as an environment variable.

### 2. Vercel Configuration

The `vercel.json` file configures the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "59 23 * * 0"
    }
  ]
}
```

**Schedule**: `59 23 * * 0` = Every Sunday at 23:59 UTC

### 3. Security

The endpoint verifies requests using the `CRON_SECRET`:

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
```

## 📊 Metrics Calculated

### 1. **Total Tasks**

Count of all tasks scheduled during the week

### 2. **Completed Tasks**

Tasks with `status: "done"`

### 3. **Average Time Spent**

Average duration (in hours) per task based on `timeRange` field

### 4. **Consistency Score**

Formula: `(completed + 0.5 * partial) / total * 100`

### 5. **Trending Completion**

Week-over-week change in completion percentage

### 6. **Top Performing Day**

Day of the week with the most completed tasks

### 7. **AI Suggestions**

LLM-generated personalized feedback based on weekly performance

## 🤖 LLM Integration

The system uses Gemini 2.5 Flash Lite to generate contextual suggestions:

```typescript
const suggestions = await generateWeeklySuggestions({
  totalTasks,
  completedTasks,
  partialTasks,
  consistencyScore,
  trendingCompletion,
  topPerformingDay,
  averageTimeSpent,
  tasks,
});
```

### Prompt Strategy

- Celebrates achievements and progress
- Identifies patterns (good and bad)
- Provides 2-3 specific, actionable suggestions
- Empathetic and motivational tone
- Concise (3-4 sentences max)

## 🗄️ Database Schema

The `Insight` model stores weekly data:

```prisma
model Insight {
  id                 Int      @id @default(autoincrement())
  userId             String
  weekStartDate      DateTime
  weekEndDate        DateTime
  totalTasks         Int?
  completedTasks     Int?
  averageTimeSpent   Float?
  consistencyScore   Float?
  trendingCompletion Float?
  topPerformingDay   String?
  suggestions        String?
  createdAt          DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, weekStartDate])
  @@index([userId])
}
```

## 🔄 Workflow

1. **Cron Trigger**: Vercel invokes `/api/cron` every Sunday at 23:59 UTC
2. **Authentication**: Endpoint verifies `CRON_SECRET`
3. **User Discovery**: Fetch all users with existing plans
4. **Task Analysis**: For each user:
   - Query tasks from the past week
   - Calculate performance metrics
   - Generate LLM suggestions
5. **Database Upsert**: Store insights (create or update if exists)
6. **Response**: Return summary of processed users

## 📡 API Usage

### Server Action: `generateWeeklyInsights()`

```typescript
import { generateWeeklyInsights } from "@/actions/insights";

const result = await generateWeeklyInsights();
// {
//   success: true,
//   message: "Weekly insights generated successfully",
//   data: { processed: 45, created: 42, skipped: 3 }
// }
```

### Server Action: `getUserInsights(userId, weekStart)`

```typescript
import { getUserInsights } from "@/actions/insights";

const result = await getUserInsights("user_123", new Date("2026-01-12"));
// {
//   success: true,
//   data: {
//     totalTasks: 28,
//     completedTasks: 22,
//     consistencyScore: 85.7,
//     // ... more fields
//   }
// }
```

### Server Action: `getAllUserInsights(userId)`

```typescript
import { getAllUserInsights } from "@/actions/insights";

const result = await getAllUserInsights("user_123");
// {
//   success: true,
//   data: [
//     { weekStartDate: ..., completedTasks: 22, ... },
//     { weekStartDate: ..., completedTasks: 18, ... },
//     // ... ordered by week (newest first)
//   ]
// }
```

## 🧪 Testing

### Manual Trigger (Development)

You can manually test the cron job:

```bash
curl -X GET http://localhost:3000/api/cron \
  -H "Authorization: Bearer your_cron_secret_here"
```

### Expected Response

```json
{
  "success": true,
  "message": "Weekly insights generated successfully",
  "data": {
    "processed": 45,
    "created": 42,
    "skipped": 3
  }
}
```

## 📈 Performance Considerations

- **Sequential Processing**: Users are processed one-by-one to avoid overwhelming the database and LLM API
- **Skip Empty Plans**: Users without tasks are skipped
- **Upsert Pattern**: Prevents duplicate entries (safe to run multiple times)
- **Fallback Suggestions**: If LLM fails, generates basic text-based suggestions

## 🚨 Error Handling

The system includes comprehensive error handling:

1. **Missing CRON_SECRET**: Returns 500 with config error
2. **Invalid Authorization**: Returns 401 Unauthorized
3. **Database Errors**: Logged and skipped (doesn't block other users)
4. **LLM Failures**: Falls back to template-based suggestions

## 📝 Logs

All operations are logged with the `[INSIGHTS]` and `[CRON]` prefixes:

```
[CRON] Weekly insights generation started
[INSIGHTS] Generating insights for week: 2026-01-12 to 2026-01-18
[INSIGHTS] Created insight for user: user_abc123
[CRON] Insights generated successfully: { processed: 45, created: 42, skipped: 3 }
```

## 🔮 Future Enhancements

- [ ] Email notifications with weekly summary
- [ ] Streak tracking (consecutive weeks of high consistency)
- [ ] Goal-based suggestions (aligned with onboarding data)
- [ ] Comparative analytics (percentile ranking among users)
- [ ] Custom insight generation triggers (on-demand)

## 📚 Related Files

- **Insight Model**: `prisma/schema.prisma`
- **Date Utilities**: `src/ai/agents/insights/utils/date-utils.ts`
- **LLM Config**: `src/ai/config/llm.ts`
- **Cron Endpoint**: `src/app/api/cron/route.ts`
