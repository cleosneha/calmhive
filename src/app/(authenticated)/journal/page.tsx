export default function JournalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Journal</h1>
      <p className="text-slate-600 mb-8">Your personal journal entries.</p>

      <div className="grid gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600">
            No journal entries yet. Create your first entry!
          </p>
        </div>
      </div>
    </div>
  );
}
