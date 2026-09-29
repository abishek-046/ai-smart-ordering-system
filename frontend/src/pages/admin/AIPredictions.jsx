import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const LOAD_COLOR = { Low: '#22c55e', Moderate: '#f59e0b', High: '#ef4444' };
const LOAD_BG    = { Low: 'rgba(34,197,94,0.09)', Moderate: 'rgba(245,158,11,0.09)', High: 'rgba(239,68,68,0.09)' };

export default function AIPredictions() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    adminApi.getAIPredictions()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const load       = data?.currentLoad ?? 0;
  const gaugeColor = load > 70 ? '#ef4444' : load > 40 ? '#f59e0b' : '#22c55e';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">AI Kitchen Predictions</h2>
          <p className="text-charcoal-400 font-body text-sm mt-0.5">
            Kitchen load forecast for the next 3 hours
          </p>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm py-2 px-4">🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Current load gauge */}
          <div
            className="card text-center"
            style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.05),rgba(245,158,11,0.02))' }}
          >
            <p className="text-sm text-charcoal-500 font-body mb-4">Current Kitchen Load</p>
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#f0ede6" strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${load}, 100`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display font-bold text-3xl text-charcoal-900">{load}%</p>
                <p className="text-xs text-charcoal-400 font-body">Load</p>
              </div>
            </div>
            <p className="text-sm font-body text-charcoal-600">
              <span className="font-bold text-charcoal-900">{data?.currentActiveOrders ?? 0}</span>
              {' '}active orders in queue
            </p>
          </div>

          {/* Predictions timeline */}
          {data?.predictions?.length > 0 ? (
            <div className="card">
              <h3 className="font-display font-bold text-charcoal-900 mb-5">
                Predicted Load — Next 3 Hours
              </h3>
              <div className="space-y-4">
                {data.predictions.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-bold text-charcoal-700 font-body flex-shrink-0">
                      {p.displayTime}
                    </div>
                    <div className="flex-1">
                      <div className="h-7 bg-charcoal-100 rounded-xl overflow-hidden relative">
                        <div
                          className="h-full rounded-xl flex items-center transition-all duration-700"
                          style={{
                            width: `${p.estimatedLoad}%`,
                            background: LOAD_COLOR[p.loadLabel] || '#9d8d74',
                          }}
                        >
                          {p.estimatedLoad > 15 && (
                            <span className="text-white text-xs font-bold ml-2">{p.estimatedLoad}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{
                        background: LOAD_BG[p.loadLabel] || 'rgba(0,0,0,0.05)',
                        color: LOAD_COLOR[p.loadLabel] || '#9d8d74',
                      }}
                    >
                      {p.loadLabel}
                    </span>
                    <span className="text-xs text-charcoal-400 font-body w-16 text-right flex-shrink-0">
                      {p.orderCount} orders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-14">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-display font-bold text-charcoal-700">Kitchen clear for next 3 hours</p>
              <p className="text-charcoal-400 text-sm font-body mt-1">
                No upcoming orders scheduled
              </p>
            </div>
          )}

          {/* How it works */}
          <div
            className="card"
            style={{ background: '#fdf8f0', border: '1px solid rgba(217,119,6,0.1)' }}
          >
            <h3 className="font-display font-bold text-charcoal-900 mb-3">How Predictions Work</h3>
            <ul className="text-sm text-charcoal-600 space-y-2 font-body">
              <li>• Load is calculated from orders scheduled in each 30-minute window</li>
              <li>• 10 concurrent orders = 100% kitchen load</li>
              <li>• Predictions update every time an order is placed or status changes</li>
              <li>
                • Connect an external ML model by setting{' '}
                <code className="bg-charcoal-100 px-1.5 py-0.5 rounded text-xs font-mono">AI_API_KEY</code>{' '}
                +{' '}
                <code className="bg-charcoal-100 px-1.5 py-0.5 rounded text-xs font-mono">AI_API_URL</code>{' '}
                in <code className="bg-charcoal-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
