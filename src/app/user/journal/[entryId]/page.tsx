import type { JournalEntryPageParams } from "@/types";

export default async function JournalEntryPage({
  params,
}: JournalEntryPageParams) {
  const { entryId } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Journal Entry</h1>

      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-slate-600">Loading journal entry {entryId}...</p>
      </div>
    </div>
  );
}
