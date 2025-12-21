export default function OnboardingCompletePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          You&apos;re All Set!
        </h1>
        <p className="text-slate-600 mb-6">
          Welcome to CalmHive. Your account is ready to use.
        </p>
        <button className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 transition">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
