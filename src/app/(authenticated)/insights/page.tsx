export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Insights</h1>
      <p className="text-slate-600 mb-8">
        Weekly insights from your journal entries.
      </p>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">
          No insights yet. Start journaling to see insights!
        </p>
      </div>
    </div>
  );
}
