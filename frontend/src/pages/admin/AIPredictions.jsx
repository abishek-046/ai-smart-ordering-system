import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const LOAD_COLOR = {
  Low: 'bg-green-400',
  Moderate: 'bg-yellow-400',
  High: 'bg-red-400',
};

export default function AIPredictions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAIPredictions()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🤖 AI Kitchen Predictions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kitchen load forecast for the next 3 hours based on active orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Current load */}
          <div className="card text-center bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
            <p className="text-sm text-gray-500 mb-2">Current Kitchen Load</p>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={data?.currentLoad > 70 ? '#ef4444' : data?.currentLoad > 40 ? '#f59e0b' : '#22c55e'} strokeWidth="3" strokeDasharray={`${data?.currentLoad || 0}, 100`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data?.currentLoad || 0}%</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{data?.currentActiveOrders || 0} active orders in queue</p>
          </div>

          {/* Predictions timeline */}
          {data?.predictions?.length > 0 ? (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Predicted Load — Next 3 Hours</h2>
              <div className="space-y-3">
                {data.predictions.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-semibold text-gray-700 flex-shrink-0">{p.displayTime}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div className={`h-full rounded-lg transition-all ${LOAD_COLOR[p.loadLabel] || 'bg-gray-300'}`} style={{ width: `${p.estimatedLoad}%` }}>
                          <span className="absolute left-2 top-0 bottom-0 flex items-center text-xs font-bold text-white">{p.estimatedLoad}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-20 flex-shrink-0 text-right">
                      <span className={`badge ${p.loadLabel === 'High' ? 'bg-red-100 text-red-700' : p.loadLabel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {p.loadLabel}
                      </span>
                    </div>
                    <div className="w-16 text-right text-xs text-gray-500 flex-shrink-0">{p.orderCount} orders</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-700">Kitchen is clear for the next 3 hours</p>
              <p className="text-gray-400 text-sm mt-1">No upcoming orders scheduled</p>
            </div>
          )}

          <div className="card bg-gray-50">
            <h2 className="font-bold text-gray-900 mb-2">How Predictions Work</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Load is calculated from orders scheduled in each 30-minute window</li>
              <li>• 10 concurrent orders = 100% kitchen load</li>
              <li>• Predictions update every time a new order is placed or status changes</li>
              <li>• AI module can be upgraded by setting <code className="bg-gray-100 px-1 rounded">AI_API_KEY</code> + <code className="bg-gray-100 px-1 rounded">AI_API_URL</code> in <code className="bg-gray-100 px-1 rounded">.env</code></li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
