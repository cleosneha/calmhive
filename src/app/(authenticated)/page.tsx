export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-600 mb-8">Welcome back! Here's your overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">
            Journal Entries
          </h3>
          <p className="text-2xl font-bold text-slate-900">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Plans</h3>
          <p className="text-2xl font-bold text-slate-900">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">
            Insights
          </h3>
          <p className="text-2xl font-bold text-slate-900">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Tasks</h3>
          <p className="text-2xl font-bold text-slate-900">0</p>
        </div>
      </div>
    </div>
  );
}
