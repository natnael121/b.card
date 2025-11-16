import { useState, useEffect } from 'react';
import { getAnalyticsOptOut, setAnalyticsOptOut } from '../services/analytics';
import { Shield, X } from 'lucide-react';

interface AnalyticsOptOutProps {
  onClose: () => void;
}

export default function AnalyticsOptOut({ onClose }: AnalyticsOptOutProps) {
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    setOptedOut(getAnalyticsOptOut());
  }, []);

  const handleToggle = () => {
    const newValue = !optedOut;
    setOptedOut(newValue);
    setAnalyticsOptOut(newValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield size={24} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Privacy Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-700 mb-4">
            This business card uses analytics to track visits and interactions. This helps the card owner understand how their card is being used.
          </p>
          <p className="text-slate-600 text-sm mb-4">
            We collect:
          </p>
          <ul className="text-slate-600 text-sm space-y-2 mb-4 list-disc list-inside">
            <li>Visit timestamps</li>
            <li>Device type</li>
            <li>Approximate location (country)</li>
            <li>Interaction events (downloads, link clicks)</li>
            <li>UTM campaign parameters</li>
          </ul>
          <p className="text-slate-600 text-sm">
            We respect your browser's Do Not Track setting. You can also opt out of analytics below.
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optedOut}
              onChange={handleToggle}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-slate-900 font-medium block">Opt out of analytics</span>
              <span className="text-slate-600 text-sm">
                Disable all tracking for this business card
              </span>
            </div>
          </label>
        </div>

        {navigator.doNotTrack === '1' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 text-sm">
              Your browser's Do Not Track setting is enabled. Analytics are already disabled.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
