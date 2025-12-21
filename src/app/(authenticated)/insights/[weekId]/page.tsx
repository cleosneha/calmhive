interface InsightPageProps {
  params: Promise<{ weekId: string }>;
}

export default async function InsightDetailPage({ params }: InsightPageProps) {
  const { weekId } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Week {weekId} Insight
      </h1>

      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-slate-600">
          Loading insight details for week {weekId}...
        </p>
      </div>
    </div>
  );
}
