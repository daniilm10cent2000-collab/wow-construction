export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-1 text-industrial-muted">
          Dashboard home. Risk Engine, AI Assistant, and reports will appear here.
        </p>
      </div>
      <div className="rounded-xl border border-industrial-border bg-industrial-sidebar/50 p-6">
        <h2 className="text-lg font-medium text-white">Main content area</h2>
        <p className="mt-2 text-sm text-industrial-muted">
          Placeholder for dashboard widgets and content. Database not connected.
        </p>
      </div>
    </div>
  );
}
