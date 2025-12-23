export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
      <p className="text-slate-600 mb-8">
        Manage your account and preferences.
      </p>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Account Settings
            </h3>
            <p className="text-slate-600">
              Manage your account information and preferences.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Notifications
            </h3>
            <p className="text-slate-600">
              Control how you receive notifications.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Privacy
            </h3>
            <p className="text-slate-600">Manage your privacy settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
