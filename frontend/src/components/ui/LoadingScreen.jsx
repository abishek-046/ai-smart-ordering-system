export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 animate-spin"
             style={{ border: '3px solid rgba(217,119,6,0.15)', borderTopColor: '#d97706' }} />
        <p className="font-display text-lg font-bold text-charcoal-900 mb-1">SmartCanteen</p>
        <p className="text-charcoal-400 text-sm font-body">Loading your experience…</p>
      </div>
    </div>
  );
}
